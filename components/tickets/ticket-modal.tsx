"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, FileDown, Sparkles, ImageDown, QrCode } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-4xl rounded-[32px] border-gray-100 p-6 sm:p-8 shadow-2xl bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Official Digital Pass
            </span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight">
            ORAH 2K26 Digital Ticket
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-medium">
            Digital admission pass for <strong className="text-gray-900">{registration.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Preview Container */}
        <div className="my-4 p-4 sm:p-6 bg-gray-950 rounded-2xl flex items-center justify-center overflow-x-auto shadow-inner border border-gray-800">
          <div className="min-w-[700px] max-w-[900px] w-full">
            <DigitalTicket
              id={ticketCanvasId}
              registration={registration}
              ticketCode={ticketCode}
              sequenceNumber={sequenceNumber}
              ticketId={ticketId}
            />
          </div>
        </div>

        {/* Ticket Details & Code Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-xs">
              <QrCode className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Ticket Code
              </div>
              <div className="text-base font-mono font-bold text-gray-900">
                {ticketCode}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="h-10 px-4 rounded-xl border-gray-200 hover:bg-white text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-2"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>

        {/* Download Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            disabled={isGeneratingImg || isGeneratingPdf}
            className="h-12 flex-1 rounded-2xl border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 shadow-xs"
          >
            {isGeneratingImg ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></span>
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
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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

