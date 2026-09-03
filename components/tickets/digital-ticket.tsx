"use client";

import React, { useEffect, useState } from "react";
import { generateQrCodeDataUrl, buildTicketQrPayload } from "@/lib/ticket-utils";

export interface DigitalTicketProps {
  id?: string;
  registration: {
    id: string;
    name: string;
    affiliation?: string | null;
    college?: string | null;
    institute?: string | null;
    year_of_study?: string | null;
  };
  ticketCode: string;
  sequenceNumber: number;
  ticketId?: string;
  eventName?: string;
  venue?: string;
  date?: string;
  time?: string;
  className?: string;
}

export default function DigitalTicket({
  id = "digital-ticket-canvas",
  registration,
  ticketCode,
  sequenceNumber,
  ticketId,
  eventName = "ORAH 2K26",
  venue = "St Thomas College",
  date = "SEP 19",
  time = "5:00 PM",
  className = "",
}: DigitalTicketProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const formattedSeq =
    sequenceNumber < 10
      ? `00${sequenceNumber}`
      : sequenceNumber < 100
      ? `0${sequenceNumber}`
      : `${sequenceNumber}`;

  // Resolve affiliation / college text
  const affiliation = registration.affiliation?.trim() || "College";
  let institutionText = "";
  if (affiliation === "College" && registration.college) {
    institutionText = registration.college;
  } else if (affiliation === "Institutes" && registration.institute) {
    institutionText = `${registration.institute} Institute`;
  } else if (affiliation) {
    institutionText = affiliation;
  }

  useEffect(() => {
    let isMounted = true;
    const qrContent = ticketId || registration.id;

    generateQrCodeDataUrl(qrContent).then((url) => {
      if (isMounted) setQrCodeDataUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [ticketId, registration.id]);

  return (
    <div
      id={id}
      className={`relative w-full max-w-[940px] select-none overflow-hidden rounded-r-[24px] rounded-l-none bg-[#E3E0D8] text-gray-900 shadow-2xl transition-all ${className}`}
      style={{
        aspectRatio: "940 / 300",
        minHeight: "270px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Background subtle texture overlay — inline rgba to avoid oklch issues */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)" }}
      />

      <div className="flex h-full w-full">

        {/* ================= LEFT SECTION: Event Image Banner (Square, No Rounded Corners) ================= */}
        <div className="relative h-full aspect-square overflow-hidden bg-[#12131C] shrink-0 rounded-none">
          <img
            src="/ticketBanner.jpeg"
            alt="ORAH 2K26 Banner"
            className="w-full h-full object-cover object-center rounded-none"
          />
        </div>

        {/* ================= MIDDLE SECTION: Main Ticket Details ================= */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 pl-5 sm:pl-6 pr-6 sm:pr-8 relative overflow-hidden">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-700">
                LET'S GATHER AT...
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Youth Gathering
              </p>
            </div>

            <div className="text-right max-w-[180px] shrink-0">
              <p className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">
                {venue}
              </p>
              <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Pala, Kottayam
              </p>
            </div>
          </div>

          {/* Center: Attendee Headline */}
          <div className="my-auto py-1">
            <h2
              className="text-2xl sm:text-3xl pb-2 lg:text-4xl font-black text-gray-900 tracking-tight leading-none truncate max-w-[380px]"
              title={registration.name}
            >
              {registration.name}
            </h2>
            {institutionText && (
              <p
                className="text-xs sm:text-sm font-semibold text-gray-700 truncate max-w-[400px] mt-1 tracking-tight leading-snug line-clamp-2 break-words"
                title={institutionText}
              >
                {institutionText}
              </p>
            )}
          </div>

          {/* Bottom Row: 3 Rounded Pill Badges with clean breathing room on the right */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            <div className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
              {date}
            </div>
            <div className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
              {time}
            </div>
            <div className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
              PASS #{formattedSeq}
            </div>
          </div>
        </div>

        {/* ================= PERFORATION NOTCHES & DIVIDER ================= */}
        <div className="relative w-0 flex flex-col justify-between items-center shrink-0">
          {/* Top Notch Cutout */}
          <div className="w-6 h-6 rounded-full bg-black -mt-3 shadow-inner z-20" />
          {/* Perforation Dashed Line */}
          <div className="w-0 flex-1 border-r-2 border-dashed border-gray-400 my-1 z-10" />
          {/* Bottom Notch Cutout */}
          <div className="w-6 h-6 rounded-full bg-black -mb-3 shadow-inner z-20" />
        </div>

        {/* ================= RIGHT SECTION: Stub — Vertical Barcode & Centered QR ================= */}
        <div className="w-[28%] min-w-[150px] max-w-[240px] flex items-center justify-between px-3.5 sm:px-4 py-3 sm:py-4 bg-[#DCD9D0] shrink-0 relative overflow-hidden">
          {/* Vertical Barcode & Rotated Ticket Code Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 h-full py-1 shrink-0">
            {/* Vertical Barcode Graphic */}
            <svg className="h-full w-5 sm:w-5.5 text-gray-900" viewBox="0 0 26 160" preserveAspectRatio="none">
              <rect x="0" y="0" width="2.5" height="160" fill="currentColor" />
              <rect x="4" y="0" width="1.2" height="160" fill="currentColor" />
              <rect x="6.5" y="0" width="3" height="160" fill="currentColor" />
              <rect x="11" y="0" width="1.5" height="160" fill="currentColor" />
              <rect x="14" y="0" width="1.2" height="160" fill="currentColor" />
              <rect x="16.5" y="0" width="3.5" height="160" fill="currentColor" />
              <rect x="21.5" y="0" width="1.8" height="160" fill="currentColor" />
              <rect x="24.5" y="0" width="1.2" height="160" fill="currentColor" />
            </svg>

            {/* Vertical Rotated Ticket Code Label */}
            <div className="flex items-center justify-center [writing-mode:vertical-lr] rotate-180 select-none">
              <span className="text-[8px] sm:text-[8.5px] font-mono font-bold uppercase tracking-widest text-gray-600 whitespace-nowrap">
                {ticketCode}
              </span>
            </div>
          </div>

          {/* Right Column: JY Logo, Centered Large Scannable QR Code & Entry Badge */}
          <div className="flex-1 flex flex-col items-center justify-between py-0.5 pl-1.5 sm:pl-2 pr-1 h-full">
            {/* Jesus Youth Logo */}
            <div className="w-12 h-12">
              <img
                src="/jyLogo.png"
                alt="Jesus Youth Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>

            {/* Large Scannable QR Code */}
            <div className="w-[208px] h-[208px] sm:w-[118px] sm:h-[118px] bg-white p-1.5 rounded-2xl shadow-sm border border-gray-300 flex items-center justify-center shrink-0">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR code for ${ticketCode}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
              )}
            </div>

            {/* Entry Badge */}
            <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider text-gray-700 bg-gray-200/90 border border-gray-300/70 shadow-2xs whitespace-nowrap">
              SCAN AT EVENT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
