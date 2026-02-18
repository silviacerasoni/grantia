-- POLICY FIX: Allow everyone to read organizations (for demo/onboarding)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of organizations"
ON organizations FOR SELECT
TO public
USING (true);

-- Retry Insertion just in case
INSERT INTO organizations (id, name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grantia Demo Org')
ON CONFLICT (id) DO NOTHING;
