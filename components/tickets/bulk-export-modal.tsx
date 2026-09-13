"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Archive,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
  FileDown,
  Sparkles,
  Users,
  Filter,
} from "lucide-react";
import DigitalTicket from "./digital-ticket";
import {
  captureElementToDataUrl,
  saveCombinedTicketsPdf,
  saveTicketsAsZip,
} from "@/lib/pdf-generator";
import { generateQrCodeDataUrl } from "@/lib/ticket-utils";
import { EnrichedTicketData } from "@/features/actions/tickets";
import { toast } from "sonner";

interface BulkExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTickets: EnrichedTicketData[];
  filteredTickets: EnrichedTicketData[];
}

type ExportFormat = "combined-pdf" | "zip";
type ExportScope = "all" | "filtered";
type ExportStatus = "idle" | "processing" | "completed" | "error";

export default function BulkExportModal({
  open,
  onOpenChange,
  allTickets,
  filteredTickets,
}: BulkExportModalProps) {
  const hasFilter = filteredTickets.length < allTickets.length;
  const [scope, setScope] = useState<ExportScope>(hasFilter ? "filtered" : "all");
  const [format, setFormat] = useState<ExportFormat>("combined-pdf");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    currentName: "",
    currentCode: "",
  });

  // Offscreen ticket currently being rendered
  const [activeItem, setActiveItem] = useState<{
    item: EnrichedTicketData;
    qrUrl: string;
  } | null>(null);

  const abortRef = useRef<boolean>(false);

  // Sync scope if filter changes while closed
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setActiveItem(null);
      abortRef.current = false;
    } else {
      setScope(hasFilter ? "filtered" : "all");
    }
  }, [open, hasFilter]);

  const targetTickets = scope === "filtered" ? filteredTickets : allTickets;
  const targetCount = targetTickets.length;

  const handleCancel = () => {
    abortRef.current = true;
    setStatus("idle");
    setActiveItem(null);
    toast.info("Export cancelled by user");
  };

  const handleStartExport = async () => {
    if (targetCount === 0) {
      toast.error("No tickets to export");
      return;
    }

    setStatus("processing");
    setErrorMessage("");
    abortRef.current = false;
    setProgress({
      current: 0,
      total: targetCount,
      currentName: "",
      currentCode: "",
    });

    try {
      // 1. Preload banner image into browser cache
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = "/ticketBanner.jpeg";
      });

      const capturedDataUrls: string[] = [];
      const capturedZipItems: Array<{ dataUrl: string; fileName: string }> = [];

      for (let i = 0; i < targetCount; i++) {
        if (abortRef.current) {
          return;
        }

        const currentTicket = targetTickets[i];
        const reg = currentTicket.registration;
        const ticketId = currentTicket.ticket?.id || reg.id;

        // Pre-generate QR code data URL
        const qrUrl = await generateQrCodeDataUrl(ticketId, "/jyLogo.png");

        // Update progress UI
        setProgress({
          current: i + 1,
          total: targetCount,
          currentName: reg.name || "Participant",
          currentCode: currentTicket.ticketCode,
        });

        // Mount current ticket in offscreen container
        setActiveItem({ item: currentTicket, qrUrl });

        // Wait for React commit and repaint
        await new Promise((resolve) =>
          requestAnimationFrame(() => setTimeout(resolve, 60))
        );

        if (abortRef.current) return;

        // Capture rendered DOM element
        const dataUrl = await captureElementToDataUrl("bulk-export-render-node", 2.5);

        if (!dataUrl) {
          console.warn(`[BulkExport] Failed to capture ticket for ${reg.name}`);
        } else {
          if (format === "combined-pdf") {
            capturedDataUrls.push(dataUrl);
          } else {
            const cleanName = (reg.name || "Participant").replace(/[^a-zA-Z0-9_-]/g, "_");
            const fileName = `ORAH2K26_Ticket_${cleanName}_${currentTicket.ticketCode}.pdf`;
            capturedZipItems.push({ dataUrl, fileName });
          }
        }

        // Small delay to let browser breathe & garbage collect
        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      if (abortRef.current) return;

      // 2. Package and download
      if (format === "combined-pdf") {
        if (capturedDataUrls.length === 0) {
          throw new Error("No ticket pages could be rendered");
        }
        const suffix = scope === "filtered" ? "_Filtered" : "_All";
        const fileName = `ORAH_2K26_Tickets${suffix}.pdf`;
        const ok = await saveCombinedTicketsPdf(capturedDataUrls, fileName);
        if (!ok) throw new Error("Failed to compile combined PDF document");
      } else {
        if (capturedZipItems.length === 0) {
          throw new Error("No tickets could be packaged into ZIP");
        }
        const suffix = scope === "filtered" ? "_Filtered" : "_All";
        const zipFileName = `ORAH_2K26_Tickets_Archive${suffix}.zip`;
        const ok = await saveTicketsAsZip(capturedZipItems, zipFileName);
        if (!ok) throw new Error("Failed to compile ZIP archive");
      }

      setStatus("completed");
      toast.success(
        `${targetCount} tickets exported successfully as ${
          format === "combined-pdf" ? "Combined PDF" : "ZIP Archive"
        }!`
      );
    } catch (err: any) {
      console.error("[BulkExport] Error during export:", err);
      setStatus("error");
      setErrorMessage(err?.message || "An unexpected error occurred during ticket export");
      toast.error("Export failed. Please check console or try again.");
    } finally {
      setActiveItem(null);
    }
  };

  const percentComplete =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (status === "processing") {
            // Prevent accidental close while running
            return;
          }
          onOpenChange(val);
        }}
      >
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[28px] border border-gray-100 shadow-2xl bg-white">
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 text-white relative">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Batch Export
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              Export Participant Tickets
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              Download digital passes to your device in high-resolution PDF format.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            {/* IDLE VIEW: Options & Setup */}
            {status === "idle" && (
              <div className="space-y-6">
                {/* 1. Scope Selection (if filter is active) */}
                {hasFilter ? (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      1. Select Scope
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScope("filtered")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          scope === "filtered"
                            ? "border-gray-900 bg-gray-50/90 ring-1 ring-gray-900 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5 text-blue-600" />
                            Filtered View
                          </span>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold">
                            {filteredTickets.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Export only participants currently matching your search and filters.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScope("all")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          scope === "all"
                            ? "border-gray-900 bg-gray-50/90 ring-1 ring-gray-900 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-gray-700" />
                            All Tickets
                          </span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 font-bold">
                            {allTickets.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Export every registered participant in the event database.
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50/80 border border-gray-200/70 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-700" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Total Event Roster
                        </div>
                        <div className="text-xs text-gray-500">
                          All registered participants will be exported
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-bold px-3 py-1 bg-white">
                      {allTickets.length} tickets
                    </Badge>
                  </div>
                )}

                {/* 2. Format Selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    2. Select Export Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Combined PDF Option */}
                    <button
                      type="button"
                      onClick={() => setFormat("combined-pdf")}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        format === "combined-pdf"
                          ? "border-gray-900 bg-gray-50/90 ring-1 ring-gray-900 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-2.5">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-gray-900 mb-1 flex items-center justify-between">
                        <span>Combined PDF</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Print Ready
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        One unified multi-page PDF document containing all tickets. Ideal for batch printing.
                      </p>
                    </button>

                    {/* ZIP Archive Option */}
                    <button
                      type="button"
                      onClick={() => setFormat("zip")}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        format === "zip"
                          ? "border-gray-900 bg-gray-50/90 ring-1 ring-gray-900 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-2.5">
                        <Archive className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm text-gray-900 mb-1 flex items-center justify-between">
                        <span>ZIP Archive</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Separate Files
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        A compressed archive containing individual PDF passes named per participant. Ready for emailing.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartExport}
                    className="rounded-xl px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export {targetCount} {targetCount === 1 ? "Ticket" : "Tickets"}
                  </Button>
                </div>
              </div>
            )}

            {/* PROCESSING VIEW */}
            {status === "processing" && (
              <div className="space-y-6 py-2">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 animate-pulse mb-1">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Generating Digital Passes...
                  </h3>
                  <p className="text-xs text-gray-500">
                    Rendering high-resolution vector QR passes. Please keep this tab open.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-600">
                      Processing pass {progress.current} of {progress.total}
                    </span>
                    <span className="text-gray-900 font-bold tabular-nums">
                      {percentComplete}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-200"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>

                {/* Current Participant Item Banner */}
                {progress.currentName && (
                  <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {progress.currentName}
                      </span>
                    </div>
                    {progress.currentCode && (
                      <Badge variant="outline" className="font-mono text-[11px] bg-white">
                        {progress.currentCode}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Cancel Button */}
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="rounded-xl border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel Export
                  </Button>
                </div>
              </div>
            )}

            {/* COMPLETED VIEW */}
            {status === "completed" && (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">Export Complete!</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {targetCount} participant tickets have been exported and downloaded to your device.
                  </p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setStatus("idle");
                      onOpenChange(false);
                    }}
                    className="rounded-xl px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                  >
                    Done
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStatus("idle")}
                    className="rounded-xl px-5 border-gray-200"
                  >
                    Export Again
                  </Button>
                </div>
              </div>
            )}

            {/* ERROR VIEW */}
            {status === "error" && (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">Export Encountered an Issue</h3>
                  <p className="text-xs text-rose-600 max-w-sm mx-auto font-mono bg-rose-50 p-2 rounded-lg border border-rose-100">
                    {errorMessage || "An unexpected error occurred during ticket generation."}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStatus("idle")}
                    className="rounded-xl px-5"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl px-5"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Offscreen Render Container dedicated for sequential ticket capture */}
      <div
        className="fixed left-[-9999px] top-[-9999px] pointer-events-none opacity-0"
        style={{ width: "940px", height: "300px" }}
        aria-hidden="true"
      >
        {activeItem && (
          <DigitalTicket
            id="bulk-export-render-node"
            registration={activeItem.item.registration}
            ticketCode={activeItem.item.ticketCode}
            sequenceNumber={activeItem.item.sequenceNumber}
            ticketId={activeItem.item.ticket?.id || activeItem.item.registration.id}
            qrDataUrl={activeItem.qrUrl}
          />
        )}
      </div>
    </>
  );
}
