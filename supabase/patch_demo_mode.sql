-- DEMO MODE: Allow public access to core tables to bypass Auth requirements
-- WARNING: This is for demonstration purposes only. Do not use in production.

-- Projects
CREATE POLICY "Public access to projects" ON projects
    FOR ALL USING (true) WITH CHECK (true);

-- Profiles (Needed to see team members)
CREATE POLICY "Public read profiles" ON profiles
    FOR SELECT USING (true);

-- Project Resources
CREATE POLICY "Public access to project_resources" ON project_resources
    FOR ALL USING (true) WITH CHECK (true);

-- Resource Allocations
CREATE POLICY "Public access to resource_allocations" ON resource_allocations
    FOR ALL USING (true) WITH CHECK (true);

-- Activities
CREATE POLICY "Public access to project_activities" ON project_activities
    FOR ALL USING (true) WITH CHECK (true);
