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

/** Mouth aspect ratio (MAR) above this is treated as "speaking". Raised to avoid quiet/resting moments. */
const MAR_SPEAKING_THRESHOLD = 0.24;
/** Number of consecutive samples above threshold required to mark as speaking (reduces single-frame noise). */
const SPEAKING_CONSECUTIVE_REQUIRED = 2;

/**
 * Estimate "eye contact" (0–1) from nose position relative to face box.
 * When nose is centered in the detection box, score is high; when off-center, lower.
 */
function getGazeScore(result) {
  if (!result?.detection?.box || !result?.landmarks || typeof result.landmarks.getNose !== 'function') return null;
  const box = result.detection.box;
  const nose = result.landmarks.getNose();
  if (!Array.isArray(nose) || nose.length === 0) return null;
  let nx = 0; let ny = 0;
  nose.forEach((p) => {
    nx += (p.x != null ? p.x : p._x);
    ny += (p.y != null ? p.y : p._y);
  });
  nx /= nose.length;
  ny /= nose.length;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const halfDiag = Math.sqrt(box.width * box.width + box.height * box.height) / 2;
  if (halfDiag <= 0) return null;
  const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
  const score = Math.max(0, Math.min(1, 1 - dist / halfDiag));
  return score;
}

/** Safe point from face-api landmark point (x/y or _x/_y). */
function pt(p) {
  return { x: p?.x ?? p?._x ?? 0, y: p?.y ?? p?._y ?? 0 };
}
function center(points) {
  if (!Array.isArray(points) || points.length === 0) return null;
  const ps = points.map(pt);
  return { x: ps.reduce((s, p) => s + p.x, 0) / ps.length, y: ps.reduce((s, p) => s + p.y, 0) / ps.length };
}
function dist(a, b) {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function extentWidth(points) {
  if (!Array.isArray(points) || points.length === 0) return 0;
  const xs = points.map((p) => pt(p).x);
  return Math.max(...xs) - Math.min(...xs);
}
function extentHeight(points) {
  if (!Array.isArray(points) || points.length === 0) return 0;
  const ys = points.map((p) => pt(p).y);
  return Math.max(...ys) - Math.min(...ys);
}

/**
 * Heuristic action-unit-like scores (0–1) from 68-point landmarks.
 * Maps to concentration, doubt, confidence-style signals (brow raise/lower, eye widen, lip press, mouth stretch).
 * @param {object} landmarks - face-api FaceLandmarks68
 * @param {{ width: number, height: number }} box - face detection box for scale
 * @returns {{ browRaise: number, browLower: number, eyeWiden: number, lipPress: number, mouthStretch: number }}
 */
function getActionUnits(landmarks, box) {
  const out = { browRaise: 0, browLower: 0, eyeWiden: 0, lipPress: 0, mouthStretch: 0 };
  if (!landmarks || !box?.width || !box?.height) return out;
  const faceH = box.height;
  const faceW = box.width;
  if (faceH <= 0 || faceW <= 0) return out;

  let leftBrow; let rightBrow; let leftEye; let rightEye; let mouth;
  try {
    const getReg = (name) => {
      if (typeof landmarks[name] === 'function') return landmarks[name].call(landmarks);
      return null;
    };
    const pos = landmarks.positions ?? landmarks._positions;
    leftBrow = getReg('getLeftEyeBrow') ?? (Array.isArray(pos) ? pos.slice(17, 22) : null);
    rightBrow = getReg('getRightEyeBrow') ?? (Array.isArray(pos) ? pos.slice(22, 27) : null);
    leftEye = getReg('getLeftEye') ?? (Array.isArray(pos) ? pos.slice(36, 42) : null);
    rightEye = getReg('getRightEye') ?? (Array.isArray(pos) ? pos.slice(42, 48) : null);
    mouth = getReg('getMouth') ?? (Array.isArray(pos) ? pos.slice(48, 68) : null);
  } catch (_) {
    return out;
  }

  const leftBrowC = center(Array.isArray(leftBrow) ? leftBrow : []);
  const rightBrowC = center(Array.isArray(rightBrow) ? rightBrow : []);
  const leftEyeC = center(Array.isArray(leftEye) ? leftEye : []);
  const rightEyeC = center(Array.isArray(rightEye) ? rightEye : []);
  const browC = leftBrowC && rightBrowC ? { x: (leftBrowC.x + rightBrowC.x) / 2, y: (leftBrowC.y + rightBrowC.y) / 2 } : leftBrowC || rightBrowC;
  const eyeC = leftEyeC && rightEyeC ? { x: (leftEyeC.x + rightEyeC.x) / 2, y: (leftEyeC.y + rightEyeC.y) / 2 } : leftEyeC || rightEyeC;
  const interEye = leftEyeC && rightEyeC ? dist(leftEyeC, rightEyeC) : 0;

  if (browC && eyeC && faceH > 0) {
    const browEyeDist = dist(browC, eyeC);
    const browAboveEye = eyeC.y - browC.y;
    out.browRaise = Math.max(0, Math.min(1, browAboveEye / (faceH * 0.15)));
    out.browLower = Math.max(0, Math.min(1, 1 - browEyeDist / (faceH * 0.4)));
  }

  if (Array.isArray(leftEye) && leftEye.length >= 4) {
    const h = extentHeight(leftEye);
    const w = extentWidth(leftEye);
    const ear = w > 0 ? h / w : 0;
    out.eyeWiden = Math.max(0, Math.min(1, ear / 0.35));
  }

  if (Array.isArray(mouth) && mouth.length >= 4) {
    const mw = extentWidth(mouth);
    const mh = extentHeight(mouth);
    if (mw > 0) {
      out.lipPress = Math.max(0, Math.min(1, 1 - mh / (mw * 0.5)));
      if (interEye > 0) out.mouthStretch = Math.max(0, Math.min(1, mw / (interEye * 1.1)));
    }
  }

  return out;
}

/**
 * Compute mouth aspect ratio from 68-point face landmarks (height/width of mouth opening).
 * Higher = mouth more open (speaking). Returns 0 if landmarks missing or invalid.
 */
function getMouthAspectRatio(landmarks) {
  if (!landmarks || typeof landmarks.getMouth !== 'function') return 0;
  const mouth = landmarks.getMouth();
  if (!Array.isArray(mouth) || mouth.length < 2) return 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  mouth.forEach((p) => {
    const x = p.x != null ? p.x : p._x;
    const y = p.y != null ? p.y : p._y;
    if (typeof x === 'number' && typeof y === 'number') {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  });
  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0) return 0;
  return height / width;
}

/**
 * Runs real-time face expression analysis on a video element and stores results in state.
 * Also computes mouth openness (MAR) for speaking vs silence.
 * @param {React.RefObject<HTMLVideoElement>} videoRef - Ref to the <video> element (with srcObject set)
 * @param {boolean} enabled - When true, runs the detection loop
 * @param {object} options - { intervalMs: number } (default 800ms between detections)
 * @returns {{ expressions, dominant, secondary, loading, error, log, mouthAspectRatio, isSpeaking, gazeScore, actionUnits }}
 */
export function useFaceExpressionAnalysis(videoRef, enabled, options = {}) {
  const { intervalMs = 800 } = options;
  const [expressions, setExpressions] = useState(null);
  const [dominant, setDominant] = useState(null);
  const [secondary, setSecondary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const [mouthAspectRatio, setMouthAspectRatio] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gazeScore, setGazeScore] = useState(null);
  const [actionUnits, setActionUnits] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const consecutiveHighMarRef = useRef(0);

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
      consecutiveHighMarRef.current = 0;
      setExpressions(null);
      setDominant(null);
      setSecondary(null);
      setMouthAspectRatio(0);
      setIsSpeaking(false);
      setGazeScore(null);
      setActionUnits(null);
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
          const landmarks = result?.landmarks;
          const box = result?.detection?.box ?? null;
          const au = landmarks && box ? getActionUnits(landmarks, box) : null;
          const mar = landmarks ? getMouthAspectRatio(landmarks) : 0;
          const ex = result?.expressions ?? result?.expression ?? null;
          const sorted = ex && typeof ex === 'object' ? Object.entries(ex).filter(([, v]) => typeof v === 'number').sort((a, b) => b[1] - a[1]) : [];
          const dominantName = sorted[0] ? sorted[0][0] : 'neutral';
          const isSmiling = dominantName === 'happy';
          const aboveThreshold = mar >= MAR_SPEAKING_THRESHOLD && !isSmiling;
          if (aboveThreshold) {
            consecutiveHighMarRef.current = Math.min(SPEAKING_CONSECUTIVE_REQUIRED, consecutiveHighMarRef.current + 1);
          } else {
            consecutiveHighMarRef.current = 0;
          }
          const speaking = consecutiveHighMarRef.current >= SPEAKING_CONSECUTIVE_REQUIRED;
          const gaze = getGazeScore(result);
          setMouthAspectRatio(mar);
          setIsSpeaking(speaking);
          setGazeScore(gaze != null ? gaze : null);
          setActionUnits(au ? { ...au } : null);
          const logEntry = {
            time: Date.now(),
            mouthAspectRatio: mar,
            isSpeaking: speaking,
            gazeScore: gaze,
            actionUnits: au ? { ...au } : null,
          };
          if (ex && typeof ex === 'object') {
            setExpressions(ex);
            const dominantEntry = sorted[0] ? { name: sorted[0][0], score: sorted[0][1] } : { name: 'neutral', score: 0 };
            const secondaryEntry = sorted[1] ? { name: sorted[1][0], score: sorted[1][1] } : null;
            setDominant(dominantEntry.name);
            setSecondary(secondaryEntry?.name ?? null);
            setLog((prev) => {
              const next = prev.slice(-49);
              next.push({ ...logEntry, dominant: dominantEntry.name, secondary: secondaryEntry?.name ?? null, score: dominantEntry.score });
              return next;
            });
          } else {
            setExpressions(null);
            setDominant(null);
            setSecondary(null);
            setLog((prev) => {
              const next = prev.slice(-49);
              next.push({ ...logEntry, dominant: null, secondary: null, score: 0 });
              return next;
            });
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

  return { expressions, dominant, secondary, loading, error, log, mouthAspectRatio, isSpeaking, gazeScore, actionUnits };
}
