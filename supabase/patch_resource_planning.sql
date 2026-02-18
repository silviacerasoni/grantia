-- 0. Ensure 'accountant' role exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';

-- 1. Add capacity to Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_capacity INTEGER DEFAULT 40;

-- 2. Add Start/End dates to Project Activities (Work Packages)
ALTER TABLE project_activities ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE project_activities ADD COLUMN IF NOT EXISTS end_date DATE;

-- 3. Create Resource Allocations Table (Weekly granularity)
CREATE TABLE IF NOT EXISTS resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES project_activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL, -- Should be the Monday of the week
    hours NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique allocation per user/activity/week
    UNIQUE(user_id, activity_id, week_start_date)
);

-- 4. Enable RLS
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Resource Allocations

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "View own allocations" ON resource_allocations;
DROP POLICY IF EXISTS "Managers view org allocations" ON resource_allocations;
DROP POLICY IF EXISTS "Managers manage allocations" ON resource_allocations;

-- View:
-- Users can see their own allocations
CREATE POLICY "View own allocations" ON resource_allocations
    FOR SELECT USING (user_id = auth.uid());

-- Managers/Admins can see all allocations in their org
-- (Note: resource_allocations -> project_id -> organization_id)
CREATE POLICY "Managers view org allocations" ON resource_allocations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = resource_allocations.project_id 
            AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin', 'accountant')
    );

-- Manage (Insert/Update/Delete):
-- Only Managers/Admins can manage allocations
CREATE POLICY "Managers manage allocations" ON resource_allocations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = resource_allocations.project_id 
            AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
    );
