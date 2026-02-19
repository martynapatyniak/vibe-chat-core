-- Wersja 0.1 — szkic tabel (dopasuj do konwencji IC: prefiksy, charset, engine)
-- To jest tylko szkic – uzgodnimy finalne indeksy/FK.
CREATE TABLE chat_rooms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  visibility ENUM('public','private') NOT NULL DEFAULT 'public',
  password_hash VARCHAR(255) NULL,
  settings_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id INT UNSIGNED NOT NULL,
  author_id INT UNSIGNED NOT NULL,
  content MEDIUMTEXT NOT NULL,
  quote_json JSON NULL,
  attachments_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  deleted_at DATETIME NULL,
  INDEX (room_id),
  INDEX (author_id),
  CONSTRAINT fk_msg_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
);

CREATE TABLE chat_memberships (
  room_id INT UNSIGNED NOT NULL,
  member_id INT UNSIGNED NOT NULL,
  role ENUM('admin','mod','user') NOT NULL DEFAULT 'user',
  muted_until DATETIME NULL,
  banned_until DATETIME NULL,
  PRIMARY KEY (room_id, member_id),
  INDEX (role)
);

CREATE TABLE chat_reactions (
  message_id BIGINT UNSIGNED NOT NULL,
  member_id INT UNSIGNED NOT NULL,
  emoji VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, member_id, emoji),
  INDEX (member_id)
);
