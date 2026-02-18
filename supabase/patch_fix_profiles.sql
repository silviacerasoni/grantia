-- Drop Foreign Key Constraint to allow demo users without Auth
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert a Dummy Profile if not exists
INSERT INTO profiles (id, full_name, avatar_url, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo User', '', NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant permissions just in case
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
