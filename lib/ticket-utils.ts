import QRCode from "qrcode";
import { Registration } from "@/types/registration";

/**
 * College code mapping for standard institutions
 */
export const COLLEGE_CODE_MAP: Record<string, string> = {
  "St Thomas College, Pala": "STC",
  "St. Thomas College, Pala": "STC",
  "St Thomas College": "STC",
  "St Joseph's College of Engineering and Technology, Choondacherry": "SJCET",
  "St. Joseph's College of Engineering and Technology, Choondacherry": "SJCET",
  "SJCET": "SJCET",
  "St Joseph's Institute of Hotel Management and Catering Technology, Choondacherry": "SJIHMCT",
  "Alphonsa College, Pala": "ACP",
  "Alphonsa College": "ACP",
  "Devamatha College, Kuravilangad": "DMC",
  "Devamatha College": "DMC",
  "St Joseph's College, Moolamattom": "SJCM",
  "St. Joseph's College, Moolamattom": "SJCM",
  "St George's College, Aruvithura": "SGC",
  "St. George's College, Aruvithura": "SGC",
  "St Stephen's College, Uzhavoor": "SSC",
  "St. Stephen's College, Uzhavoor": "SSC",
  "Bishop Vayalil Memorial Holy Cross College, Cherpunkal": "BVM",
  "Holy Cross College, Cherpunkal": "BVM",
  "Mar Augusthinose College, Ramapuram": "MAC",
};

/**
 * Derives a clean, recognizable uppercase code for the affiliation/college
 */
export function getAffiliationCode(reg: Partial<Registration>): string {
  const affiliation = (reg.affiliation || "").trim();
  const college = (reg.college || "").trim();
  const institute = (reg.institute || "").trim();

  // If college affiliation
  if (affiliation.toLowerCase() === "college" || (!affiliation && college)) {
    if (college && COLLEGE_CODE_MAP[college]) {
      return COLLEGE_CODE_MAP[college];
    }
    // Check partial match in map
    for (const [key, code] of Object.entries(COLLEGE_CODE_MAP)) {
      if (college && (college.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(college.toLowerCase()))) {
        return code;
      }
    }
    if (college) {
      // Create acronym from college name (words >= 2 letters, skipping common stop words)
      const stopWords = new Set(["of", "and", "the", "in", "at", "for"]);
      const words = college
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 0 && !stopWords.has(w.toLowerCase()));
      if (words.length > 1) {
        return words.map((w) => w[0].toUpperCase()).slice(0, 5).join("");
      }
      return college.slice(0, 4).toUpperCase();
    }
    return "COL";
  }

  // If institutes
  if (affiliation.toLowerCase() === "institutes" || (!affiliation && institute)) {
    if (institute) {
      const cleanInst = institute.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      return cleanInst.slice(0, 5);
    }
    return "INST";
  }

  // Other known affiliations
  if (affiliation === "+2 Passout" || affiliation === "+2") {
    return "PLUS2";
  }
  if (affiliation.toLowerCase() === "job seeking") {
    return "JOBSEEK";
  }
  if (affiliation.toLowerCase() === "employed") {
    return "EMP";
  }

  if (affiliation) {
    const clean = affiliation.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return clean.slice(0, 6);
  }

  return "GEN";
}

/**
 * Formats a 3-digit or 4-digit zero-padded registration number
 */
export function formatRegistrationNumber(num: number): string {
  if (num < 10) return `00${num}`;
  if (num < 100) return `0${num}`;
  return `${num}`;
}

/**
 * Generates an aesthetic and unique ticket code:
 * E.g., ORAH-STC-053 or ORAH-X9K-SJCET-007
 */
export function generateTicketCode(
  reg: Partial<Registration>,
  sequenceNumber: number,
  ticketIdOrToken?: string
): {
  code: string;
  displayCode: string;
  affiliationCode: string;
  formattedNumber: string;
  salt: string;
} {
  const affiliationCode = getAffiliationCode(reg);
  const formattedNumber = formatRegistrationNumber(sequenceNumber);

  // Generate a deterministic 3-character uppercase alphanumeric salt from ticketId/reg.id
  const seed = (ticketIdOrToken || reg.id || `${sequenceNumber}`).replace(/[^a-zA-Z0-9]/g, "");
  let salt = "ORH";
  if (seed.length >= 3) {
    salt = seed.slice(-3).toUpperCase();
  }

  const code = `ORAH-${affiliationCode}-${formattedNumber}`;
  const displayCode = `ORAH · ${affiliationCode} · ${formattedNumber}`;

  return {
    code,
    displayCode,
    affiliationCode,
    formattedNumber,
    salt,
  };
}

/**
 * Generates QR code as base64 Data URL
 */
export async function generateQrCodeDataUrl(content: string): Promise<string> {
  try {
    return await QRCode.toDataURL(content, {
      width: 400,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    return "";
  }
}

/**
 * Builds standard verification QR payload string
 */
export function buildTicketQrPayload(params: {
  ticketId: string;
  ticketCode: string;
  registrationId: string;
  name: string;
  affiliation: string;
  college?: string | null;
}): string {
  return JSON.stringify({
    app: "ORAH2K26",
    tid: params.ticketId,
    code: params.ticketCode,
    rid: params.registrationId,
    name: params.name,
    inst: params.college || params.affiliation,
  });
}

