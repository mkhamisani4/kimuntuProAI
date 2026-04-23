'use client';

/**
 * Client-side fetch helper that automatically attaches the current Firebase
 * ID token as an Authorization: Bearer header. Use this for any API call that
 * mutates data or returns user-scoped data.
 */

import { auth } from '@/lib/firebase';

async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export async function fetchAuthed(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
