-- PATCH: Fix Foreign Keys to allow User Deletion

-- 1. Project Resources: CASCADE (Already strict, but ensuring)
-- If a user is deleted, remove them from project resources
ALTER TABLE project_resources
DROP CONSTRAINT IF EXISTS project_resources_user_id_fkey,
ADD CONSTRAINT project_resources_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- 2. Projects: SET NULL for created_by
-- If a user is deleted, keep the project but remove the creator link
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_created_by_fkey,
ADD CONSTRAINT projects_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- 3. Expenses: CASCADE for user_id (Approved by -> SET NULL)
-- If a user is deleted, their expenses might need to be kept for audit?
-- But strict deletion usually implies removing personal data.
-- Let's use CASCADE for user_id as per "Delete User" request.
-- OR simple "SET NULL" breaks integrity if user_id is NOT NULL.
-- user_id is NOT NULL. So we must CASCADE or change column to NULLABLE.
-- We will CASCADE (delete expenses of deleted user).
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_user_id_fkey,
ADD CONSTRAINT expenses_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- approved_by can be NULL
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_approved_by_fkey,
ADD CONSTRAINT expenses_approved_by_fkey
    FOREIGN KEY (approved_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- 4. Timesheets: CASCADE for user_id
ALTER TABLE timesheets
DROP CONSTRAINT IF EXISTS timesheets_user_id_fkey,
ADD CONSTRAINT timesheets_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- approved_by
ALTER TABLE timesheets
DROP CONSTRAINT IF EXISTS timesheets_approved_by_fkey,
ADD CONSTRAINT timesheets_approved_by_fkey
    FOREIGN KEY (approved_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;
