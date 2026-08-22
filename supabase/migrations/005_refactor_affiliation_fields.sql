-- ============================================================
-- Migration: 005_refactor_affiliation_fields.sql
-- Project:   ORAH 2026 — CCT Event Management
-- Created:   2026-08-16
-- ============================================================
-- Apply via: Supabase Dashboard → SQL Editor → Run
--            OR: supabase db push (if using CLI)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Add new affiliation and institute columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS affiliation text,
    ADD COLUMN IF NOT EXISTS institute text;

-- ────────────────────────────────────────────────────────────
-- STEP 2: Backfill affiliation for existing records and enforce NOT NULL
-- ────────────────────────────────────────────────────────────
UPDATE registrations
SET affiliation = 'College'
WHERE affiliation IS NULL;

ALTER TABLE registrations
    ALTER COLUMN affiliation SET NOT NULL;

-- ────────────────────────────────────────────────────────────
-- STEP 3: Make year_of_study and college nullable
-- (since they are only applicable when affiliation = 'College')
-- ────────────────────────────────────────────────────────────
ALTER TABLE registrations
    ALTER COLUMN year_of_study DROP NOT NULL,
    ALTER COLUMN college DROP NOT NULL;

-- ────────────────────────────────────────────────────────────
-- STEP 4: Update Column Comments
-- ────────────────────────────────────────────────────────────
COMMENT ON COLUMN registrations.affiliation IS
    'Primary participant affiliation (+2 Passout, College, Institutes, Job Seeking, Employed, or custom value).';

COMMENT ON COLUMN registrations.institute IS
    'Institute name if affiliation is Institutes (e.g. IELTS, German, SSC, or a custom value).';

COMMENT ON COLUMN registrations.college IS
    'College the participant attends if affiliation is College (e.g. SJCET, ACP, DMC, STC, or a custom value).';

COMMENT ON COLUMN registrations.year_of_study IS
    'Year of study if affiliation is College (e.g. UG - 1st Year, PG - 2nd Year, or a custom value).';

-- ============================================================
-- END OF MIGRATION
-- ============================================================
