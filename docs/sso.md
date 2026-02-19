# SSO IC → Supabase (wariant Hybrid)

- IC wystawia JWT (RS256) z `sub`, `name`, `avatarUrl`, `groups`.
- SPA wymienia JWT na session w Supabase (Edge Function).
- RLS mapuje `groups` → role.

## Payload (przykład)
{
  "iss": "ic.example",
  "aud": "vibe-chat",
  "sub": "IC_MEMBER_ID",
  "name": "Nick",
  "avatar": "https://...",
  "groups": ["Administrators","Members"],
  "exp": 1735689600
}
