-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum Types for Status and Roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Organizations Table (Multi-tenancy root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profiles Table (Extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    role user_role DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    code TEXT, -- Grant Agreement Number
    description TEXT,
    start_date DATE,
    end_date DATE,
    total_budget NUMERIC(12, 2) DEFAULT 0.00,
    status project_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Project Activities (Work Packages / Tasks)
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "WP1 - Project Management"
    code TEXT, -- e.g., "WP1"
    description TEXT,
    budget_allocated NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Project Resources (Allocations)
CREATE TABLE project_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role_in_project TEXT, -- e.g., "Researcher", "PM"
    allocation_percentage NUMERIC(5, 2) DEFAULT 100.00, -- e.g., 50.00%
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 7. Expenses Table
CREATE TYPE payment_status AS ENUM ('pending_payment', 'paid', 'reconciled');

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    activity_id UUID REFERENCES project_activities(id),
    user_id UUID REFERENCES profiles(id) NOT NULL, -- Who incurred the expense
    category TEXT NOT NULL, -- e.g., "Travel", "Equipment"
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL, -- Gross Amount
    currency TEXT DEFAULT 'EUR',
    date DATE NOT NULL,
    
    -- Accounting Fields
    vat_rate NUMERIC(5, 2) DEFAULT 0.00,
    -- VAT Amount calculated from Gross: Amount * Rate / (100 + Rate)
    vat_amount NUMERIC(10, 2) GENERATED ALWAYS AS (amount * vat_rate / (100 + vat_rate)) STORED,
    -- Net Amount: Amount - VAT Amount
    net_amount NUMERIC(10, 2) GENERATED ALWAYS AS (amount * 100 / (100 + vat_rate)) STORED,
    
    payment_status payment_status DEFAULT 'pending_payment',
    payment_date DATE,
    
    receipt_url TEXT, -- Link to Storage
    status request_status DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Timesheets Table
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) NOT NULL,
    activity_id UUID REFERENCES project_activities(id),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    date DATE NOT NULL,
    hours NUMERIC(4, 2) NOT NULL, -- e.g. 8.00
    description TEXT,
    status request_status DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Helper function to get current user's org ID
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
    SELECT role IN ('manager', 'admin') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Organizations: Users can view their own organization
CREATE POLICY "View own organization" ON organizations
    FOR SELECT USING (id = get_auth_org_id());

-- Profiles: Users can view profiles in their organization
CREATE POLICY "View org profiles" ON profiles
    FOR SELECT USING (organization_id = get_auth_org_id());

-- Projects: Users can view projects in their organization
CREATE POLICY "View org projects" ON projects
    FOR SELECT USING (organization_id = get_auth_org_id());
    
-- Managers/Admins can insert/update projects
CREATE POLICY "Manage projects" ON projects
    FOR ALL USING (is_manager_or_admin() AND organization_id = get_auth_org_id());

-- Activities: Visible to org
CREATE POLICY "View org activities" ON project_activities
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_activities.project_id AND organization_id = get_auth_org_id())
    );

-- Expenses:
-- Users can see their own expenses
CREATE POLICY "View own expenses" ON expenses
    FOR SELECT USING (user_id = auth.uid());
-- Managers can see all expenses in org
CREATE POLICY "Managers view all expenses" ON expenses
    FOR SELECT USING (is_manager_or_admin() AND EXISTS (SELECT 1 FROM projects WHERE id = expenses.project_id AND organization_id = get_auth_org_id()));
-- Users can insert their own expenses
CREATE POLICY "Insert own expenses" ON expenses
    FOR INSERT WITH CHECK (user_id = auth.uid());
-- Users can update own pending expenses
CREATE POLICY "Update own pending expenses" ON expenses
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');
-- Managers can approve/reject (update status)
CREATE POLICY "Managers update expenses" ON expenses
    FOR UPDATE USING (is_manager_or_admin() AND EXISTS (SELECT 1 FROM projects WHERE id = expenses.project_id AND organization_id = get_auth_org_id()));

-- Timesheets: Similar to Expenses
CREATE POLICY "View own timesheets" ON timesheets
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Managers view all timesheets" ON timesheets
    FOR SELECT USING (is_manager_or_admin() AND EXISTS (SELECT 1 FROM projects WHERE id = timesheets.project_id AND organization_id = get_auth_org_id()));
CREATE POLICY "Insert own timesheets" ON timesheets
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own pending timesheets" ON timesheets
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Managers update timesheets" ON timesheets
    FOR UPDATE USING (is_manager_or_admin() AND EXISTS (SELECT 1 FROM projects WHERE id = timesheets.project_id AND organization_id = get_auth_org_id()));


-- ==========================================
-- AUDIT LOG TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit Log to Expenses and Timesheets
CREATE TRIGGER audit_expenses
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_timesheets
AFTER INSERT OR UPDATE OR DELETE ON timesheets
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
