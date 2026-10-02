-- ==============================================================================
-- ORAH 2026 — Comprehensive Database Schema
-- File: supabase/supabase_schema.sql
-- Description: Complete, consolidated Supabase schema for ORAH Response Manager.
--              Contains extensions, custom types, tables, relations, indexes,
--              triggers for timestamps and auth syncing, and Row Level Security (RLS) policies.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. CUSTOM TYPES & ENUMS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('ACCEPTING', 'CLOSED', 'UPCOMING', 'COMPLETED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_type') THEN
        CREATE TYPE registration_type AS ENUM ('ONLINE', 'SPOT');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. TABLES
-- ------------------------------------------------------------------------------

-- 3.1 EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    location TEXT,
    event_date TIMESTAMPTZ,
    status event_status NOT NULL DEFAULT 'ACCEPTING'::event_status,
    max_capacity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_type registration_type NOT NULL DEFAULT 'ONLINE'::registration_type,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    gender TEXT NOT NULL,
    affiliation TEXT NOT NULL,
    institute TEXT,
    college TEXT,
    year_of_study TEXT,
    parish TEXT NOT NULL,
    diocese TEXT NOT NULL,
    confirmed BOOLEAN NOT NULL DEFAULT false,
    address TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    checked_in_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 USERS (ADMIN / STAFF PROFILES) TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. COLUMN COMMENTS & DOCUMENTATION
-- ------------------------------------------------------------------------------
COMMENT ON TABLE public.events IS 'Stores conference and event details.';
COMMENT ON TABLE public.registrations IS 'Participant registration submissions for events.';
COMMENT ON TABLE public.tickets IS 'Digital and issued tickets linked to registrations.';
COMMENT ON TABLE public.check_ins IS 'Check-in event audit log for attendees scanning tickets at venues.';
COMMENT ON TABLE public.users IS 'Internal app users and managers associated with Supabase Auth.';

COMMENT ON COLUMN public.registrations.affiliation IS 'Primary participant affiliation (+2 Passout, College, Institutes, Job Seeking, Employed, or custom value).';
COMMENT ON COLUMN public.registrations.institute IS 'Institute name if affiliation is Institutes (e.g. IELTS, German, SSC, or a custom value).';
COMMENT ON COLUMN public.registrations.college IS 'College the participant attends if affiliation is College (e.g. SJCET, ACP, DMC, STC, or a custom value).';
COMMENT ON COLUMN public.registrations.year_of_study IS 'Year of study if affiliation is College (e.g. UG - 1st Year, PG - 2nd Year, or a custom value).';

-- ------------------------------------------------------------------------------
-- 5. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON public.registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON public.tickets(registration_id);
CREATE INDEX IF NOT EXISTS idx_tickets_token_hash ON public.tickets(token_hash);
CREATE INDEX IF NOT EXISTS idx_check_ins_ticket_id ON public.check_ins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON public.check_ins(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_registrations_updated_at ON public.registrations;
CREATE TRIGGER trigger_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON public.tickets;
CREATE TRIGGER trigger_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. AUTH USER SYNC TRIGGER (OPTIONAL / CONVENIENCE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_id = EXCLUDED.auth_id,
        full_name = CASE WHEN public.users.full_name IS NULL OR public.users.full_name = '' THEN EXCLUDED.full_name ELSE public.users.full_name END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8.1 EVENTS POLICIES
DROP POLICY IF EXISTS "Authenticated users can read events" ON public.events;
CREATE POLICY "Authenticated users can read events"
    ON public.events FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
CREATE POLICY "Authenticated users can manage events"
    ON public.events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8.2 REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "Authenticated users can read registrations" ON public.registrations;
CREATE POLICY "Authenticated users can read registrations"
    ON public.registrations FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert registrations" ON public.registrations;
CREATE POLICY "Authenticated users can insert registrations"
    ON public.registrations FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update registrations" ON public.registrations;
CREATE POLICY "Authenticated users can update registrations"
    ON public.registrations FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete registrations" ON public.registrations;
CREATE POLICY "Authenticated users can delete registrations"
    ON public.registrations FOR DELETE
    TO authenticated
    USING (true);

-- 8.3 TICKETS POLICIES
DROP POLICY IF EXISTS "Authenticated users can read tickets" ON public.tickets;
CREATE POLICY "Authenticated users can read tickets"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert tickets" ON public.tickets;
CREATE POLICY "Authenticated users can insert tickets"
    ON public.tickets FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update tickets" ON public.tickets;
CREATE POLICY "Authenticated users can update tickets"
    ON public.tickets FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8.4 CHECK-INS POLICIES
DROP POLICY IF EXISTS "Authenticated users can read check_ins" ON public.check_ins;
CREATE POLICY "Authenticated users can read check_ins"
    ON public.check_ins FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert check_ins" ON public.check_ins;
CREATE POLICY "Authenticated users can insert check_ins"
    ON public.check_ins FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 8.5 USERS POLICIES
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
CREATE POLICY "Users can view their own record"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
CREATE POLICY "Users can update their own record"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());
