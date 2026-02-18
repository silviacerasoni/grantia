-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert user 's.cerasoni@webmagistri.it' directly into auth.users to bypass API rate limits
-- Password will be 'password123'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 's.cerasoni@webmagistri.it') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', -- Default instance_id
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            's.cerasoni@webmagistri.it',
            crypt('password123', gen_salt('bf')),
            NOW(), -- Confirmed
            NULL,
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Silvia Cerasoni", "org_name": "Web Magistri"}', -- Metadata for trigger
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;
