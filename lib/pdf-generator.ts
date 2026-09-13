/**
 * Ticket PDF / Image generator using html-to-image.
 *
 * WHY html-to-image instead of html2canvas:
 *   Tailwind CSS v4 computes design-token colours to modern CSS colour functions
 *   such as `lab()`, `oklch()`, and `oklab()` at runtime.  html2canvas has its own
 *   CSS parser that only supports legacy sRGB syntax and throws
 *   "Attempting to parse an unsupported color function" for any modern function.
 *
 *   html-to-image avoids that parser entirely – it serialises the DOM into an SVG
 *   <foreignObject> and lets the browser render it to a canvas natively, so every
 *   colour function the browser supports is supported automatically.
 */

import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";

/**
 * Capture a DOM element as a high-resolution PNG data URL.
 */
export async function captureElementToDataUrl(
  elementOrId: HTMLElement | string,
  pixelRatio: number = 2.5
): Promise<string | null> {
  const element = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  if (!element) {
    console.error(`[pdf-generator] Element not found.`);
    return null;
  }

  try {
    return await toPng(element, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: "#e3e0d8",
    });
  } catch (err) {
    console.error("[pdf-generator] captureElementToDataUrl failed:", err);
    return null;
  }
}

/**
 * Create a single-page landscape jsPDF instance from a ticket data URL.
 */
export async function createSingleTicketPdf(dataUrl: string): Promise<jsPDF> {
  const img = await loadImage(dataUrl);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const isLandscape = imgW >= imgH;
  const pdfW = isLandscape ? 210 : 100;
  const pdfH = Math.round((imgH * pdfW) / imgW);

  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: [pdfW, pdfH],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH, undefined, "FAST");
  return pdf;
}

/**
 * Combine multiple ticket data URLs into a single multi-page PDF and download.
 */
export async function saveCombinedTicketsPdf(
  dataUrls: string[],
  fileName: string = "ORAH_2K26_Tickets_Combined.pdf"
): Promise<boolean> {
  if (dataUrls.length === 0) return false;

  try {
    const firstImg = await loadImage(dataUrls[0]);
    const imgW = firstImg.naturalWidth;
    const imgH = firstImg.naturalHeight;
    const isLandscape = imgW >= imgH;
    const pdfW = isLandscape ? 210 : 100;
    const pdfH = Math.round((imgH * pdfW) / imgW);

    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: [pdfW, pdfH],
    });

    for (let i = 0; i < dataUrls.length; i++) {
      if (i > 0) {
        pdf.addPage([pdfW, pdfH], isLandscape ? "landscape" : "portrait");
      }
      pdf.addImage(dataUrls[i], "PNG", 0, 0, pdfW, pdfH, undefined, "FAST");
    }

    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error("[pdf-generator] Failed to save combined tickets PDF:", err);
    return false;
  }
}

/**
 * Package multiple tickets into individual PDF files and download as a single ZIP archive.
 */
export async function saveTicketsAsZip(
  items: Array<{ dataUrl: string; fileName: string }>,
  zipFileName: string = "ORAH_2K26_Tickets_Archive.zip"
): Promise<boolean> {
  if (items.length === 0) return false;

  try {
    const zip = new JSZip();

    for (const item of items) {
      const pdf = await createSingleTicketPdf(item.dataUrl);
      const pdfBlob = pdf.output("blob");
      const safeName = item.fileName.endsWith(".pdf") ? item.fileName : `${item.fileName}.pdf`;
      zip.file(safeName, pdfBlob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return true;
  } catch (err) {
    console.error("[pdf-generator] Failed to generate ZIP tickets:", err);
    return false;
  }
}

/**
 * Capture a DOM element as a high-resolution PNG and save it as a PDF ticket.
 *
 * @param elementId  The `id` attribute of the ticket element to capture.
 * @param fileName   Output filename (default: "ORAH_2K26_Ticket.pdf").
 * @returns          `true` on success, `false` on failure.
 */
export async function downloadTicketAsPdf(
  elementId: string,
  fileName: string = "ORAH_2K26_Ticket.pdf"
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[pdf-generator] Element #${elementId} not found in DOM.`);
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#e3e0d8",
    });

    const pdf = await createSingleTicketPdf(dataUrl);
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error("[pdf-generator] Failed to generate PDF ticket:", err);
    return false;
  }
}

/**
 * Capture a DOM element as a high-resolution PNG and trigger a browser download.
 *
 * @param elementId  The `id` attribute of the ticket element to capture.
 * @param fileName   Output filename (default: "ORAH_2K26_Ticket.png").
 * @returns          `true` on success, `false` on failure.
 */
export async function downloadTicketAsImage(
  elementId: string,
  fileName: string = "ORAH_2K26_Ticket.png"
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[pdf-generator] Element #${elementId} not found in DOM.`);
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#e3e0d8",
    });

    const a = document.createElement("a");
    a.download = fileName;
    a.href = dataUrl;
    a.click();
    return true;
  } catch (err) {
    console.error("[pdf-generator] Failed to generate PNG ticket:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve an HTMLImageElement from a data-URL (needed to read naturalWidth/Height). */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
