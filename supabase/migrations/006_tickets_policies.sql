-- ============================================================
-- Migration: 006_tickets_policies.sql
-- Project:   ORAH 2026 — CCT Event Management
-- Created:   2026-09-01
-- ============================================================
-- Apply via: Supabase Dashboard → SQL Editor → Run
--            OR: supabase db push (if using CLI)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Enable INSERT & UPDATE policies for tickets table
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' AND policyname = 'Authenticated users can insert tickets'
    ) THEN
        CREATE POLICY "Authenticated users can insert tickets"
        ON tickets FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' AND policyname = 'Authenticated users can update tickets'
    ) THEN
        CREATE POLICY "Authenticated users can update tickets"
        ON tickets FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- END OF MIGRATION
-- ============================================================

