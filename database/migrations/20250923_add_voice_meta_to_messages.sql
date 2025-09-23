-- 20250923_add_voice_meta_to_messages.sql
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_voice boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_duration integer; -- seconds
