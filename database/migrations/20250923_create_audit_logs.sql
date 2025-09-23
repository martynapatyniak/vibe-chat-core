-- 20250923_create_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  action_type text NOT NULL,
  target_type text,
  target_id uuid,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
