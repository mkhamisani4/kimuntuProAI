/**
 * POST /api/interview/transcribe
 * Transcribes audio using OpenAI Whisper.
 * Body: multipart/form-data with field "file" (audio file) or "audio" (audio blob).
 * Env: OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data. Send multipart/form-data with an audio file.' },
      { status: 400 }
    );
  }

  const file = formData.get('file') ?? formData.get('audio');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing "file" or "audio" in form data.' },
      { status: 400 }
    );
  }

  const body = new FormData();
  body.append('file', file, file.name || 'audio.webm');
  body.append('model', 'whisper-1');

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('[transcribe] OpenAI error:', res.status, err.slice(0, 200));
      return NextResponse.json(
        { error: res.status === 401 ? 'Invalid API key' : 'Transcription failed.' },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    const data = (await res.json()) as { text?: string };
    const text = typeof data?.text === 'string' ? data.text.trim() : '';
    return NextResponse.json({ text });
  } catch (e) {
    console.warn('[transcribe] Error:', e);
    return NextResponse.json({ error: 'Transcription failed.' }, { status: 500 });
  }
}
