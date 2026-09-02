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
  venue = "St Thomas College, Palai",
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
    const payload = buildTicketQrPayload({
      ticketId: ticketId || registration.id,
      ticketCode,
      registrationId: registration.id,
      name: registration.name,
      affiliation,
      college: registration.college,
    });

    generateQrCodeDataUrl(payload).then((url) => {
      if (isMounted) setQrCodeDataUrl(url);
    });

    return () => { isMounted = false; };
  }, [ticketId, ticketCode, registration, affiliation]);

  return (
    <div
      id={id}
      className={`relative w-full max-w-[940px] select-none overflow-hidden rounded-[24px] bg-[#E3E0D8] text-gray-900 shadow-2xl transition-all ${className}`}
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

        {/* ================= LEFT SECTION: Concert Live Atmosphere Banner ================= */}
        {/* ================= LEFT SECTION: Event Image Banner ================= */}
        <div className="relative w-[30%] min-w-[140px] max-w-[280px] h-full overflow-hidden bg-[#12131C] shrink-0">
          {/* Stylized Concert Crowd / Stage Lighting — inline hex to avoid lab()/oklch() */}
          <div
            className="absolute inset-0 opacity-95"
            style={{ background: "linear-gradient(to top, #000000, #1E1B2E, #0F172A)" }}
          <img
            src="/ticketBanner.png"
            alt="ORAH 2K26 Banner"
            className="w-full h-full object-cover object-center"
          />

          {/* Stage Light Cones */}
          <div
            className="absolute top-0 left-1/4 w-32 h-64 transform -rotate-12 blur-md"
            style={{ background: "linear-gradient(to bottom, rgba(251,191,36,0.30), rgba(244,63,94,0.10), transparent)" }}
          />
          <div
            className="absolute top-0 right-1/4 w-32 h-64 transform rotate-12 blur-md"
            style={{ background: "linear-gradient(to bottom, rgba(34,211,238,0.30), rgba(99,102,241,0.10), transparent)" }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-48 blur-sm"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.40), rgba(253,230,138,0.20), transparent)" }}
          />

          {/* Concert Crowd Silhouette */}
          <svg
            className="absolute bottom-0 inset-x-0 w-full h-40 text-black/90 pointer-events-none"
            viewBox="0 0 300 160"
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0,160 L0,110 C15,105 25,120 35,95 C45,130 55,90 65,85 C75,115 85,95 95,75 C105,105 115,80 125,70 C135,110 145,85 155,60 C165,100 175,90 185,75 C195,110 205,80 215,85 C225,120 235,95 245,65 C255,105 265,90 275,100 C285,85 295,120 300,105 L300,160 Z" opacity="0.7"/>
            <path d="M0,160 L0,125 C20,120 30,140 45,115 C55,145 70,110 85,105 C100,135 115,115 130,95 C145,125 160,100 175,85 C190,125 205,105 220,90 C235,120 250,110 265,95 C280,130 290,115 300,120 L300,160 Z" opacity="0.9"/>
            {/* Raised hands & arms */}
            <path d="M45,115 Q48,70 52,50 Q56,70 58,115 Z" fill="#000" />
            <path d="M50,55 L42,42 Q46,38 52,48 Z" fill="#000" />
            <path d="M54,52 L62,40 Q66,45 58,54 Z" fill="#000" />
            <path d="M125,95 Q130,45 136,30 Q142,45 146,95 Z" fill="#000" />
            <path d="M132,35 L124,20 Q129,16 135,26 Z" fill="#000" />
            <path d="M138,32 L146,18 Q152,22 144,34 Z" fill="#000" />
            <path d="M210,100 Q215,55 220,38 Q226,55 230,100 Z" fill="#000" />
            <path d="M218,42 L210,28 Q215,24 222,34 Z" fill="#000" />
            <path d="M224,40 L232,25 Q238,30 228,42 Z" fill="#000" />
          </svg>

          {/* Event Brand Tag */}
          <div className="absolute top-4 left-4 z-10 flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 drop-shadow-md">
              JY Pala Presents
            </span>
            <span className="text-xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
              {eventName}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-md border border-white/20">
              Official Pass
            </span>
          </div>
        </div>

        {/* ================= MIDDLE SECTION: Main Ticket Details ================= */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 pl-6 sm:pl-7 relative">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-700">
                WE ARE GOING TO SEE...
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Youth Gathering &amp; Festival
              </p>
            </div>

            <div className="text-right max-w-[200px]">
              <p className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">
                {venue}
              </p>
              <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Pala, Kerala
              </p>
            </div>
          </div>

          {/* Center: Attendee Headline */}
          <div className="my-auto py-1">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none truncate max-w-[420px]"
              title={registration.name}
            >
              {registration.name}
            </h2>
            {institutionText && (
              <p
                className="text-xs sm:text-sm font-semibold text-gray-700 truncate max-w-[400px] mt-1 tracking-tight"
                title={institutionText}
              >
                {institutionText}
              </p>
            )}
          </div>

          {/* Bottom Row: 3 Rounded Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <div className="px-3.5 sm:px-4 py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-xs">
              {date}
            </div>
            <div className="px-3.5 sm:px-4 py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-xs">
              {time}
            </div>
            <div className="px-3.5 sm:px-4 py-1.5 rounded-full border-2 border-gray-900 bg-transparent text-gray-900 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-xs">
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
        <div className="w-[28%] min-w-[150px] max-w-[240px] flex items-center justify-between p-4 sm:p-5 bg-[#DCD9D0] shrink-0 relative overflow-hidden">
          {/* Vertical Barcode & Rotated Ticket Code Strip */}
          <div className="flex items-center gap-2 h-full py-1 shrink-0">
            {/* Vertical Barcode Graphic */}
            <svg className="h-full w-5 sm:w-6 text-gray-900" viewBox="0 0 26 160" preserveAspectRatio="none">
              <rect x="0"  y="0" width="2.5" height="160" fill="currentColor"/>
              <rect x="4"  y="0" width="1.2" height="160" fill="currentColor"/>
              <rect x="6.5" y="0" width="3"   height="160" fill="currentColor"/>
              <rect x="11" y="0" width="1.5" height="160" fill="currentColor"/>
              <rect x="14" y="0" width="1.2" height="160" fill="currentColor"/>
              <rect x="16.5" y="0" width="3.5" height="160" fill="currentColor"/>
              <rect x="21.5" y="0" width="1.8" height="160" fill="currentColor"/>
              <rect x="24.5" y="0" width="1.2" height="160" fill="currentColor"/>
            </svg>

            {/* Vertical Rotated Ticket Code Label */}
            <div className="flex items-center justify-center [writing-mode:vertical-lr] rotate-180 select-none">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600 whitespace-nowrap">
                {ticketCode}
              </span>
            </div>
          </div>

          {/* Right Column: Centered Scannable QR Code & Entry Badge — shifted slightly left */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 pr-2 sm:pr-3 pl-0 h-full">
            <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] bg-white p-1.5 sm:p-2 rounded-2xl shadow-sm border border-gray-300 flex items-center justify-center shrink-0">
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

            <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-700 bg-gray-200/90 border border-gray-300/70 shadow-2xs whitespace-nowrap">
              SCAN AT EVENT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
