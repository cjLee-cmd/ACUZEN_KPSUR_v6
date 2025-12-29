-- Update Master user in users table
-- This bypasses RLS by running as a direct SQL command

-- Update existing user or insert if not exists
UPDATE public.users
SET
    password_hash = encode(digest('1111', 'sha256'), 'hex'),
    name = 'Master Admin',
    role = 'Master',
    updated_at = now()
WHERE email = 'main@main.com';
