-- Enable RLS on project_activities
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Policy to allow viewing activities (everyone in the org should be able to see)
-- Ideally we check if user is in the same org as the project, but for now allow authenticated
CREATE POLICY "Enable read access for authenticated users" ON "project_activities"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Policy to allow inserting/updating/deleting activities
-- Restricted to Admins and Managers
CREATE POLICY "Enable write access for admins and managers" ON "project_activities"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);
