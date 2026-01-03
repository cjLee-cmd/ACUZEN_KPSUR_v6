-- Add position column to users table
-- Created: 2026-01-03
-- Description: 사용자 직책(position) 필드 추가 및 테스트 데이터

-- ============================================================================
-- 1. Add position column
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS position varchar(100);

-- ============================================================================
-- 2. Insert/Update test users with positions
-- ============================================================================

-- Master user (약물감시 팀장)
INSERT INTO users (id, email, password_hash, name, role, position)
VALUES (
  '3d4afddc-14b5-491b-8aca-0e80dbafea2e',
  'master@kpsur.test',
  crypt('master123', gen_salt('bf')),
  'Master Admin',
  'Master',
  '약물감시 팀장'
)
ON CONFLICT (id) DO UPDATE SET
  position = EXCLUDED.position,
  updated_at = now();

-- Author user (리뷰어)
INSERT INTO users (id, email, password_hash, name, role, position)
VALUES (
  '6f19f4a9-48ec-4a43-a032-b8f79e71d2d3',
  'author@kpsur.test',
  crypt('test1234', gen_salt('bf')),
  'Test Author',
  'Author',
  '리뷰어'
)
ON CONFLICT (id) DO UPDATE SET
  position = EXCLUDED.position,
  updated_at = now();

-- ============================================================================
-- 3. Verify
-- ============================================================================

-- SELECT id, email, name, role, position FROM users;
