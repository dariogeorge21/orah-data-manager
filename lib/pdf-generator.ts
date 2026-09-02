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
    // 1. Render the element to a 3× resolution PNG data-URL via native browser canvas.
    const dataUrl = await toPng(element, {
      pixelRatio: 3,
      cacheBust: true,
      // Ensure the background is never transparent so the ticket colours show correctly.
      backgroundColor: "#e3e0d8",
    });

    // 2. Measure the rendered image to compute the PDF page size.
    const img = await loadImage(dataUrl);
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Landscape page whose width is 210 mm (A4 width) – height scales proportionally.
    const isLandscape = imgW >= imgH;
    const pdfW = isLandscape ? 210 : 100;
    const pdfH = Math.round((imgH * pdfW) / imgW);

    // 3. Build the PDF and embed the image.
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: [pdfW, pdfH],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH, undefined, "FAST");
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
