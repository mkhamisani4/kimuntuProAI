'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import {
  LiveAvatarSession,
  AgentEventsEnum,
  SessionEvent,
} from '@heygen/liveavatar-web-sdk';

/**
 * LiveAvatar allows very few concurrent sessions per API key.
 * React Strict Mode (dev) mounts → unmounts → remounts quickly; without this, a new
 * session token can be created before `stop()` finishes on the server → concurrency error.
 */
let liveAvatarSessionGate = Promise.resolve();
/** ms to wait after stop() before opening another session (tune if API still races) */
const LIVEAVATAR_POST_STOP_COOLDOWN_MS = 1200;

/**
 * LiveAvatar (HeyGen) streaming interviewer — FULL mode session token from backend.
 * @see https://docs.liveavatar.com/docs/getting-started
 */
const InterviewLiveAvatar = forwardRef(function InterviewLiveAvatar(
  { className = '', onSpeakingChange, onReady, onError },
  ref
) {
  const videoRef = useRef(null);
  const sessionRef = useRef(null);
  const startingRef = useRef(false);
  const onSpeakingChangeRef = useRef(onSpeakingChange);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const readyNotifiedRef = useRef(false);

  onSpeakingChangeRef.current = onSpeakingChange;
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  const [status, setStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  const cleanupSession = useCallback(async () => {
    const s = sessionRef.current;
    sessionRef.current = null;
    startingRef.current = false;
    readyNotifiedRef.current = false;
    if (s) {
      try {
        await s.stop();
      } catch (e) {
        console.warn('[LiveAvatar] stop', e);
      }
    }
    onSpeakingChangeRef.current?.(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();

    (async () => {
      await liveAvatarSessionGate;
      if (cancelled) return;
      if (sessionRef.current || startingRef.current) return;
      startingRef.current = true;
      readyNotifiedRef.current = false;
      setStatus('connecting');
      setErrorMsg('');

      try {
        const res = await fetch('/api/liveavatar/session', {
          method: 'POST',
          signal: abort.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || res.statusText || 'Failed to get session token');
        }
        if (cancelled) return;

        const session = new LiveAvatarSession(data.sessionToken, {
          voiceChat: false,
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () =>
          onSpeakingChangeRef.current?.(true)
        );
        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () =>
          onSpeakingChangeRef.current?.(false)
        );
        session.on(SessionEvent.SESSION_DISCONNECTED, () => {
          onSpeakingChangeRef.current?.(false);
        });

        const notifyReadyOnce = () => {
          if (cancelled || readyNotifiedRef.current) return;
          readyNotifiedRef.current = true;
          const el = videoRef.current;
          if (el) {
            session.attach(el);
          }
          setStatus('connected');
          onReadyRef.current?.();
        };

        session.on(SessionEvent.SESSION_STREAM_READY, notifyReadyOnce);

        sessionRef.current = session;
        try {
          await session.start();
        } catch (startErr) {
          sessionRef.current = null;
          throw startErr;
        }
        if (cancelled) {
          sessionRef.current = null;
          try {
            await session.stop();
          } catch (_) {
            /* noop */
          }
          return;
        }
      } catch (e) {
        if (cancelled || (e instanceof Error && e.name === 'AbortError')) return;
        sessionRef.current = null;
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[LiveAvatar]', e);
        setErrorMsg(msg);
        setStatus('error');
        onErrorRef.current?.(msg);
      } finally {
        startingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      abort.abort();
      liveAvatarSessionGate = liveAvatarSessionGate
        .then(async () => {
          try {
            await cleanupSession();
          } finally {
            await new Promise((resolve) => {
              setTimeout(resolve, LIVEAVATAR_POST_STOP_COOLDOWN_MS);
            });
          }
        })
        .catch(() => {});
    };
  }, [cleanupSession]);

  useImperativeHandle(
    ref,
    () => ({
      speak(text) {
        const s = sessionRef.current;
        const plain = typeof text === 'string' ? text : '';
        if (!s || !plain.trim()) return;
        s.repeat(plain);
      },
      interrupt() {
        try {
          sessionRef.current?.interrupt();
        } catch (_) {
          /* noop */
        }
        onSpeakingChangeRef.current?.(false);
      },
    }),
    []
  );

  return (
    <div
      className={`relative flex-1 min-w-0 w-full max-w-full min-h-[min(28vh,260px)] overflow-hidden rounded-none bg-black ${className || ''}`}
    >
      {/*
        min-h: absolutely positioned <video> does not contribute height; without it flex rows collapse to ~0.
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full max-h-full max-w-full object-cover object-center bg-black"
        playsInline
        autoPlay
      />
      {status === 'connecting' && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/55 pointer-events-none"
          aria-busy="true"
          aria-label="Connecting to LiveAvatar"
        >
          <span className="inline-block h-6 w-6 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
          <p className="text-xs text-gray-300 px-2 text-center">Connecting to LiveAvatar…</p>
        </div>
      )}
      {status === 'error' && errorMsg && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-2 py-2 bg-black/70">
          <p className="text-xs text-amber-400 text-center">{errorMsg}</p>
        </div>
      )}
    </div>
  );
});

export default InterviewLiveAvatar;
