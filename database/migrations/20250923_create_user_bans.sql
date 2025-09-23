-- 20250923_create_user_bans.sql
CREATE TABLE IF NOT EXISTS user_bans (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES users(id),
  reason text,
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz NULL,
  permanent boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans (active, expires_at);
