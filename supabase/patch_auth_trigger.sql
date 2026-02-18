-- Trigger to handle New User Signup
-- 1. Create a Profile
-- 2. (Optional) Create an Organization if it's the first user, or handle via UI?
-- For this MVP, we will assume every signup creates a new Organization for now (SaaS style), 
-- OR we just create the profile and let them create/join org later.

-- Let's do: Create Profile + Create Organization (using metadata)

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
  full_name TEXT;
BEGIN
  -- Get metadata
  org_name := new.raw_user_meta_data->>'org_name';
  full_name := new.raw_user_meta_data->>'full_name';

  -- Default fallback
  IF org_name IS NULL THEN org_name := 'My Organization'; END IF;

  -- 1. Create Organization
  INSERT INTO public.organizations (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;

  -- 2. Create Profile linked to Org
  INSERT INTO public.profiles (id, organization_id, role, full_name, email)
  VALUES (new.id, new_org_id, 'admin', full_name, new.email); 
  -- First user is Admin of their own org

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
