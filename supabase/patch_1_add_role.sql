-- STEP 1: Run this script ALONE first.
-- This adds the 'accountant' role to the enum.
-- It must be committed before it can be used in policies.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';
