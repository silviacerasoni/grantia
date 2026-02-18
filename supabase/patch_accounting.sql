-- ALREADY RUN: user_role, project_status, etc. exist.
-- DO NOT RUN THE FULL SCHEMA.SQL

-- 1. Safely create payment_status type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending_payment', 'paid', 'reconciled');
    END IF;
END$$;

-- 2. Safely add columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount * vat_rate / (100 + vat_rate)) STORED,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount * 100 / (100 + vat_rate)) STORED,
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_date DATE;
