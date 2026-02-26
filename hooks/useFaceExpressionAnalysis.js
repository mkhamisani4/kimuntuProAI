'use client';

import { useState, useEffect, useRef } from 'react';

// Weights from CDN. To use local weights, download from https://github.com/justadudewhohacks/face-api.js/tree/master/weights into public/models and use '/models'
const MODELS_BASE = typeof window !== 'undefined' ? 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights' : '';
let faceapi = null;
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return true;
  try {
    faceapi = await import('face-api.js');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_BASE),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_BASE),
      faceapi.nets.faceExpressionNet.loadFromUri(MODELS_BASE),
    ]);
    modelsLoaded = true;
    return true;
  } catch (err) {
    console.warn('[useFaceExpressionAnalysis] Failed to load models:', err);
    return false;
  }
}

/**
 * Runs real-time face expression analysis on a video element and stores results in state.
 * @param {React.RefObject<HTMLVideoElement>} videoRef - Ref to the <video> element (with srcObject set)
 * @param {boolean} enabled - When true, runs the detection loop
 * @param {object} options - { intervalMs: number } (default 800ms between detections)
 * @returns {{ expressions: object | null, dominant: string | null, loading: boolean, error: string | null, log: array }}
 */
export function useFaceExpressionAnalysis(videoRef, enabled, options = {}) {
  const { intervalMs = 800 } = options;
  const [expressions, setExpressions] = useState(null);
  const [dominant, setDominant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !videoRef?.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setExpressions(null);
      setDominant(null);
      return;
    }

    const video = videoRef.current;

    (async () => {
      setLoading(true);
      setError(null);
      const ok = await loadModels();
      if (!mountedRef.current) return;
      if (!ok) {
        setError('Face analysis models failed to load');
        setLoading(false);
        return;
      }
      setLoading(false);

      const runDetection = async () => {
        if (!mountedRef.current || !faceapi || !video || video.readyState < 2) return;
        try {
          const result = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          if (!mountedRef.current) return;
          const ex = result?.expressions ?? result?.expression ?? null;
          if (ex && typeof ex === 'object') {
            setExpressions(ex);
            const dominantEntry = Object.entries(ex).reduce((a, [k, v]) => (v > a.score ? { name: k, score: v } : a), { name: 'neutral', score: 0 });
            setDominant(dominantEntry.name);
            setLog((prev) => {
              const next = prev.slice(-49);
              next.push({ time: Date.now(), dominant: dominantEntry.name, score: dominantEntry.score });
              return next;
            });
          } else {
            setExpressions(null);
            setDominant(null);
          }
        } catch (e) {
          if (mountedRef.current) setError(e?.message || 'Detection failed');
        }
      };

      runDetection();
      intervalRef.current = setInterval(runDetection, intervalMs);
    })();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoRef, intervalMs]);

  return { expressions, dominant, loading, error, log };
}
