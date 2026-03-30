import { NextResponse } from 'next/server';

/**
 * Creates a short-lived LiveAvatar session token (server-side only).
 * @see https://docs.liveavatar.com/docs/quick-start-guide
 */
export async function POST() {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'LiveAvatar is not configured (missing LIVEAVATAR_API_KEY)' },
      { status: 503 }
    );
  }

  const mode = (process.env.LIVEAVATAR_MODE || 'FULL').trim();
  const isSandbox = process.env.LIVEAVATAR_USE_SANDBOX === 'true';
  /** Sandbox default avatar "Wayne" per https://docs.liveavatar.com/docs/developing-in-sandbox-mode */
  const SANDBOX_DEFAULT_AVATAR_ID = 'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a';

  let avatarId = (process.env.LIVEAVATAR_AVATAR_ID || '').trim();
  if (isSandbox && !avatarId) {
    avatarId = SANDBOX_DEFAULT_AVATAR_ID;
  }
  if (!avatarId) {
    return NextResponse.json(
      { error: 'LIVEAVATAR_AVATAR_ID is required (or enable LIVEAVATAR_USE_SANDBOX=true for default avatar)' },
      { status: 500 }
    );
  }

  const voiceId = (process.env.LIVEAVATAR_VOICE_ID || '').trim();
  const contextId = (process.env.LIVEAVATAR_CONTEXT_ID || '').trim();
  const language = (process.env.LIVEAVATAR_LANGUAGE || 'en').trim();

  const body: Record<string, unknown> = {
    mode,
    avatar_id: avatarId,
    is_sandbox: isSandbox,
  };

  const persona: Record<string, string> = { language };
  if (voiceId) persona.voice_id = voiceId;
  if (contextId) persona.context_id = contextId;
  body.avatar_persona = persona;

  const res = await fetch('https://api.liveavatar.com/v1/sessions/token', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof json.message === 'string' && json.message) ||
      (typeof json.error === 'string' && json.error) ||
      `LiveAvatar token error (${res.status})`;
    return NextResponse.json({ error: msg, details: json }, { status: res.status >= 400 ? res.status : 502 });
  }

  const data = (json.data as Record<string, unknown> | undefined) ?? json;
  const sessionToken = (data.session_token as string) ?? (data.sessionToken as string);
  const sessionId = (data.session_id as string) ?? (data.sessionId as string);

  if (!sessionToken) {
    return NextResponse.json({ error: 'Invalid token response from LiveAvatar', details: json }, { status: 502 });
  }

  return NextResponse.json({ sessionToken, sessionId: sessionId ?? null });
}
