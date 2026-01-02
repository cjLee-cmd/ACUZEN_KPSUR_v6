-- Sync Auth User to Users Table
-- This migration ensures the users table has the correct auth user ID
-- Run this in Supabase SQL Editor after registering a user in Supabase Auth

-- The master@kpsur.test user was registered in Supabase Auth with ID:
-- 3d4afddc-14b5-491b-8aca-0e80dbafea2e

-- Option 1: Update existing user's ID to match auth user ID
-- (This may fail if there are foreign key references)

-- Option 2: Delete and recreate with correct ID
DELETE FROM public.users WHERE email = 'master@kpsur.test';

INSERT INTO public.users (id, email, password_hash, name, role)
VALUES (
    '3d4afddc-14b5-491b-8aca-0e80dbafea2e'::uuid,
    'master@kpsur.test',
    crypt('master123', gen_salt('bf')),
    'Master Admin',
    'Master'
)
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

-- Verify the user was created
SELECT id, email, name, role FROM public.users WHERE email = 'master@kpsur.test';
