# LiveAvatar (HeyGen) — Interview Simulator

The interview page can use **[LiveAvatar](https://docs.liveavatar.com/docs/getting-started)** instead of the local 3D VRM viewer:

1. **Iframe embed** — simplest: set `NEXT_PUBLIC_LIVEAVATAR_EMBED_ID` (or `NEXT_PUBLIC_LIVEAVATAR_EMBED_URL`). Example:

   `https://embed.liveavatar.com/v1/8f3e8fb0-804c-4f9a-a3ca-2a94587c5708`

   No API key on your server; the hosted player handles mic/video. Interview questions are still read with **browser TTS** (the embed is visual / parallel conversation unless you integrate further).

2. **Web SDK** — full control (`repeat(question)` per question, waveforms from avatar events); needs `LIVEAVATAR_API_KEY` and `NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR=true`. **If this flag is `true`, the Web SDK is used for the whole interview** (one LiveAvatar session); embed env vars are ignored for the avatar slot.

## Flow

**Iframe embed:** render `https://embed.liveavatar.com/v1/{id}` — only used when **`NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR` is not `true`** (SDK wins). Embed cannot be scripted per question like the SDK.

**Web SDK** (official [quickstart](https://docs.liveavatar.com/docs/quick-start-guide)):

1. **Backend** — `POST /api/liveavatar/session` calls LiveAvatar `POST https://api.liveavatar.com/v1/sessions/token` with `X-API-KEY`.
2. **Client** — `@heygen/liveavatar-web-sdk` uses the `session_token`, attaches `<video>`, and drives speech with `repeat(text)` per question.

Sandbox: [Sandbox mode](https://docs.liveavatar.com/docs/developing-in-sandbox-mode).

## Environment

Copy variables from `.env.example`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_LIVEAVATAR_EMBED_ID` | UUID for iframe embed (used only if `NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR` is not `true`) |
| `NEXT_PUBLIC_LIVEAVATAR_EMBED_URL` | Optional full embed URL (wins over `EMBED_ID` when both set) |
| `LIVEAVATAR_API_KEY` | API token (SDK path only) |
| `LIVEAVATAR_USE_SANDBOX` | `true` for development (SDK / token path) |
| `LIVEAVATAR_AVATAR_ID` | Avatar UUID |
| `LIVEAVATAR_VOICE_ID` | Optional FULL-mode voice |
| `LIVEAVATAR_CONTEXT_ID` | Optional FULL-mode context |
| `LIVEAVATAR_LANGUAGE` | Default `en` |
| `NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR` | `true` = Web SDK for full interview (embed id/URL ignored for avatar slot) |

## SDK patch (`patches/@heygen+liveavatar-web-sdk+0.0.11.patch`)

`@heygen/liveavatar-web-sdk` 0.0.11 has two issues we patch (see [FULL mode events](https://docs.liveavatar.com/docs/full-mode-events)):

1. **`repeat()` / `avatar.speak_text`** — When the WebSocket is open, the SDK sends commands there first but **does not implement `speak_text` on the socket**, so nothing is sent. We **fall back to LiveKit** `agent-control` when the WebSocket handler returns false.

2. **Missing `session_id`** — FULL mode payloads must include **`session_id`** with `event_type` and `text`. The SDK never adds it, so the server can **ignore every `speak_text` after the first**. We merge **`session_id` from `_sessionInfo`** into every command before sending.

`patch-package` reapplies this on `npm install`.

## Troubleshooting

- **Avatar stops speaking after question 1** — Ensure `postinstall` runs `patch-package` (see above).
- **Session concurrency / “too many sessions”** — LiveAvatar limits concurrent sessions per API key. Avoid **multiple browser tabs** running the interview, and don’t refresh while connecting. In **development**, React Strict Mode double-mounts components; `InterviewLiveAvatar` waits for `stop()` plus a short cooldown before creating the next session. If errors persist, close other tabs and wait ~30s, or check LiveAvatar’s dashboard for stuck sessions.
- **Iframe blocked** — Allow `https://embed.liveavatar.com` in `Content-Security-Policy` `frame-src` if you use a strict CSP.
- **503 from `/api/liveavatar/session`** — Missing `LIVEAVATAR_API_KEY` (SDK path only).
- **Token / persona 4xx** — In production FULL mode you typically need valid `avatar_id`, `voice_id`, and `context_id` from the LiveAvatar console.
- **Video blank** — Check browser console and network; ensure WebRTC / LiveKit is not blocked by firewall/VPN ([firewall docs](https://docs.liveavatar.com/docs/firewall-configuration) if linked from index).
