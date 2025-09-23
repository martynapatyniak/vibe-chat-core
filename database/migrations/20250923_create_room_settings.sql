-- 20250923_create_room_settings.sql
CREATE TABLE IF NOT EXISTS room_settings (
  room_id uuid PRIMARY KEY REFERENCES rooms(id),
  show_flags boolean DEFAULT true,
  show_rank boolean DEFAULT true,
  allow_file_upload boolean DEFAULT true,
  allow_video boolean DEFAULT true,
  enter_sends boolean DEFAULT true,
  message_retention_days integer DEFAULT NULL,
  max_message_length integer DEFAULT 2000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
