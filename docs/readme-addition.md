## Target stack (IC)
- Invision Community: 4.7.x (doprecyzuj: 4.7.**YY**)
- PHP: 8.0/8.1/8.2 (doprecyzuj: **X.Y**)
- DB: MySQL/MariaDB (**wersja**)
- Realtime: [Native: WS provider?] / [Hybrid: Supabase Realtime]

### Decyzja architektoniczna
Patrz: `docs/adr/ADR-001-architektura.md`

### .env.example (dla wariantu Hybrid)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
IC_JWT_ISSUER=
IC_JWT_AUDIENCE=
IC_JWT_PUBLIC_KEY_BASE64=
```
