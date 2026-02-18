-- DANGER: This will delete existing planning data
-- Use this if the table schema is broken or missing columns

DROP TABLE IF EXISTS resource_allocations CASCADE;

-- Recreate Table with Correct Schema
CREATE TABLE resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES project_activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    hours NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_id, week_start_date)
);

-- Re-enable RLS
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

-- Re-apply Policies
CREATE POLICY "Managers manage allocations" ON resource_allocations
    FOR ALL USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin') AND
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = resource_allocations.project_id 
            AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "View own allocations" ON resource_allocations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers view all allocations" ON resource_allocations
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin') AND
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = resource_allocations.project_id 
            AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );
