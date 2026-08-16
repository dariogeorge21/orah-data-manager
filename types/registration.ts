export type AffiliationType =
  | "+2 Passout"
  | "College"
  | "Institutes"
  | "Job Seeking"
  | "Employed"
  | string;

export interface Registration {
  id: string;
  event_id: string;
  registration_type: "ONLINE" | "SPOT" | string;
  name: string;
  dob?: string | null;
  phone: string;
  email: string;
  gender: string;
  affiliation: string;
  institute?: string | null;
  college?: string | null;
  year_of_study?: string | null;
  parish: string;
  diocese: string;
  confirmed?: boolean;
  address: string;
  created_at: string;
  updated_at?: string;
}

export const AFFILIATION_OPTIONS = [
  "+2 Passout",
  "College",
  "Institutes",
  "Job Seeking",
  "Employed",
  "Other",
] as const;

export const INSTITUTE_OPTIONS = [
  "IELTS",
  "German",
  "SSC",
  "Other",
] as const;

export const COLLEGE_OPTIONS = [
  "St Joseph's College of Engineering and Technology, Choondacherry",
  "St Joseph's Institute of Hotel Management and Catering Technology, Choondacherry",
  "Alphonsa College, Pala",
  "Devamatha College, Kuravilangad",
  "St Thomas College, Pala",
  "St Joseph's College, Moolamattom",
  "St George's College, Aruvithura",
  "St Stephen's College, Uzhavoor",
  "Bishop Vayalil Memorial Holy Cross College, Cherpunkal",
  "Mar Augusthinose College, Ramapuram",
  "Other",
] as const;

export const YEAR_OPTIONS = [
  "UG - 1st Year",
  "UG - 2nd Year",
  "UG - 3rd Year",
  "UG - 4th Year",
  "PG - 1st Year",
  "PG - 2nd Year",
  "Other",
] as const;

export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
] as const;
