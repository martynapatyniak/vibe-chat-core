-- 20250923_create_user_presence.sql
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  last_seen timestamptz DEFAULT now(),
  status text DEFAULT 'online'
);
