# Architektura — high level

- Warstwa prezentacji: [Native: IPS templates] / [Hybrid: React SPA]
- Backend: [Native: PHP + MySQL] / [Hybrid: Supabase (Postgres/Auth/Realtime/Storage)]
- Realtime: [Pusher/Ably/Własny WS/Long-polling]
- Uprawnienia: IC groups/roles → Chat (mapowanie)
- Uploady: `IPS\File` / Supabase Storage
- Logi/moderacja: Modlog IC + audyt chat

## Komponenty
- Messages / Rooms / Memberships / Reactions / Stats
- ACP Settings (feature flags, filtry słów, limity)
- Media (upload, oEmbed, mini-playery)
