-- Add coordinator_id column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS coordinator_id UUID REFERENCES profiles(id);

-- Update existing projects to set created_by as coordinator (migration)
UPDATE projects SET coordinator_id = created_by WHERE coordinator_id IS NULL;
