# Mapping schematu (Hybrid: Supabase ↔ IC)

- rooms(id) ↔ chat_rooms.id
- messages(id, room_id, author_id, ...) ↔ chat_messages(...)
- reactions ↔ chat_reactions
- memberships ↔ chat_memberships

Notatka: w Hybrid prawdą jest Postgres; zapewnij eksport/import na wypadek migracji do IC Native.
