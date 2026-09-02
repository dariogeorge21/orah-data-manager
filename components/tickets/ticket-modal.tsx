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
import { FileDown, Copy, Check, ImageDown, Sparkles, QrCode } from "lucide-react";
import DigitalTicket from "./digital-ticket";
import { downloadTicketAsPdf, downloadTicketAsImage } from "@/lib/pdf-generator";
import { toast } from "sonner";

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: any;
  ticketCode: string;
  sequenceNumber: number;
  ticketId?: string;
}

/**
 * Ticket preview modal.
 *
 * The ticket is a fixed 940-wide component. To display it at any viewport
 * we render it at its natural size inside a 940px-wide container and apply
 * a CSS scale transform so it always fills the available modal width without
 * triggering a horizontal scrollbar.
 *
 * The outer wrapper div uses a computed height that equals:
 *   naturalHeight × scale  (where naturalHeight ≈ 300px)
 * so the container doesn't collapse or overflow vertically.
 */
const TICKET_NATURAL_W = 940;
const TICKET_NATURAL_H = 300;

export default function TicketModal({
  open,
  onOpenChange,
  registration,
  ticketCode,
  sequenceNumber,
  ticketId,
}: TicketModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure the available preview container width and derive the scale factor.
  useEffect(() => {
    if (!open) return;

    const update = () => {
      if (containerRef.current) {
        const availW = containerRef.current.offsetWidth;
        setScale(Math.min(1, availW / TICKET_NATURAL_W));
      }
    };

    // Small delay lets the Dialog finish its open animation / layout.
    const id = setTimeout(update, 80);
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(id);
      observer.disconnect();
    };
  }, [open]);

  if (!registration) return null;

  const ticketCanvasId = `preview-ticket-${registration.id}`;
  const cleanName = (registration.name || "Participant").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileNamePdf = `ORAH2K26_Ticket_${cleanName}_${ticketCode}.pdf`;
  const fileNamePng = `ORAH2K26_Ticket_${cleanName}_${ticketCode}.png`;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    toast.info("Generating high-resolution PDF ticket...", { duration: 2000 });
    try {
      const ok = await downloadTicketAsPdf(ticketCanvasId, fileNamePdf);
      if (ok) {
        toast.success("Ticket downloaded successfully as PDF!");
      } else {
        toast.error("Failed to generate PDF ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating PDF ticket");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGeneratingImg(true);
    try {
      const ok = await downloadTicketAsImage(ticketCanvasId, fileNamePng);
      if (ok) {
        toast.success("Ticket image saved successfully!");
      } else {
        toast.error("Failed to generate ticket image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating ticket image");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleCopyCode = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(ticketCode);
      setCopiedCode(true);
      toast.success(`Copied ticket code "${ticketCode}"`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Scaled wrapper height so the container doesn't collapse.
  const scaledH = Math.round(TICKET_NATURAL_H * scale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        Modal sizing:
          • Mobile  → 95vw (near full-width, small horizontal margin)
          • Tablet+ → up to max-w-3xl (768px)
          • Desktop → up to max-w-5xl (1024px)
        The ticket preview scales down inside via CSS transform, never scrolls horizontally.
      */}
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-3xl lg:max-w-5xl rounded-2xl sm:rounded-[32px] border-gray-100 p-5 sm:p-8 shadow-2xl bg-white overflow-y-auto max-h-[95vh]">
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Official Digital Pass
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight">
            ORAH 2K26 Digital Ticket
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-medium">
            Digital admission pass for <strong className="text-gray-900">{registration.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/*
          Ticket preview — dark stage backdrop container.
          The inner div is always 940px wide; transform-origin: top left ensures
          it scales from the left edge and the outer wrapper clips it at scaled height.
        */}
        <div
          ref={containerRef}
          className="my-4 rounded-2xl bg-gray-950 shadow-inner border border-gray-800 overflow-hidden"
          style={{ height: scaledH + 24 /* 12px top + 12px bottom padding */ }}
        >
          <div
            style={{
              width: TICKET_NATURAL_W,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              padding: "12px",
            }}
          >
            <DigitalTicket
              id={ticketCanvasId}
              registration={registration}
              ticketCode={ticketCode}
              sequenceNumber={sequenceNumber}
              ticketId={ticketId}
            />
          </div>
        </div>

        {/* Ticket Code bar */}
        <div className="flex flex-row items-center justify-between gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-xs shrink-0">
              <QrCode className="w-5 h-5 text-gray-700" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Ticket Code
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-gray-900 truncate">
                {ticketCode}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="h-10 px-4 rounded-xl border-gray-200 hover:bg-white text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-2 shrink-0"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </Button>
        </div>

        {/* Download Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            disabled={isGeneratingImg || isGeneratingPdf}
            className="h-12 flex-1 rounded-2xl border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 shadow-xs"
          >
            {isGeneratingImg ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                Exporting PNG...
              </span>
            ) : (
              <>
                <ImageDown className="w-4 h-4 mr-2" />
                Download Image (PNG)
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || isGeneratingImg}
            className="h-12 flex-1 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5"
          >
            {isGeneratingPdf ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating PDF...
              </span>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Download Ticket PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
