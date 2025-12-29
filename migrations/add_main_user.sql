-- ============================================================================
-- Add Main Master User Account
-- ============================================================================
-- Email: main@main.com
-- Password: 1111
-- Role: Master

INSERT INTO users (email, password_hash, name, role) VALUES
('main@main.com', crypt('1111', gen_salt('bf')), 'Main Master', 'Master')
ON CONFLICT (email) DO UPDATE
SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

-- ============================================================================
-- User Added Successfully
-- ============================================================================
