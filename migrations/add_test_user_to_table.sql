-- Add test user to users table
-- This bypasses RLS by running as a direct SQL command

-- Insert test user
INSERT INTO public.users (id, email, password_hash, name, role)
VALUES (
    '6f19f4a9-48ec-4a43-a032-b8f79e71d2d3'::uuid,
    'author@kpsur.test',
    encode(digest('test1234', 'sha256'), 'hex'),
    'Test Author',
    'Author'
)
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();
