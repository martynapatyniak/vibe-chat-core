-- 20250923_add_quoted_message_id_to_messages.sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS quoted_message_id uuid REFERENCES messages(id);
