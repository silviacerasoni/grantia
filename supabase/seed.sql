-- DATA SEEDING SCRIPT
-- Run this in the Supabase SQL Editor to populate the database with sample data.

BEGIN;

-- 1. Create Organization
INSERT INTO organizations (id, name)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grantia Demo Org')
ON CONFLICT DO NOTHING;

-- 2. Create Users (We insert into auth.users for completeness, but this might require admin privileges)
-- NOTE: If this fails due to permissions, create users in the Auth dashboard and update the IDs here.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'pm@grantia.eu', 'password', NOW()),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'researcher@grantia.eu', 'password', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Profiles
INSERT INTO profiles (id, organization_id, role, full_name, email)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'manager', 'Dr. Elena Rossi', 'pm@grantia.eu'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user', 'Marco Bianchi', 'researcher@grantia.eu')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Projects
INSERT INTO projects (id, organization_id, name, code, description, start_date, end_date, total_budget, status, created_by)
VALUES
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sustainable Urban Mobility', 'SUM-2026', 'Horizon Europe project on AI-driven traffic management.', '2025-01-01', '2027-12-31', 3500000.00, 'active', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22')
ON CONFLICT (id) DO NOTHING;

-- 5. Create Activities
INSERT INTO project_activities (id, project_id, name, code, budget_allocated)
VALUES
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Project Management', 'WP1', 500000.00),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'AI Model Development', 'WP2', 1200000.00)
ON CONFLICT DO NOTHING;

-- 6. Assign Resources
INSERT INTO project_resources (project_id, user_id, role, allocation_percentage)
VALUES
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Coordinator', 50.00),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Lead Researcher', 100.00)
ON CONFLICT DO NOTHING;

-- 7. Add Expenses
INSERT INTO expenses (project_id, user_id, category, description, amount, date, status)
VALUES
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Travel', 'Kickoff Meeting in Brussels', 450.50, '2025-02-15', 'approved'),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Equipment', 'High-performance GPU Cluster', 12500.00, '2025-03-01', 'pending')
ON CONFLICT DO NOTHING;

COMMIT;
