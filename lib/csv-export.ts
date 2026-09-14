import { format } from "date-fns";

export interface CsvColumn<T = any> {
  id: string;
  label: string;
  customHeader?: string;
  category: "personal" | "contact" | "academic" | "location" | "ticket" | "system";
  defaultSelected: boolean;
  getValue: (item: T, index: number) => any;
}

export interface CsvExportOptions {
  filename?: string;
  includeHeader?: boolean;
  delimiter?: "," | ";" | "\t";
  includeBom?: boolean;
  formatDates?: boolean;
}

/**
 * Escapes a cell value for standard CSV compliance (RFC 4180)
 */
export function escapeCsvCell(val: any, delimiter: string = ",", formatDates: boolean = true): string {
  if (val === null || val === undefined) {
    return "";
  }

  let str = String(val);

  // Format boolean
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }

  // Format ISO / Date strings
  if (
    formatDates &&
    typeof val === "string" &&
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(val)
  ) {
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        str = format(d, "yyyy-MM-dd HH:mm:ss");
      }
    } catch {
      // Retain original string if date parsing fails
    }
  }

  // Escape if contains delimiter, double quotes, newline, or carriage return
  if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates a full CSV/TSV string from items and selected columns
 */
export function generateCsvContent<T>(
  items: T[],
  columns: CsvColumn<T>[],
  options: CsvExportOptions = {}
): string {
  const {
    includeHeader = true,
    delimiter = ",",
    includeBom = true,
    formatDates = true,
  } = options;

  const rows: string[] = [];

  if (includeHeader) {
    const headerRow = columns
      .map((col) => escapeCsvCell(col.customHeader?.trim() || col.label, delimiter, false))
      .join(delimiter);
    rows.push(headerRow);
  }

  items.forEach((item, index) => {
    const row = columns
      .map((col) => escapeCsvCell(col.getValue(item, index), delimiter, formatDates))
      .join(delimiter);
    rows.push(row);
  });

  const body = rows.join("\r\n");
  return includeBom ? `\uFEFF${body}` : body;
}

/**
 * Initiates a browser download of the CSV content
 */
export function downloadCsv(
  csvContent: string,
  filename: string = "export.csv"
): boolean {
  try {
    const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", cleanFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to download CSV:", err);
    return false;
  }
}

/**
 * Copies CSV or TSV data directly to clipboard for pasting into Google Sheets / Excel
 */
export async function copyCsvToClipboard(
  items: any[],
  columns: CsvColumn[],
  delimiter: "\t" | "," = "\t"
): Promise<boolean> {
  try {
    const content = generateCsvContent(items, columns, {
      delimiter,
      includeBom: false,
      includeHeader: true,
      formatDates: true,
    });

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }

    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textArea);
    return ok;
  } catch (err) {
    console.error("Failed to copy CSV to clipboard:", err);
    return false;
  }
}
