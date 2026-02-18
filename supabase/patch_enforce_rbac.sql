-- 1. Drop the temporary "Public Access" policies
DROP POLICY IF EXISTS "Public access to projects" ON projects;
DROP POLICY IF EXISTS "Public access to budget_categories" ON project_budget_categories;
DROP POLICY IF EXISTS "Public access to expenses" ON expenses;

-- 2. Ensure RBAC Policies are active (checking schema coverage)

-- PROFILES:
-- View: Only same org
-- Update: Only self or Admin
CREATE POLICY "Update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS:
-- View: Only own (Already in schema)
-- Update: Only Admin
CREATE POLICY "Admin update org" ON organizations
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND organization_id = organizations.id)
    );

-- EXPENSES:
-- (Already defined in schema, just ensuring we didn't break them)
-- "View own expenses"
-- "Managers view all expenses"

-- 3. Grant Permissions to Authenticated Users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
