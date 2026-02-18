-- Enable RLS (already enabled but good to ensure)
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;

-- Policy: View project resources
-- Visible if user can view the project (which is org-based)
CREATE POLICY "View project resources" ON project_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_resources.project_id 
            AND organization_id = get_auth_org_id()
        )
    );

-- Policy: Manage project resources (Insert/Delete)
-- Only managers/admins of the organization
CREATE POLICY "Manage project resources" ON project_resources
    FOR ALL USING (
        is_manager_or_admin() AND 
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_resources.project_id 
            AND organization_id = get_auth_org_id()
        )
    );
