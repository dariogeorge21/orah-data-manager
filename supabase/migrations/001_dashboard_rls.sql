-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Events: authenticated users can read all events
CREATE POLICY "Authenticated users can read events"
ON events FOR SELECT
TO authenticated
USING (true);

-- Registrations: authenticated users can read, update, delete
CREATE POLICY "Authenticated users can read registrations"
ON registrations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update registrations"
ON registrations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete registrations"
ON registrations FOR DELETE
TO authenticated
USING (true);

-- Tickets: authenticated users can read tickets
CREATE POLICY "Authenticated users can read tickets"
ON tickets FOR SELECT
TO authenticated
USING (true);

-- Check-ins: authenticated users can read check-ins
CREATE POLICY "Authenticated users can read check_ins"
ON check_ins FOR SELECT
TO authenticated
USING (true);

-- Users table logic
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own record"
ON users FOR SELECT
TO authenticated
USING (auth_id = auth.uid());
