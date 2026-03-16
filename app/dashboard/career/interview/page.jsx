'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2, Mic, Video, TrendingUp, AlertCircle, X, FileText, ChevronRight, ChevronLeft, Volume2, Square } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { generateInterviewQuestions, extractResumeText } from '@/services/openaiService';
import { evaluateInterviewResponses, getInterviewFeedback } from '@/services/responseAnalysisService';
import { useFaceExpressionAnalysis } from '@/hooks/useFaceExpressionAnalysis';
import { generatePDF } from '@/lib/pdf/generatePDF';
import dynamic from 'next/dynamic';

const InterviewAvatarVrm = dynamic(() => import('@/components/InterviewAvatarVrm'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500 min-h-[200px]">
            <div className="w-20 h-20 rounded-full bg-gray-600/30 animate-pulse" />
            <span className="text-sm">Loading avatar...</span>
        </div>
    )
});

/**
 * Quick client-side check for suspected PII in resume text.
 * Returns { hasSuspectedPII, summary } for emails, phone numbers, and address-like patterns.
 */
function validateResumePII(text) {
    if (!text || typeof text !== 'string') return { hasSuspectedPII: false, summary: '' };
    const t = text.trim();
    const found = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    if (emailRegex.test(t)) found.push('email addresses');
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b|(?:\+[0-9]{1,3}[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
    if (phoneRegex.test(t)) found.push('phone numbers');
    const addressRegex = /\d+\s+[\w\s]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Suite|Ste\.?|Apt\.?|#\d+)\b|,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b|\b\d{5}(?:-\d{4})?\b/g;
    if (addressRegex.test(t)) found.push('addresses or zip codes');
    const nameLabelRegex = /(?:^|\n)\s*(?:Full\s+)?Name\s*:?\s*[A-Z][a-z]+\s+[A-Z][a-z]+/im;
    if (nameLabelRegex.test(t)) found.push('a full name');
    const hasSuspectedPII = found.length > 0;
    const summary = found.length ? found.join(', ') : '';
    return { hasSuspectedPII, summary };
}

/** Strip HTML tags so class names like "text-emerald-400" never show as visible text. */
function stripHtmlFromText(html) {
    if (!html || typeof html !== 'string') return html || '';
    return html.replace(/<[^>]+>/g, '').trim();
}

const WAVEFORM_BAR_COUNT = 12;
const WAVEFORM_BAR_CLASS = 'rounded-sm transition-all duration-100 flex-shrink-0';

/** Shared bar strip: same look for user and avatar. heights = array of 0..1, barCount elements. */
function WaveformBars({ heights, isDark, label }) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            {label && (
                <p className="text-[10px] font-medium text-gray-500 mb-0.5 truncate">{label}</p>
            )}
            <div className="flex items-end justify-center gap-0.5 h-8 w-full">
                {heights.map((h, i) => (
                    <div
                        key={i}
                        className={`${WAVEFORM_BAR_CLASS} ${isDark ? 'bg-emerald-500/80' : 'bg-emerald-500'}`}
                        style={{ width: 4, minHeight: 2, height: `${Math.max(8, Math.round(h * 100))}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

/** User waveform: reacts to mic via Web Audio API, drives same bar strip. */
function UserWaveform({ stream, isDark, className = '' }) {
    const [heights, setHeights] = useState(() => Array(WAVEFORM_BAR_COUNT).fill(0.15));
    const frameRef = useRef(0);
    useEffect(() => {
        if (!stream || typeof window === 'undefined') return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        let rafId;
        const update = () => {
            rafId = requestAnimationFrame(update);
            analyser.getByteFrequencyData(data);
            const next = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
                const j = Math.floor((i / WAVEFORM_BAR_COUNT) * data.length);
                return 0.15 + (data[j] / 255) * 0.85;
            });
            setHeights(next);
        };
        update();
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            src.disconnect();
            ctx.close();
        };
    }, [stream]);
    return (
        <div className={className}>
            <WaveformBars heights={heights} isDark={isDark} />
        </div>
    );
}

/** Avatar waveform: animates when TTS is active, same bar strip. */
function AvatarWaveform({ isActive, isDark, className = '' }) {
    const [heights, setHeights] = useState(() => Array(WAVEFORM_BAR_COUNT).fill(0.15));
    useEffect(() => {
        if (!isActive) {
            setHeights(Array(WAVEFORM_BAR_COUNT).fill(0.15));
            return;
        }
        const id = setInterval(() => {
            setHeights(Array.from({ length: WAVEFORM_BAR_COUNT }, () => 0.15 + Math.random() * 0.85));
        }, 100);
        return () => clearInterval(id);
    }, [isActive]);
    return (
        <div className={className}>
            <WaveformBars heights={heights} isDark={isDark} />
        </div>
    );
}

/** Parse question text into segments; code blocks (```lang\n...\n```) become { type: 'code', language, code }. */
function parseQuestionWithCodeBlocks(text) {
    if (!text || typeof text !== 'string') return [{ type: 'text', content: text || '' }];
    const parts = text.split('```');
    const segments = [];
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            const textContent = stripHtmlFromText(parts[i]);
            if (parts[i].trim()) segments.push({ type: 'text', content: textContent.length ? textContent : parts[i] });
        } else {
            const block = parts[i].trim();
            const firstNewline = block.indexOf('\n');
            const lang = firstNewline >= 0 ? block.slice(0, firstNewline).trim().toLowerCase() || undefined : undefined;
            let code = firstNewline >= 0 ? block.slice(firstNewline + 1).trimEnd() : block;
            code = stripHtmlFromText(code) || code;
            if (code) segments.push({ type: 'code', language: lang, code });
        }
    }
    if (segments.length === 0) segments.push({ type: 'text', content: stripHtmlFromText(text) || text });
    return segments;
}

/** Simple Python keyword highlighting for code block (no extra deps). Code is stripped of any stray HTML before this runs. */
function highlightPythonCode(code) {
    const keywords = /\b(def|return|if|else|elif|for|in|while|and|or|not|True|False|None|class|with|try|except|finally|import|from|as)\b/g;
    const builtins = /\b(len|range|str|int|list|dict|set|print|open)\b/g;
    return (code || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(keywords, '<span class="text-emerald-400">$1</span>')
        .replace(builtins, '<span class="text-amber-400">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="text-cyan-400">"$1"</span>')
        .replace(/'([^']*)'/g, '<span class="text-cyan-400">\'$1\'</span>');
}

/** First question for all interview types: elevator pitch / tell me about yourself. */
const ELEVATOR_PITCH_QUESTION = 'To start off, could you tell me a little about yourself and walk me through your background, particularly the experiences that have led you to apply for this role?';

/** Shuffle array in place (Fisher–Yates) and return a new array with first n elements. */
function shuffleAndTake(arr, n) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out.slice(0, Math.min(n, out.length));
}

/** Build final 5 questions: elevator pitch first, then 4 random from the generated pool. */
function buildFinalQuestions(apiQuestions) {
    const pool = Array.isArray(apiQuestions) ? apiQuestions.filter(Boolean) : [];
    const fourRandom = shuffleAndTake(pool, 4);
    return [ELEVATOR_PITCH_QUESTION, ...fourRandom];
}

/** Concise thank-you overlay after closing the interview summary */
function ThankYouOverlay({ companyName, evaluationOverall, getThankYouSummary, isDark, t, onClose }) {
    const summary = getThankYouSummary();
    const scorePct = evaluationOverall?.overallScore != null ? Math.round(evaluationOverall.overallScore * 100) : null;
    const bandLabel = evaluationOverall?.overallBand != null ? (t[`interviewBand_${evaluationOverall.overallBand}`] ?? evaluationOverall.overallBand) : null;
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/50 animate-interview-backdrop-in" onClick={onClose}>
            <div className={'max-w-md w-full rounded-2xl shadow-2xl p-6 animate-interview-thankyou-in ' + (isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200')} onClick={(e) => e.stopPropagation()}>
                <h3 className={'text-xl font-bold text-center mb-3 ' + (isDark ? 'text-white' : 'text-gray-900')}>
                    Thank you for interviewing with {companyName || '—'}
                </h3>
                {(bandLabel != null || scorePct != null) && (
                    <p className={'text-center text-sm font-semibold mb-4 ' + (isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                        {bandLabel}{scorePct != null ? ' · ' + scorePct + '%' : ''}
                    </p>
                )}
                <div className="space-y-3 text-sm">
                    <div>
                        <p className={'font-semibold mb-1 ' + (isDark ? 'text-gray-300' : 'text-gray-700')}>Things you did well</p>
                        <ul className={'list-disc list-inside space-y-0.5 ' + (isDark ? 'text-gray-400' : 'text-gray-600')}>
                            {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <p className={'font-semibold mb-1 ' + (isDark ? 'text-gray-300' : 'text-gray-700')}>Things to improve</p>
                        <ul className={'list-disc list-inside space-y-0.5 ' + (isDark ? 'text-gray-400' : 'text-gray-600')}>
                            {summary.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-5 py-3 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default function InterviewSimulatorPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const [jobDescription, setJobDescription] = useState('');
    const [role, setRole] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [interviewType, setInterviewType] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [skills, setSkills] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [error, setError] = useState(null);
    const [simulationActive, setSimulationActive] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [responseAnalyses, setResponseAnalyses] = useState(null);
    const [evaluationOverall, setEvaluationOverall] = useState(null);
    const [analyzingResponses, setAnalyzingResponses] = useState(false);
    const [feedbacks, setFeedbacks] = useState(null);
    const [loadingFeedbackIndex, setLoadingFeedbackIndex] = useState(null);
    const [hasRequestedFeedback, setHasRequestedFeedback] = useState(false);
    const [isTailoringNextQuestion, setIsTailoringNextQuestion] = useState(false);
    /** One extra tailoring at a random transition: 1 = after Q2, 2 = after Q3, 3 = after Q4. Q1→Q2 is always tailored. */
    const [tailorAtTransitionIndex, setTailorAtTransitionIndex] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [showThankYouPopup, setShowThankYouPopup] = useState(false);
    /** Noted emotions per question when user stops recording (dominant + expression scores). */
    const [responseEmotions, setResponseEmotions] = useState([]);
    /** Per-question streaming transcript segments with timestamps for alignment with emotions. */
    const [transcriptSegments, setTranscriptSegments] = useState([]);
    /** Per-question emotion log during recording: [{ time (s), dominant, expressions }, ...]. */
    const [emotionLogs, setEmotionLogs] = useState([]);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const videoPreviewRef = useRef(null);
    const recordingStartTimeRef = useRef(0);
    const emotionLogRef = useRef([]);
    const emotionLogIntervalRef = useRef(null);
    const currentSegmentsRef = useRef([]);
    const lastSegmentEndRef = useRef(0);
    const lastFinalTranscriptRef = useRef('');
    const speechRecognitionRef = useRef(null);
    const latestFaceRef = useRef({ dominant: null, expressions: null });
    const resumeFileInputRef = useRef(null);
    const [showResumeConfirmModal, setShowResumeConfirmModal] = useState(false);
    const [pendingResumeFile, setPendingResumeFile] = useState(null);
    const [showPIIWarningModal, setShowPIIWarningModal] = useState(false);
    const [piiWarningSummary, setPiiWarningSummary] = useState('');
    const [recordingStream, setRecordingStream] = useState(null);
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [pendingFollowUpQuestion, setPendingFollowUpQuestion] = useState(null);
    const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
    /** Indices after which we may show a mini follow-up (0 = after Q1, 2 = after Q3). */
    const followUpAtIndices = [0, 2];

    const { expressions: faceExpressions, dominant: faceDominant, secondary: faceSecondary, loading: faceLoading, error: faceError, log: faceLog, mouthAspectRatio: faceMouthAspectRatio, isSpeaking: faceIsSpeaking, gazeScore: faceGazeScore, actionUnits: faceActionUnits } = useFaceExpressionAnalysis(videoPreviewRef, !!videoStream, { intervalMs: 800 });

    useEffect(() => {
        latestFaceRef.current = {
            dominant: faceDominant,
            secondary: faceSecondary,
            expressions: faceExpressions ? { ...faceExpressions } : null,
            mouthAspectRatio: faceMouthAspectRatio,
            isSpeaking: faceIsSpeaking,
            gazeScore: faceGazeScore,
            actionUnits: faceActionUnits ? { ...faceActionUnits } : null
        };
    }, [faceDominant, faceSecondary, faceExpressions, faceMouthAspectRatio, faceIsSpeaking, faceGazeScore, faceActionUnits]);

    const interviewTypes = [
        'Technical',
        'Behavioral',
        'Case Study',
        'Mixed',
        'System Design',
        'Leadership',
        'Other'
    ];

    const handleResumeFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPendingResumeFile(file);
            setShowResumeConfirmModal(true);
        }
    };

    const confirmResumeUpload = async () => {
        if (!pendingResumeFile) {
            setShowResumeConfirmModal(false);
            setPendingResumeFile(null);
            return;
        }
        const file = pendingResumeFile;
        setShowResumeConfirmModal(false);
        setError(null);
        try {
            const text = await extractResumeText(file);
            const { hasSuspectedPII, summary } = validateResumePII(text);
            if (hasSuspectedPII) {
                setPiiWarningSummary(summary);
                setShowPIIWarningModal(true);
                setPendingResumeFile(null);
                if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
                return;
            }
            setResumeFile(file);
            setResumeText(text);
        } catch (err) {
            console.error('Error extracting resume text:', err);
            setError(err?.message || t.interviewErrorExtract);
        } finally {
            setPendingResumeFile(null);
        }
    };

    const cancelResumeUpload = () => {
        setPendingResumeFile(null);
        setShowResumeConfirmModal(false);
        if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
    };

    const startVideoPreview = async () => {
        setVideoError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(stream);
        } catch (err) {
            setVideoError(err?.message || 'Camera access failed');
        }
    };

    const stopVideoPreview = () => {
        if (videoStream) {
            videoStream.getTracks().forEach((t) => t.stop());
            setVideoStream(null);
        }
        setVideoError(null);
    };

    useEffect(() => {
        const video = videoPreviewRef.current;
        const stream = videoStream;
        if (video && stream) {
            video.srcObject = stream;
        }
        return () => {
            if (video && video.srcObject) video.srcObject = null;
        };
    }, [videoStream]);

    const closeModal = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (emotionLogIntervalRef.current) clearInterval(emotionLogIntervalRef.current);
        emotionLogIntervalRef.current = null;
        const sr = speechRecognitionRef.current;
        if (sr) try { sr.abort(); } catch (_) {}
        speechRecognitionRef.current = null;
        stopVideoPreview();
        setShowThankYouPopup(false);
        setShowQuestionsModal(false);
        setPendingFollowUpQuestion(null);
        setRecordingStream(null);
        setSimulationActive(false);
        setCurrentQuestionIndex(0);
        setResponses([]);
        setResponseEmotions([]);
        setTranscriptSegments([]);
        setEmotionLogs([]);
        setResponseAnalyses(null);
        setEvaluationOverall(null);
        setFeedbacks(null);
        setHasRequestedFeedback(false);
        setAnalyzingResponses(false);
        setIsRecording(false);
        setIsTranscribing(false);
    };

    /** Concise strengths & improvements from evaluation (for thank-you popup) */
    const getThankYouSummary = () => {
        const strengths = [];
        const improvements = [];
        if (responseAnalyses?.length) {
            const full = responseAnalyses.filter((a) => a?.answered?.label === 'fully_answered').length;
            const confident = responseAnalyses.filter((a) => a?.certainty?.label === 'confident').length;
            const highRel = responseAnalyses.filter((a) => a?.relevance?.label === 'high').length;
            if (full >= responseAnalyses.length / 2) strengths.push('Answered questions fully');
            if (confident >= responseAnalyses.length / 2) strengths.push('Confident delivery');
            if (highRel >= responseAnalyses.length / 2) strengths.push('Relevant responses');
            if (strengths.length === 0) strengths.push('Completed the simulation');
            const partial = responseAnalyses.filter((a) => a?.answered?.label === 'partially_answered' || a?.answered?.label === 'not_answered').length;
            const uncertain = responseAnalyses.filter((a) => a?.certainty?.label === 'uncertain' || a?.certainty?.label === 'hedging').length;
            if (partial > 0) improvements.push('Address each part of the question');
            if (uncertain > 0) improvements.push('Use more confident language');
            if (improvements.length === 0) improvements.push('Keep practicing to refine answers');
        } else {
            strengths.push('Completed the simulation');
            improvements.push('Review your answers and try again');
        }
        return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) };
    };

    const handleStartSimulation = () => {
        setSimulationActive(true);
        setCurrentQuestionIndex(0);
        setResponses(generatedQuestions.map(() => ''));
        setResponseEmotions(generatedQuestions.map(() => null));
        setTranscriptSegments(generatedQuestions.map(() => []));
        setEmotionLogs(generatedQuestions.map(() => []));
        startVideoPreview();
    };

    const speakQuestion = () => {
        const question = generatedQuestions[currentQuestionIndex];
        if (!question || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsAvatarSpeaking(true);
        const u = new SpeechSynthesisUtterance(question);
        u.rate = 0.95;
        u.lang = 'en-GB';
        u.onend = () => setIsAvatarSpeaking(false);
        u.onerror = () => setIsAvatarSpeaking(false);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.name === 'Google UK English Male')
            || voices.find((v) => v.lang.startsWith('en-GB'))
            || voices.find((v) => v.lang.startsWith('en'));
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
    };

    useEffect(() => {
        if (!simulationActive || !generatedQuestions?.length) return;
        if (currentQuestionIndex >= generatedQuestions.length) return;
        const question = generatedQuestions[currentQuestionIndex];
        if (!question) return;
        const t = setTimeout(() => speakQuestion(), 400);
        return () => clearTimeout(t);
    }, [simulationActive, currentQuestionIndex]);

    const stopSpeech = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
        setIsAvatarSpeaking(false);
    };

    const handleResponseChange = (value) => {
        setResponses(prev => {
            const next = [...prev];
            next[currentQuestionIndex] = value;
            return next;
        });
    };

    const doAdvanceToNext = async () => {
        if (currentQuestionIndex < generatedQuestions.length - 1) {
            const shouldTailor = (currentQuestionIndex === 0) || (currentQuestionIndex === tailorAtTransitionIndex);
            const nextIndex = currentQuestionIndex + 1;
            if (shouldTailor && generatedQuestions.length > nextIndex) {
                setIsTailoringNextQuestion(true);
                try {
                    const res = await fetch('/api/interview/tailor-question', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            previousQuestion: generatedQuestions[currentQuestionIndex],
                            previousAnswer: (responses[currentQuestionIndex] ?? '').trim(),
                            suggestedNextQuestion: generatedQuestions[nextIndex],
                            jobDescription: jobDescription || '',
                            role: role || '',
                            companyName: companyName || '',
                            resumeText: resumeText || ''
                        })
                    });
                    const data = await res.json();
                    if (res.ok && data?.tailoredQuestion) {
                        setGeneratedQuestions(prev => {
                            const next = [...prev];
                            next[nextIndex] = data.tailoredQuestion;
                            return next;
                        });
                    }
                } catch (_) {
                    // Keep suggested question on failure
                } finally {
                    setIsTailoringNextQuestion(false);
                }
            }
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setCurrentQuestionIndex(generatedQuestions.length);
        }
    };

    const handleNext = async () => {
        if (pendingFollowUpQuestion) return;
        if (currentQuestionIndex >= generatedQuestions.length) return;
        const answer = (responses[currentQuestionIndex] ?? '').trim();
        if (followUpAtIndices.includes(currentQuestionIndex) && answer.length > 20) {
            setIsLoadingFollowUp(true);
            try {
                const res = await fetch('/api/interview/follow-up', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: generatedQuestions[currentQuestionIndex],
                        userAnswer: answer,
                        role: role || '',
                        companyName: companyName || ''
                    })
                });
                const data = await res.json();
                if (data?.followUpQuestion) {
                    setPendingFollowUpQuestion(data.followUpQuestion);
                    setIsLoadingFollowUp(false);
                    return;
                }
            } catch (_) {
                // ignore, advance without follow-up
            } finally {
                setIsLoadingFollowUp(false);
            }
        }
        await doAdvanceToNext();
    };

    const dismissFollowUpAndAdvance = () => {
        setPendingFollowUpQuestion(null);
        doAdvanceToNext();
    };

    const handlePrevious = () => {
        setPendingFollowUpQuestion(null);
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const inSummaryView = showQuestionsModal && simulationActive && generatedQuestions.length > 0 && currentQuestionIndex >= generatedQuestions.length;
    const isFeedbackLoading = loadingFeedbackIndex !== null;
    const evaluationReady = !!responseAnalyses && !analyzingResponses;
    const feedbackReady = !!feedbacks && !isFeedbackLoading;
    const summaryProgress = !inSummaryView ? 0 : (((evaluationReady ? 1 : 0) + (feedbackReady ? 1 : 0)) / 2) * 100;
    const showSummaryProgress = inSummaryView && (!evaluationReady || !feedbackReady);

    const handleGetAllFeedback = () => {
        if (!responseAnalyses?.length || loadingFeedbackIndex !== null) return;
        setLoadingFeedbackIndex(-1);
        const videoSummaries = (generatedQuestions || []).map((_, i) => buildVideoSummaryForQuestion(i));
        getInterviewFeedback(generatedQuestions, responses, responseAnalyses, videoSummaries)
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoadingFeedbackIndex(null));
    };

    /** Average emotions from log entries in [start, end] for PDF segment alignment. */
    const getEmotionsForSegment = (emotionLog, start, end) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const inRange = emotionLog.filter((e) => e.time >= start && e.time <= end);
        if (inRange.length === 0) return null;
        const expressions = {};
        inRange.forEach((e) => {
            if (!e.expressions || typeof e.expressions !== 'object') return;
            Object.entries(e.expressions).forEach(([k, v]) => {
                if (typeof v === 'number' && v >= 0) expressions[k] = (expressions[k] ?? 0) + v;
            });
        });
        const n = inRange.length;
        Object.keys(expressions).forEach((k) => { expressions[k] = expressions[k] / n; });
        const dominant = inRange.map((e) => e.dominant).filter(Boolean).pop() ?? null;
        return { dominant, expressions: Object.keys(expressions).length ? expressions : null };
    };

    /** Fraction of log entries in [start, end] where isSpeaking was true (for video speaking vs silence). */
    const getPctSpeakingForSegment = (emotionLog, start, end) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const inRange = emotionLog.filter((e) => e.time >= start && e.time <= end);
        if (inRange.length === 0) return null;
        const speaking = inRange.filter((e) => e.isSpeaking === true).length;
        return speaking / inRange.length;
    };

    /** Average gaze (eye contact) score in [start, end]; null if no data. Returns 0–1. */
    const getAvgGazeForSegment = (emotionLog, start, end) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const inRange = emotionLog.filter((e) => e.time >= start && e.time <= end && typeof e.gazeScore === 'number');
        if (inRange.length === 0) return null;
        const sum = inRange.reduce((a, e) => a + e.gazeScore, 0);
        return sum / inRange.length;
    };

    /** Top N expression names from emotions object, sorted by score (for finer display). */
    const getTopExpressionNames = (expressions, n = 3) => {
        if (!expressions || typeof expressions !== 'object') return [];
        return Object.entries(expressions)
            .filter(([, v]) => typeof v === 'number' && v >= 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([k]) => k.replace(/_/g, ' '));
    };

    /** AU key to display label (e.g. browRaise -> "brow raise"). */
    const AU_LABELS = { browRaise: 'brow raise', browLower: 'brow lower', eyeWiden: 'eye widen', lipPress: 'lip press', mouthStretch: 'mouth stretch' };

    /** Average action units in [start, end]; null if no data. */
    const getAggregatedAUsForSegment = (emotionLog, start, end) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const inRange = emotionLog.filter((e) => e.time >= start && e.time <= end && e.actionUnits && typeof e.actionUnits === 'object');
        if (inRange.length === 0) return null;
        const keys = ['browRaise', 'browLower', 'eyeWiden', 'lipPress', 'mouthStretch'];
        const agg = {};
        keys.forEach((k) => { agg[k] = 0; });
        inRange.forEach((e) => {
            keys.forEach((k) => { if (typeof e.actionUnits[k] === 'number') agg[k] += e.actionUnits[k]; });
        });
        keys.forEach((k) => { agg[k] /= inRange.length; });
        return agg;
    };

    /** Top N AU names from actionUnits object, sorted by value. */
    const getTopAUNames = (actionUnits, n = 3) => {
        if (!actionUnits || typeof actionUnits !== 'object') return [];
        return Object.entries(actionUnits)
            .filter(([, v]) => typeof v === 'number' && v >= 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([k]) => (AU_LABELS[k] || k.replace(/([A-Z])/g, ' $1').trim().toLowerCase()));
    };

    /** Average gaze (eye contact) over the full emotion log for a question. */
    const getAvgGazeForQuestion = (emotionLog) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const withGaze = emotionLog.filter((e) => typeof e.gazeScore === 'number');
        if (withGaze.length === 0) return null;
        return withGaze.reduce((a, e) => a + e.gazeScore, 0) / withGaze.length;
    };

    /** Average action units over the full emotion log for a question. */
    const getAggregatedAUsForQuestion = (emotionLog) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const withAU = emotionLog.filter((e) => e.actionUnits && typeof e.actionUnits === 'object');
        if (withAU.length === 0) return null;
        const keys = ['browRaise', 'browLower', 'eyeWiden', 'lipPress', 'mouthStretch'];
        const agg = {};
        keys.forEach((k) => { agg[k] = 0; });
        withAU.forEach((e) => {
            keys.forEach((k) => { if (typeof e.actionUnits[k] === 'number') agg[k] += e.actionUnits[k]; });
        });
        keys.forEach((k) => { agg[k] /= withAU.length; });
        return agg;
    };

    /** One-line extras for a segment: eye contact %, top expressions, and top AUs (for display). */
    const getSegmentExtras = (emotionLog, start, end, segEmo) => {
        const parts = [];
        const avgGaze = getAvgGazeForSegment(emotionLog, start, end);
        if (avgGaze != null) parts.push(`Eye contact: ${Math.round(avgGaze * 100)}%`);
        if (segEmo?.expressions && Object.keys(segEmo.expressions).length > 0) {
            const top = getTopExpressionNames(segEmo.expressions, 3);
            if (top.length > 0) parts.push(`Top: ${top.join(', ')}`);
        }
        const segAUs = getAggregatedAUsForSegment(emotionLog, start, end);
        if (segAUs && Object.keys(segAUs).length > 0) {
            const topAUs = getTopAUNames(segAUs, 3);
            if (topAUs.length > 0) parts.push(`AUs: ${topAUs.join(', ')}`);
        }
        return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
    };

    /** Build a short video summary string for one question (for personalized feedback). */
    const buildVideoSummaryForQuestion = (index) => {
        const log = emotionLogs[index];
        const segments = transcriptSegments[index];
        const windows = getSegmentsWithGaps(segments, log);
        if (!Array.isArray(log) || log.length === 0) return '';
        const parts = [];
        const aggregated = getAggregatedEmotionsForQuestion(log);
        if (aggregated && Object.keys(aggregated).length > 0) {
            const str = Object.entries(aggregated)
                .filter(([, v]) => typeof v === 'number' && v >= 0)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                .join(', ');
            parts.push(`Facial: ${str}`);
            const top = getTopExpressionNames(aggregated, 3);
            if (top.length > 0) parts.push(`Top: ${top.join(', ')}`);
        }
        const avgGaze = getAvgGazeForQuestion(log);
        if (avgGaze != null) parts.push(`Eye contact: ${Math.round(avgGaze * 100)}%`);
        const questionAUs = getAggregatedAUsForQuestion(log);
        if (questionAUs && Object.keys(questionAUs).length > 0) {
            const auStrs = Object.entries(questionAUs)
                .filter(([, v]) => typeof v === 'number' && v >= 0)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => `${AU_LABELS[k] || k} ${Math.round((v ?? 0) * 100)}%`);
            if (auStrs.length > 0) parts.push(`Action units (micro-expressions): ${auStrs.join(', ')}. Top AUs: ${getTopAUNames(questionAUs, 3).join(', ')}`);
        }
        const pctSpeaking = log.filter((e) => e.isSpeaking === true).length / log.length;
        parts.push(`Speaking (mouth open): ${Math.round(pctSpeaking * 100)}% of time`);
        const gapWindows = windows.filter((w) => w.isGap);
        if (gapWindows.length > 0) {
            const silent = gapWindows.filter((w) => getPctSpeakingForSegment(log, w.start, w.end) != null && getPctSpeakingForSegment(log, w.start, w.end) < 0.2).length;
            const mouthOpen = gapWindows.filter((w) => getPctSpeakingForSegment(log, w.start, w.end) != null && getPctSpeakingForSegment(log, w.start, w.end) >= 0.4).length;
            parts.push(`Pauses: ${silent} silent, ${mouthOpen} with mouth open`);
        }
        return parts.join('. ');
    };

    /**
     * Single integrated label for a no-speech window: transcript + video (mouth) together.
     * Returns one short phrase so the line reads as one idea, e.g. "Silent" or "Pause (mouth open)".
     */
    const getGapLabel = (emotionLog, start, end) => {
        const pct = getPctSpeakingForSegment(emotionLog, start, end);
        if (pct == null) return 'Pause (no speech)';
        if (pct >= 0.4) return 'Pause — mouth open (possible speech)';
        if (pct >= 0.2) return 'Pause — some mouth movement';
        return 'Silent (mouth closed)';
    };

    /** Aggregate full emotion log for a question into one summary (average all expressions). */
    const getAggregatedEmotionsForQuestion = (emotionLog) => {
        if (!Array.isArray(emotionLog) || emotionLog.length === 0) return null;
        const expressions = {};
        emotionLog.forEach((e) => {
            if (!e.expressions || typeof e.expressions !== 'object') return;
            Object.entries(e.expressions).forEach(([k, v]) => {
                if (typeof v === 'number' && v >= 0) expressions[k] = (expressions[k] ?? 0) + v;
            });
        });
        const n = emotionLog.length;
        Object.keys(expressions).forEach((k) => { expressions[k] = expressions[k] / n; });
        return Object.keys(expressions).length ? expressions : null;
    };

    /** Fixed window size (seconds) for timeline chunks (speech + pauses). */
    const WINDOW_SIZE_SECONDS = 5;

    /**
     * Build a continuous list of time windows covering the whole recording.
     * Each item: { start, end, text: string | null, isGap: boolean }.
     * - text: phrases whose midpoint falls inside this window (so each phrase
     *   appears in at most one window instead of being duplicated across many)
     * - isGap: true when there is no speech in this window (only expressions / silence)
     */
    const getSegmentsWithGaps = (segments, emotionLog) => {
        const windows = [];
        const hasSegments = Array.isArray(segments) && segments.length > 0;
        const hasLog = Array.isArray(emotionLog) && emotionLog.length > 0;
        const totalDuration = hasLog
            ? emotionLog[emotionLog.length - 1].time
            : hasSegments
                ? segments[segments.length - 1].end
                : 0;
        if (!totalDuration) return windows;

        const windowCount = Math.max(1, Math.ceil(totalDuration / WINDOW_SIZE_SECONDS));
        for (let i = 0; i < windowCount; i++) {
            const start = i * WINDOW_SIZE_SECONDS;
            const end = i === windowCount - 1 ? totalDuration : (i + 1) * WINDOW_SIZE_SECONDS;
            windows.push({ start, end, text: null, isGap: true });
        }

        if (hasSegments) {
            const sortedSegments = [...segments].sort((a, b) => a.start - b.start);
            sortedSegments.forEach((seg) => {
                const mid = (seg.start + seg.end) / 2;
                const idx = Math.min(windowCount - 1, Math.max(0, Math.floor(mid / WINDOW_SIZE_SECONDS)));
                const t = (seg.text || '').trim();
                if (!t) return;
                windows[idx].text = windows[idx].text ? `${windows[idx].text} ${t}` : t;
                windows[idx].isGap = false;
            });
        }

        return windows;
    };

    /** Build and download a single PDF with questions, responses, model findings, and personalized feedback. */
    const handleDownloadInterviewPDF = () => {
        const sections = {};
        const overall = evaluationOverall;
        const overallLine = overall != null
            ? `Overall: ${t[`interviewBand_${overall.overallBand}`] ?? overall.overallBand} (${Math.round((overall.overallScore ?? 0) * 100)}%)`
            : 'Overall: —';
        sections['Interview details'] = [
            `Role: ${role || '—'}`,
            `Company: ${companyName || '—'}`,
            `Type: ${interviewType || '—'}`,
            `Questions: ${generatedQuestions?.length ?? 0}`,
            overallLine,
            `Generated: ${new Date().toLocaleString()}`
        ].join('\n');

        (generatedQuestions || []).forEach((question, index) => {
            const response = (responses[index] ?? '').trim() || '—';
            const emotionLog = emotionLogs[index];
            const aggregated = getAggregatedEmotionsForQuestion(emotionLog);
            const emotions = responseEmotions[index];
            const emotionsSource = (aggregated && Object.keys(aggregated).length > 0)
                ? aggregated
                : emotions?.expressions && Object.keys(emotions.expressions).length > 0
                    ? emotions.expressions
                    : null;
            const emotionsLine = emotionsSource
                ? Object.entries(emotionsSource)
                    .filter(([, v]) => typeof v === 'number' && v >= 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                    .join(', ')
                : '—';
            const segments = transcriptSegments[index];
            const withGaps = getSegmentsWithGaps(segments, emotionLog);
            const hasSegmentAlignment = withGaps.length > 0 && Array.isArray(emotionLog) && emotionLog.length > 0;
            const segmentLines = hasSegmentAlignment
                ? withGaps.map((seg) => {
                    const segEmo = getEmotionsForSegment(emotionLog, seg.start, seg.end);
                    const segEmoStr = segEmo?.expressions && Object.keys(segEmo.expressions).length > 0
                        ? Object.entries(segEmo.expressions)
                            .filter(([, v]) => typeof v === 'number' && v >= 0)
                            .sort((a, b) => b[1] - a[1])
                            .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                            .join(', ')
                        : '—';
                    const label = seg.isGap ? getGapLabel(emotionLog, seg.start, seg.end) : `"${seg.text}"`;
                    const extras = getSegmentExtras(emotionLog, seg.start, seg.end, segEmo);
                    return `[${seg.start.toFixed(1)}s–${seg.end.toFixed(1)}s] ${label} — ${segEmoStr}${extras}`;
                })
                : [];
            const analysis = responseAnalyses?.[index];
            const findings = analysis
                ? [
                    analysis.certainty?.label != null ? `Certainty: ${analysis.certainty.label}` : null,
                    analysis.answered?.label != null ? `Answered: ${analysis.answered.label}` : null,
                    analysis.relevance?.label != null ? `Relevance: ${analysis.relevance.label}` : null,
                    analysis.band != null && analysis.score != null ? `Band: ${analysis.band} (${Math.round(analysis.score * 100)}%)` : null
                ].filter(Boolean).join(' · ')
                : '—';
            const feedback = (feedbacks && feedbacks[index]) ? feedbacks[index].replace(/\*\*([^*]+)\*\*/g, '$1') : '—';
            const block = [
                question,
                '',
                'Your response:',
                response,
                '',
                'Emotions noted:',
                emotionsLine
            ];
            if (segmentLines.length > 0) {
                block.push('', 'Phrase-by-phrase (time-aligned):');
                segmentLines.forEach((line) => block.push(line));
            }
            block.push('', 'Model findings:', findings, '', 'Personalized feedback:', feedback);
            sections[`Question ${index + 1}`] = block.join('\n');
        });

        generatePDF(sections, {
            assistantType: 'interview',
            model: 'Interview Simulator',
            generatedAt: new Date()
        });
    };

    const startRecording = async () => {
        const SpeechRecognitionAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
        if (!SpeechRecognitionAPI) {
            console.warn('SpeechRecognition not supported; falling back to no live transcript.');
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setRecordingStream(stream);
            recordingStartTimeRef.current = Date.now();
            emotionLogRef.current = [];
            currentSegmentsRef.current = [];
            lastSegmentEndRef.current = 0;
            lastFinalTranscriptRef.current = '';

            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = document.documentElement?.lang === 'fr' ? 'fr-FR' : 'en-US';
                recognition.onresult = (e) => {
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        const res = e.results[i];
                        if (!res.isFinal) continue;
                        const text = res[0]?.transcript?.trim();
                        if (!text || text === lastFinalTranscriptRef.current) continue;
                        lastFinalTranscriptRef.current = text;
                        const start = lastSegmentEndRef.current;
                        const end = (Date.now() - recordingStartTimeRef.current) / 1000;
                        lastSegmentEndRef.current = end;
                        currentSegmentsRef.current.push({ start, end, text });
                        const qIdx = currentQuestionIndex;
                        setResponses(prev => {
                            const next = [...prev];
                            const cur = next[qIdx] ?? '';
                            next[qIdx] = cur ? cur + ' ' + text : text;
                            return next;
                        });
                    }
                };
                recognition.onerror = (e) => { if (e.error !== 'no-speech') console.warn('SpeechRecognition error:', e.error); };
                speechRecognitionRef.current = recognition;
                recognition.start();
            }

            emotionLogIntervalRef.current = setInterval(() => {
                const t = (Date.now() - recordingStartTimeRef.current) / 1000;
                const { dominant, secondary, expressions, mouthAspectRatio: mar, isSpeaking: speaking, gazeScore: gaze, actionUnits: au } = latestFaceRef.current;
                emotionLogRef.current.push({
                    time: t,
                    dominant: dominant ?? null,
                    secondary: secondary ?? null,
                    expressions: expressions ? { ...expressions } : {},
                    mouthAspectRatio: typeof mar === 'number' ? mar : 0,
                    isSpeaking: !!speaking,
                    gazeScore: typeof gaze === 'number' ? gaze : null,
                    actionUnits: au && typeof au === 'object' ? { ...au } : null
                });
            }, 800);

            const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recorder.onstop = () => stream.getTracks().forEach((t) => t.stop());
            recorder.start(1000);
            setIsRecording(true);
        } catch (err) {
            console.warn('Microphone access failed:', err);
        }
    };

    /** Stops recording, saves timestamped segments and emotion log for this question. */
    const stopRecording = (faceSnapshot) => {
        setRecordingStream(null);
        if (emotionLogIntervalRef.current) {
            clearInterval(emotionLogIntervalRef.current);
            emotionLogIntervalRef.current = null;
        }
        const sr = speechRecognitionRef.current;
        if (sr) {
            try { sr.stop(); } catch (_) {}
            speechRecognitionRef.current = null;
        }
        const qIdx = currentQuestionIndex;
        // Defer persisting segments so any final onresult (e.g. last phrase) that fires after stop() is included
        const persistSegmentsAndLog = () => {
            setTranscriptSegments(prev => {
                const next = [...prev];
                while (next.length <= qIdx) next.push([]);
                next[qIdx] = [...currentSegmentsRef.current];
                return next;
            });
            setEmotionLogs(prev => {
                const next = [...prev];
                while (next.length <= qIdx) next.push([]);
                next[qIdx] = [...emotionLogRef.current];
                return next;
            });
        };
        setTimeout(persistSegmentsAndLog, 150);
        if (faceSnapshot) {
            setResponseEmotions((prev) => {
                const next = [...prev];
                while (next.length <= qIdx) next.push(null);
                next[qIdx] = {
                    dominant: faceSnapshot.dominant ?? null,
                    expressions: faceSnapshot.expressions ? { ...faceSnapshot.expressions } : {}
                };
                return next;
            });
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (!inSummaryView || responseAnalyses !== null || analyzingResponses) return;
        setAnalyzingResponses(true);
        evaluateInterviewResponses(generatedQuestions, responses, interviewType)
            .then((data) => {
                setResponseAnalyses(data.items || []);
                setEvaluationOverall({ overallBand: data.overallBand, overallScore: data.overallScore });
            })
            .catch(() => {
                setResponseAnalyses([]);
                setEvaluationOverall(null);
            })
            .finally(() => setAnalyzingResponses(false));
    }, [inSummaryView, responseAnalyses, analyzingResponses, responses, generatedQuestions, interviewType]);

    // Automatically fetch personalized feedback once analysis is ready on the summary view.
    useEffect(() => {
        if (!inSummaryView) return;
        if (hasRequestedFeedback) return;
        if (!responseAnalyses || !responseAnalyses.length) return;
        if (loadingFeedbackIndex !== null) return;
        setHasRequestedFeedback(true);
        handleGetAllFeedback();
    }, [inSummaryView, responseAnalyses, loadingFeedbackIndex, hasRequestedFeedback]);

    const handleGenerateQuestions = async () => {
        if (!jobDescription || !role || !companyName || !interviewType) {
            setError(t.interviewErrorRequired);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const questions = await generateInterviewQuestions({
                jobDescription,
                role,
                companyWebsite,
                interviewType,
                resumeText,
                skills
            });

            setGeneratedQuestions(buildFinalQuestions(questions));
            setTailorAtTransitionIndex(1 + Math.floor(Math.random() * 3));
            setShowQuestionsModal(true);
            setSimulationActive(false);
            setCurrentQuestionIndex(0);
            setResponses([]);
        } catch (err) {
            console.error('Error generating questions:', err);
            setError(err.message || t.interviewErrorGenerate);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Resume upload: confirm identifiable info removed */}
            {showResumeConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={cancelResumeUpload}>
                    <div
                        className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className={`text-base font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            Have you removed all identifiable information from this document?
                        </p>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            For your privacy, remove or redact your name, address, phone, email, and any other personal details before continuing.
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={cancelResumeUpload}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                No, cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmResumeUpload}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                Yes, continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* PII detected: ask user to upload resume without identifiable info */}
            {showPIIWarningModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPIIWarningModal(false)}>
                    <div
                        className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className={`text-base font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            We detected possible identifiable information in your document.
                        </p>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Our check found: <span className="font-medium">{piiWarningSummary}</span>. Please upload a resume without this information to protect your privacy.
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowPIIWarningModal(false)}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push('/dashboard/career')}
                    className={`p-2 rounded-xl transition-all duration-200 ${isDark
                        ? 'bg-gray-800/80 hover:bg-gray-700 border border-gray-700/80 text-gray-300 hover:text-white shadow-lg shadow-black/20'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 shadow-md shadow-gray-200/80'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-transparent`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                        <Users className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.interviewSimulator}
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Practice with AI-generated questions
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${isDark
                ? 'bg-gray-900/90 border border-gray-700/80 shadow-xl shadow-black/30'
                : 'bg-white border border-gray-200/90 shadow-xl shadow-gray-300/40'
            } rounded-2xl p-6 sm:p-8 lg:p-10 transition-shadow duration-200`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-xl sm:text-2xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.interviewConfigure}
                    </h2>
                    <p className={`text-sm sm:text-base mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t.interviewConfigureDesc}
                    </p>

                    <div className="space-y-4">
                        {/* Job Description */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewJobDescription} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder={t.interviewPasteJobDesc}
                                rows={6}
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewRole} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder={t.interviewRolePlaceholder}
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Company name <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Company Website */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewCompanyWebsite} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <input
                                type="url"
                                value={companyWebsite}
                                onChange={(e) => setCompanyWebsite(e.target.value)}
                                placeholder={t.interviewWebsitePlaceholder}
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                            />
                        </div>

                        {/* Type of Interview */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewType} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <select
                                value={interviewType}
                                onChange={(e) => setInterviewType(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white'
                                    : 'bg-white border border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            >
                                <option value="">{t.interviewSelectType}</option>
                                {interviewTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Resume Upload */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewResume} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <input
                                ref={resumeFileInputRef}
                                type="file"
                                accept=".txt,.pdf"
                                onChange={handleResumeFileChange}
                                className={`w-full px-4 py-2.5 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white'
                                    : 'bg-white border border-gray-300 text-gray-900'
                                } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30`}
                            />
                            <p className={`mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                Supported formats: .txt, .pdf
                            </p>
                            {resumeFile && (
                                <p className={`mt-1.5 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    ✓ {resumeFile.name}
                                </p>
                            )}
                        </div>

                        {/* Skills List */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewSkills} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <textarea
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder={t.interviewSkillsPlaceholder}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                            />
                        </div>

                        {error && (
                            <div className={`p-3 rounded-xl ${isDark
                                ? 'bg-red-500/10 border border-red-500/50'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Generate Questions Button */}
                        <button
                            onClick={handleGenerateQuestions}
                            disabled={!jobDescription || !role || !companyName || !interviewType || isLoading}
                            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                !jobDescription || !role || !companyName || !interviewType || isLoading
                                    ? isDark
                                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{t.loading}</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    <span>{t.interviewGenerate}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Questions Modal - large viewport with AI interviewer avatar */}
            {showQuestionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-interview-backdrop-in" onClick={closeModal}>
                    <div className={(`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[90vh] max-h-[calc(100vh-2rem)] flex overflow-hidden border ${isDark ? 'border-gray-700/80' : 'border-gray-200'} shadow-2xl ${isDark ? 'shadow-black/50' : 'shadow-xl shadow-gray-400/20'} relative animate-interview-modal-in`)} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeModal}
                            className={(`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 z-20 ${isDark
                                ? 'bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 shadow-lg'
                                : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-md'
                            } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left pane: session info + controls at bottom (questions view + ending screen only) */}
                        {simulationActive && (
                            <div className={`hidden sm:flex flex-col items-stretch justify-between pt-8 pb-6 px-4 w-56 flex-shrink-0 border-r min-h-0 ${isDark ? 'border-gray-700/80 bg-gray-800/40' : 'border-gray-200 bg-gray-50/90'}`}>
                                <div className="flex-1 min-h-0 flex flex-col w-full">
                                    {/* Upper section: role + details, vertically centered within this block */}
                                    <div className={`flex-[2] min-h-0 flex flex-col justify-center items-center w-full gap-6 px-1`}>
                                        <p className={`text-sm font-semibold leading-snug text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {role || '—'}
                                        </p>
                                        <div className="w-full text-center space-y-4 flex flex-col items-center">
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {t.interviewCompanyName}: {companyName || '—'}
                                            </p>
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {t.interviewInterviewType}: {interviewType || '—'}
                                            </p>
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {t.interviewNumQuestions}: {generatedQuestions?.length ?? 0}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Divider */}
                                    <div className={`flex-shrink-0 border-t w-full ${isDark ? 'border-gray-600/50' : 'border-gray-200'}`} />
                                    {/* Lower section: download — greyed out until summary; blue button on summary that downloads PDF */}
                                    <div className="flex-1 min-h-0 flex flex-col justify-center items-center w-full px-1">
                                        {inSummaryView ? (
                                            <button
                                                type="button"
                                                onClick={handleDownloadInterviewPDF}
                                                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                                            >
                                                {t.interviewDownloadPlaceholder}
                                            </button>
                                        ) : (
                                            <p className={`text-xs leading-relaxed text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {t.interviewDownloadPlaceholder}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {currentQuestionIndex < generatedQuestions.length && (
                                    <div className="mt-auto pt-4 space-y-3 w-full border-t border-gray-600/50">
                                        <button
                                            type="button"
                                            onClick={speakQuestion}
                                            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isDark
                                                ? 'bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/50 shadow-lg shadow-emerald-500/10'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600 shadow-md shadow-emerald-500/20'
                                            }`}
                                        >
                                            <Volume2 className="w-4 h-4" aria-hidden />
                                            <span>{t.interviewListenQuestion ?? 'Listen'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopSpeech}
                                            title="Stop"
                                            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isDark
                                                ? 'bg-red-500/25 text-red-300 hover:bg-red-500/35 border border-red-500/50'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                            }`}
                                        >
                                            <Square className="w-4 h-4" aria-hidden />
                                            <span>Stop</span>
                                        </button>
                                        {!videoStream ? (
                                            <button
                                                type="button"
                                                onClick={startVideoPreview}
                                                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                                                    ? 'bg-gray-700/80 text-gray-200 hover:bg-gray-600 border border-gray-600'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                                                }`}
                                            >
                                                <Video className="w-4 h-4" />
                                                <span>Start camera</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopVideoPreview}
                                                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                                                }`}
                                            >
                                                <span>Stop camera</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
                        {/* Mobile: compact session bar (only when simulation is active) */}
                        {simulationActive && (
                            <div className={`sm:hidden flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-gray-700/80 bg-gray-800/60' : 'border-gray-200 bg-gray-50 shadow-sm'}`}>
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 ring-2 ${isDark ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-emerald-500/40' : 'bg-gradient-to-br from-emerald-400/40 to-teal-400/40 ring-emerald-400/40'}`} />
                                <div className="min-w-0">
                                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{role || '—'}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{companyName} · {interviewType} · {generatedQuestions?.length ?? 0} questions</p>
                                </div>
                            </div>
                        )}
                        <div className={`p-4 sm:p-6 flex-1 flex flex-col min-h-0 min-w-0 ${simulationActive && currentQuestionIndex < generatedQuestions.length ? 'overflow-hidden' : ''}`}>
                            {!simulationActive ? (
                                <div key="welcome" className="flex flex-col flex-1 min-h-0 animate-interview-view-in">
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="flex flex-col items-center justify-center text-center pt-16 pb-12 px-4 max-w-xl mx-auto flex-1">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                                                <Users className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                            </div>
                                            <h2 className={`text-3xl sm:text-4xl font-bold mb-5 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Welcome to Your Interview with <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{companyName || '—'}</span>
                                            </h2>
                                            <p className={`text-lg sm:text-xl mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                for the role of <span className="font-semibold">{role || '—'}</span>
                                            </p>
                                            <p className={`text-sm px-4 py-2 rounded-xl ${isDark ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                                {interviewType} interview · {generatedQuestions?.length ?? 0} questions
                                            </p>
                                            <p className={`text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            The simulation will use and capture your audio and video. When you’re ready, start the simulation to see the first question. 
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-6 flex gap-4 w-full max-w-2xl mx-auto">
                                            <button
                                                onClick={closeModal}
                                                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                                                    isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white shadow-lg'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 shadow-md'
                                                }`}
                                            >
                                                {t.interviewClose}
                                            </button>
                                            <button
                                                onClick={handleStartSimulation}
                                                className="flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                                            >
                                                {t.interviewStartSimulation}
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : currentQuestionIndex < generatedQuestions.length ? (
                                <div key={`q-${currentQuestionIndex}`} className="flex flex-col flex-1 min-h-0 gap-2 overflow-hidden animate-interview-slide-next">
                                    <div className="flex flex-col flex-1 min-h-0 gap-2 overflow-hidden">
                                        <div className={`flex-shrink-0 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700/80' : 'bg-gray-50/80 border border-gray-200'} shadow-sm overflow-hidden`}>
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/15 text-emerald-700'}`}>
                                                {t.interviewQuestionOf} {currentQuestionIndex + 1} {t.interviewOf} {generatedQuestions.length}
                                            </div>
                                            <div className={`text-base sm:text-lg font-bold leading-snug break-words space-y-2 max-h-[18vh] overflow-y-auto pr-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {parseQuestionWithCodeBlocks(generatedQuestions[currentQuestionIndex]).map((seg, idx) =>
                                                seg.type === 'text' ? (
                                                    <div key={idx} className="whitespace-pre-wrap">{seg.content}</div>
                                                ) : (
                                                    <div
                                                        key={idx}
                                                        className={`rounded-lg border overflow-hidden text-left text-sm font-normal shadow-inner ${isDark
                                                            ? 'bg-gray-800 border-gray-600 text-gray-100'
                                                            : 'bg-white border-gray-200 text-gray-800'
                                                        }`}
                                                    >
                                                        {seg.language && (
                                                            <div className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-gray-700 text-emerald-400' : 'bg-gray-100 text-emerald-700'}`}>
                                                                {seg.language}
                                                            </div>
                                                        )}
                                                        <pre className="p-2 overflow-x-auto text-xs leading-relaxed m-0 max-h-[12vh] overflow-y-auto">
                                                            <code
                                                                className="font-mono"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: seg.language === 'python' ? highlightPythonCode(seg.code) : seg.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                                                }}
                                                            />
                                                        </pre>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        {pendingFollowUpQuestion && (
                                            <div className={`flex-shrink-0 mt-2 p-3 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/40' : 'bg-amber-50 border-amber-200'}`}>
                                                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Follow-up</p>
                                                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{pendingFollowUpQuestion}</p>
                                                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Answer briefly if you like, then click Continue to go to the next question.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1 min-h-0 gap-2 min-w-0 overflow-hidden">
                                        {/* Mobile-only: Listen / Stop / Start camera (left pane hidden on small screens) */}
                                        <div className="flex sm:hidden flex-wrap items-center gap-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={speakQuestion}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold ${isDark
                                                    ? 'bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/50'
                                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600'
                                                }`}
                                            >
                                                <Volume2 className="w-4 h-4" />
                                                <span>Listen</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopSpeech}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold ${isDark
                                                    ? 'bg-red-500/25 text-red-300 hover:bg-red-500/35 border border-red-500/50'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                                }`}
                                            >
                                                <Square className="w-4 h-4" />
                                                <span>Stop</span>
                                            </button>
                                            {!videoStream ? (
                                                <button
                                                    type="button"
                                                    onClick={startVideoPreview}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${isDark
                                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    <Video className="w-4 h-4" />
                                                    <span>Start camera</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={stopVideoPreview}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${isDark
                                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    }`}
                                                >
                                                    <span>Stop camera</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Two camera slots side by side: User | Avatar */}
                                        <div className="flex-1 min-h-0 flex gap-2 min-w-0">
                                            {/* User camera slot: interviewee card + video */}
                                            <div className={`flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden border shadow-md ${isDark ? 'border-gray-600/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                                {/* Interviewee persona card (placeholder) */}
                                                <div className={`flex-shrink-0 px-3 py-2 border-b ${isDark ? 'border-gray-600/80 bg-gray-800/50' : 'border-gray-200 bg-gray-100/80'}`}>
                                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Interviewee</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Role here</p>
                                                </div>
                                                <div className="w-full flex-1 min-h-0 flex flex-col">
                                                    {!videoStream ? (
                                                        <div className={`flex-1 flex flex-col items-center justify-center gap-2 min-h-0 ${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-100/80 text-gray-500'}`}>
                                                            <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/80'}`}>
                                                                <Video className="w-8 h-8 opacity-60" />
                                                            </div>
                                                            <span className="text-xs text-center px-2">Your video will appear here.</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="relative flex-1 min-h-0 w-full bg-black/20 flex items-center justify-center">
                                                                <video
                                                                    ref={videoPreviewRef}
                                                                    autoPlay
                                                                    muted
                                                                    playsInline
                                                                    className="max-w-full max-h-full w-full h-full object-contain"
                                                                />
                                                                <span className={`absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded ${isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-gray-800'}`}>
                                                                    You
                                                                </span>
                                                            </div>
                                                            <div className={`flex flex-wrap items-center gap-2 px-2 py-1.5 flex-shrink-0 border-t ${isDark ? 'border-gray-600 bg-gray-800/60' : 'border-gray-200 bg-gray-100/80'}`}>
                                                                {faceLoading && (
                                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading face analysis...</p>
                                                                )}
                                                                {faceError && (
                                                                    <p className="text-xs text-amber-500">{faceError}</p>
                                                                )}
                                                                {!faceLoading && !faceError && faceDominant && (
                                                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                                        Expression: <span className="capitalize">{faceDominant.replace(/_/g, ' ')}</span>
                                                                        {faceSecondary && faceSecondary !== faceDominant && (
                                                                            <span className="opacity-80">, also <span className="capitalize">{faceSecondary.replace(/_/g, ' ')}</span></span>
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {faceExpressions && Object.keys(faceExpressions).length > 0 && (
                                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`} title={Object.entries(faceExpressions).map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`).join(', ')}>
                                                                        {Object.entries(faceExpressions)
                                                                            .filter(([, v]) => v > 0.1)
                                                                            .sort((a, b) => b[1] - a[1])
                                                                            .slice(0, 3)
                                                                            .map(([k]) => k.replace(/_/g, ' '))
                                                                            .join(', ')}
                                                                    </p>
                                                                )}
                                                                {typeof faceGazeScore === 'number' && (
                                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                        Eye contact: {Math.round(faceGazeScore * 100)}%
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {videoError && !videoStream && (
                                                    <p className="text-sm text-red-400 px-3 py-2">{videoError}</p>
                                                )}
                                            </div>
                                            {/* Avatar slot: interviewer persona card + VRM avatar */}
                                            <div className={`flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden border shadow-md ${isDark ? 'border-gray-600/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                                {/* Interviewer persona card */}
                                                <div className={`flex-shrink-0 px-3 py-2 border-b ${isDark ? 'border-gray-600/80 bg-gray-800/50' : 'border-gray-200 bg-gray-100/80'}`}>
                                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alex Chen</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{role || 'Senior Software Engineer'}</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{companyName || '—'}</p>
                                                </div>
                                                <div className="flex-1 min-h-0 min-w-0 flex flex-col">
                                                    <InterviewAvatarVrm className="flex-1 min-h-0" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Waveforms below cameras: same style for both */}
                                        <div className={`flex-shrink-0 flex gap-2 items-stretch px-2 py-2 rounded-b-xl border-t ${isDark ? 'border-gray-600/80 bg-gray-800/40' : 'border-gray-200 bg-gray-100/60'}`}>
                                            <div className="flex-1 min-w-0 flex flex-col rounded-lg overflow-hidden">
                                                {recordingStream ? (
                                                    <UserWaveform stream={recordingStream} isDark={isDark} />
                                                ) : (
                                                    <WaveformBars heights={Array(WAVEFORM_BAR_COUNT).fill(0.15)} isDark={isDark} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col rounded-lg overflow-hidden">
                                                <AvatarWaveform isActive={isAvatarSpeaking} isDark={isDark} />
                                            </div>
                                        </div>

                                        {!isRecording && ((responses[currentQuestionIndex] ?? '').trim() || (transcriptSegments[currentQuestionIndex]?.length > 0)) && (
                                            <div className={`rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'} p-3 flex flex-col min-h-0`}>
                                                <p className={`text-xs font-semibold mb-1 flex-shrink-0 ${isDark ? 'text-white' : 'text-gray-700'}`}>{t.interviewTranscript ?? 'Transcript'}</p>
                                                <div className="min-h-0 overflow-y-auto max-h-[50vh] pr-1 -mr-1">
                                                    <textarea
                                                        id="interview-response"
                                                        value={responses[currentQuestionIndex] ?? ''}
                                                        onChange={(e) => handleResponseChange(e.target.value)}
                                                        rows={2}
                                                        className={`w-full px-2 py-1.5 rounded text-xs min-h-[48px] max-h-[80px] resize-y ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-300 text-gray-700'}`}
                                                        placeholder={t.interviewEditTranscript ?? 'Edit if needed...'}
                                                    />
                                                    {(getAggregatedEmotionsForQuestion(emotionLogs[currentQuestionIndex]) || responseEmotions[currentQuestionIndex] || (transcriptSegments[currentQuestionIndex]?.length > 0 && emotionLogs[currentQuestionIndex]?.length > 0)) && (
                                                        <div className={`mt-2 pt-2 border-t ${isDark ? 'border-gray-600/50 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                                                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Emotions noted</p>
                                                        {(() => {
                                                            const aggregated = getAggregatedEmotionsForQuestion(emotionLogs[currentQuestionIndex]);
                                                            const snapshot = responseEmotions[currentQuestionIndex]?.expressions;
                                                            const emotionsSource = (aggregated && Object.keys(aggregated).length > 0) ? aggregated : (snapshot && Object.keys(snapshot).length > 0 ? snapshot : null);
                                                            const avgGaze = getAvgGazeForQuestion(emotionLogs[currentQuestionIndex]);
                                                            const topNames = emotionsSource ? getTopExpressionNames(emotionsSource, 3) : [];
                                                            return (
                                                                <>
                                                                    {emotionsSource ? (
                                                                        <p className="text-xs leading-relaxed mb-1">
                                                                            {Object.entries(emotionsSource)
                                                                                .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                                .sort((a, b) => b[1] - a[1])
                                                                                .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                                .join(' · ')}
                                                                        </p>
                                                                    ) : (transcriptSegments[currentQuestionIndex]?.length > 0 && emotionLogs[currentQuestionIndex]?.length > 0) ? null : (
                                                                        <p className="text-xs opacity-75 mb-1">No face detected</p>
                                                                    )}
                                                                    {(avgGaze != null || topNames.length > 0) && (
                                                                        <p className="text-xs leading-relaxed opacity-90">
                                                                            {avgGaze != null && <span>Eye contact: {Math.round(avgGaze * 100)}%</span>}
                                                                            {avgGaze != null && topNames.length > 0 && ' · '}
                                                                            {topNames.length > 0 && <span>Top: {topNames.join(', ')}</span>}
                                                                        </p>
                                                                    )}
                                                                    {(() => {
                                                                        const questionAUs = getAggregatedAUsForQuestion(emotionLogs[currentQuestionIndex]);
                                                                        const topAUs = questionAUs ? getTopAUNames(questionAUs, 3) : [];
                                                                        return topAUs.length > 0 ? (
                                                                            <p className="text-xs leading-relaxed opacity-90">Micro-expressions (AUs): {topAUs.join(', ')}</p>
                                                                        ) : null;
                                                                    })()}
                                                                </>
                                                            );
                                                        })()}
                                                        {getSegmentsWithGaps(transcriptSegments[currentQuestionIndex], emotionLogs[currentQuestionIndex]).length > 0 && emotionLogs[currentQuestionIndex]?.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>Per phrase / pause</p>
                                                                {getSegmentsWithGaps(transcriptSegments[currentQuestionIndex], emotionLogs[currentQuestionIndex]).map((seg, i) => {
                                                                    const segEmo = getEmotionsForSegment(emotionLogs[currentQuestionIndex], seg.start, seg.end);
                                                                    const str = segEmo?.expressions && Object.keys(segEmo.expressions).length > 0
                                                                        ? Object.entries(segEmo.expressions)
                                                                            .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                            .sort((a, b) => b[1] - a[1])
                                                                            .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                            .join(', ')
                                                                        : '—';
                                                                    const label = seg.isGap ? getGapLabel(emotionLogs[currentQuestionIndex], seg.start, seg.end) : `"${seg.text}"`;
                                                                    const extras = getSegmentExtras(emotionLogs[currentQuestionIndex], seg.start, seg.end, segEmo);
                                                                    return (
                                                                        <p key={i} className="text-xs leading-snug">
                                                                            <span className="opacity-75">[{seg.start.toFixed(1)}s–{seg.end.toFixed(1)}s]</span> {label} — {str}
                                                                            {extras && <span className="opacity-80">{extras}</span>}
                                                                        </p>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex items-stretch gap-2 sm:gap-3 pt-2 flex-shrink-0 border-t mt-2 ${isDark ? 'border-gray-700/60' : 'border-gray-200'}`}>
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentQuestionIndex === 0}
                                            className={`flex-1 min-w-0 px-2 sm:px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                                currentQuestionIndex === 0
                                                    ? isDark ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 shadow-md'
                                            }`}
                                        >
                                            <ChevronLeft className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{t.interviewPrevious}</span>
                                        </button>
                                        {isRecording ? (
                                            <button
                                                type="button"
                                                onClick={() => stopRecording({ dominant: faceDominant, expressions: faceExpressions ? { ...faceExpressions } : {} })}
                                                className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 rounded-xl font-semibold text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                                {t.interviewStopRecording ?? 'Stop recording'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                disabled={isTranscribing}
                                                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 rounded-xl text-sm font-semibold ${isTranscribing
                                                    ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                            >
                                                {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Mic className="w-4 h-4 shrink-0" />}
                                                {isTranscribing ? (t.interviewTranscribing ?? 'Transcribing...') : (t.interviewRecord ?? 'Start recording')}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={pendingFollowUpQuestion ? dismissFollowUpAndAdvance : handleNext}
                                            disabled={isTailoringNextQuestion || isLoadingFollowUp}
                                            className={`flex-1 min-w-0 px-2 sm:px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg ${isTailoringNextQuestion || isLoadingFollowUp
                                                ? 'bg-emerald-500/70 text-white cursor-wait shadow-emerald-500/20'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {isTailoringNextQuestion ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                                                    <span className="truncate">Preparing next question...</span>
                                                </>
                                            ) : isLoadingFollowUp ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                                                    <span className="truncate">Checking for follow-up...</span>
                                                </>
                                            ) : pendingFollowUpQuestion ? (
                                                <>
                                                    <span className="truncate">Continue</span>
                                                    <ChevronRight className="w-4 h-4 shrink-0" />
                                                </>
                                            ) : (
                                                <>
                                                    <span className="truncate">{currentQuestionIndex === generatedQuestions.length - 1 ? t.interviewFinish : t.interviewNext}</span>
                                                    <ChevronRight className="w-4 h-4 shrink-0" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            ) : (
                                <div key="summary" className="flex-1 flex flex-col min-h-0 animate-interview-view-in">
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="flex-shrink-0">
                                            <div className="text-center mb-6">
                                                {evaluationOverall && !analyzingResponses && (
                                                    <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg ${isDark ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-emerald-50 border border-emerald-200 shadow-emerald-500/10'}`}>
                                                        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                                            {t.interviewOverall}: {t[`interviewBand_${evaluationOverall.overallBand}`] ?? evaluationOverall.overallBand}
                                                        </span>
                                                        <span className={`text-xs font-medium ${isDark ? 'text-emerald-400/90' : 'text-emerald-600'}`}>
                                                            ({Math.round((evaluationOverall.overallScore ?? 0) * 100)}%)
                                                        </span>
                                                    </div>
                                                )}
                                                {analyzingResponses && (
                                                    <p className={`mt-2 text-sm flex items-center justify-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        {t.interviewAnalyzing}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {showSummaryProgress && (
                                            <div className="px-2 sm:px-4 mb-4 max-w-2xl mx-auto">
                                                <div className="flex items-center justify-between text-[11px] mb-1 text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-2 h-2 rounded-full ${evaluationReady ? 'bg-emerald-400' : 'bg-emerald-500/40 animate-pulse'}`} />
                                                        <span>{evaluationReady ? 'Model evaluation complete' : 'Running model evaluation'}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-2 h-2 rounded-full ${feedbackReady ? 'bg-sky-400' : isFeedbackLoading ? 'bg-sky-500/60 animate-pulse' : 'bg-gray-500/40'}`} />
                                                        <span>{feedbackReady ? 'Personalized feedback ready' : 'Generating personalized feedback'}</span>
                                                    </span>
                                                </div>
                                                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/80' : 'bg-gray-200'}`}>
                                                    <div
                                                        className={`${isDark ? 'bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400' : 'bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500'} h-full transition-all duration-500`}
                                                        style={{ width: `${Math.max(10, Math.min(100, summaryProgress))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
                                        {generatedQuestions.map((question, index) => {
                                            const analysis = responseAnalyses?.[index];
                                            const emotions = analysis?.emotion?.emotions ?? [];
                                            const emotionText = emotions.length > 0
                                                ? emotions.slice(0, 4).map((e) => `${(e.label || '').charAt(0).toUpperCase()}${(e.label || '').slice(1).toLowerCase()}${e.score != null ? ` (${Math.round(e.score * 100)}%)` : ''}`).filter(Boolean).join(', ')
                                                : (t.interviewEmotionNone ?? 'No emotions detected');
                                            const certaintyLabel = analysis?.certainty?.label;
                                            const certaintyT = certaintyLabel === 'confident' ? t.interviewConfident : certaintyLabel === 'uncertain' ? t.interviewUncertain : certaintyLabel === 'hedging' ? t.interviewHedging : t.interviewNeutral;
                                            const toneLabel = analysis?.tone?.tone;
                                            const answeredLabel = analysis?.answered?.label;
                                            const answeredT = answeredLabel === 'fully_answered' ? t.interviewAnsweredFully : answeredLabel === 'partially_answered' ? t.interviewAnsweredPartial : t.interviewAnsweredNot;
                                            const relevanceLabel = analysis?.relevance?.label;
                                            const relevanceT = relevanceLabel === 'high' ? t.interviewRelevanceHigh : relevanceLabel === 'medium' ? t.interviewRelevanceMedium : t.interviewRelevanceLow;
                                            const formalityLabel = analysis?.formality?.label;
                                            const formalityT = formalityLabel === 'formal' ? t.interviewFormal : t.interviewInformal;
                                            const band = analysis?.band;
                                            const scorePct = analysis?.score != null ? Math.round(analysis.score * 100) : null;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`p-6 rounded-2xl shadow-sm ${isDark
                                                        ? 'bg-gray-800/50 border border-gray-700/80'
                                                        : 'bg-gray-50 border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isDark
                                                            ? 'bg-emerald-500/25 text-emerald-400 ring-1 ring-emerald-500/30'
                                                            : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <p className={`text-lg font-medium flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {question}
                                                        </p>
                                                        {band != null && scorePct != null && !analyzingResponses && (
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                                {t[`interviewBand_${band}`] ?? band} ({scorePct}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`pl-12 border-l-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                                                        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                                            {t.interviewTranscript ?? 'Transcript'}
                                                        </p>
                                                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                                                            {responses[index]?.trim() || '—'}
                                                        </p>
                                                        {(getAggregatedEmotionsForQuestion(emotionLogs[index]) || responseEmotions[index] || getSegmentsWithGaps(transcriptSegments[index], emotionLogs[index]).length > 0) && (
                                                            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-600/50 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                                                                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Facial analysis</p>
                                                                {(() => {
                                                                    const aggregated = getAggregatedEmotionsForQuestion(emotionLogs[index]);
                                                                    const snapshot = responseEmotions[index]?.expressions;
                                                                    const emotionsSource = (aggregated && Object.keys(aggregated).length > 0) ? aggregated : (snapshot && Object.keys(snapshot).length > 0 ? snapshot : null);
                                                                    const avgGaze = getAvgGazeForQuestion(emotionLogs[index]);
                                                                    const topNames = emotionsSource ? getTopExpressionNames(emotionsSource, 3) : [];
                                                                    return (
                                                                        <>
                                                                            {emotionsSource ? (
                                                                                <p className="text-xs leading-relaxed mb-1">
                                                                                    {Object.entries(emotionsSource)
                                                                                        .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                                        .sort((a, b) => b[1] - a[1])
                                                                                        .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                                        .join(' · ')}
                                                                                </p>
                                                                            ) : null}
                                                                            {(avgGaze != null || topNames.length > 0) && (
                                                                                <p className="text-xs leading-relaxed opacity-90 mb-2">
                                                                                    {avgGaze != null && <span>Eye contact: {Math.round(avgGaze * 100)}%</span>}
                                                                                    {avgGaze != null && topNames.length > 0 && ' · '}
                                                                                    {topNames.length > 0 && <span>Top: {topNames.join(', ')}</span>}
                                                                                </p>
                                                                            )}
                                                                            {(() => {
                                                                                const questionAUs = getAggregatedAUsForQuestion(emotionLogs[index]);
                                                                                const topAUs = questionAUs ? getTopAUNames(questionAUs, 3) : [];
                                                                                return topAUs.length > 0 ? (
                                                                                    <p className="text-xs leading-relaxed opacity-90 mb-2">Micro-expressions (AUs): {topAUs.join(', ')}</p>
                                                                                ) : null;
                                                                            })()}
                                                                        </>
                                                                    );
                                                                })()}
                                                                {getSegmentsWithGaps(transcriptSegments[index], emotionLogs[index]).length > 0 && emotionLogs[index]?.length > 0 && (
                                                                    <div className="mt-2 space-y-1">
                                                                        <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>Per phrase / pause</p>
                                                                        {getSegmentsWithGaps(transcriptSegments[index], emotionLogs[index]).map((seg, i) => {
                                                                            const segEmo = getEmotionsForSegment(emotionLogs[index], seg.start, seg.end);
                                                                            const str = segEmo?.expressions && Object.keys(segEmo.expressions).length > 0
                                                                                ? Object.entries(segEmo.expressions)
                                                                                    .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                                    .sort((a, b) => b[1] - a[1])
                                                                                    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                                    .join(', ')
                                                                                : '—';
                                                                            const label = seg.isGap ? getGapLabel(emotionLogs[index], seg.start, seg.end) : `"${seg.text}"`;
                                                                            const extras = getSegmentExtras(emotionLogs[index], seg.start, seg.end, segEmo);
                                                                            return (
                                                                                <p key={i} className="text-xs leading-snug">
                                                                                    <span className="opacity-75">[{seg.start.toFixed(1)}s–{seg.end.toFixed(1)}s]</span> {label} — {str}
                                                                                    {extras && <span className="opacity-80">{extras}</span>}
                                                                                </p>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {analysis && !analyzingResponses && (responses[index]?.trim() || '').length > 0 && (
                                                            <div className="mt-4">
                                                                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                                                    Sentiment analysis
                                                                </p>
                                                                <div className="mt-1 flex flex-wrap gap-2">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                                                                        {t.interviewEmotion}: {emotionText}
                                                                    </span>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        certaintyLabel === 'confident' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                                                                        certaintyLabel === 'uncertain' || certaintyLabel === 'hedging' ? (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700') :
                                                                        isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {t.interviewCertainty}: {certaintyT}
                                                                    </span>
                                                                    {toneLabel != null && (
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                                                                            {t.interviewTone}: {toneLabel}
                                                                        </span>
                                                                    )}
                                                                    {answeredLabel != null && (
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            answeredLabel === 'fully_answered' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                                                                            answeredLabel === 'not_answered' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') :
                                                                            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                                        }`}>
                                                                            {t.interviewAnswered}: {answeredT}
                                                                        </span>
                                                                    )}
                                                                    {relevanceLabel != null && (
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                            {t.interviewRelevance}: {relevanceT}
                                                                        </span>
                                                                    )}
                                                                    {formalityLabel != null && (
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-slate-500/20 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                                            {t.interviewFormality}: {formalityT}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {feedbacks && feedbacks[index] && (
                                                            <div className={`mt-4 p-4 rounded-xl text-sm shadow-sm ${isDark ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-sky-50 border border-sky-200'}`}>
                                                                <p className={`font-semibold mb-2 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>{t.interviewAIFeedback}</p>
                                                                <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    {(feedbacks[index] || '').replace(/\*\*([^*]+)\*\*/g, '$1')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </div>

                                        <div className={`flex-shrink-0 pt-4 mt-4 flex border-t ${isDark ? 'border-gray-700/80' : 'border-gray-200'}`}>
                                            <button
                                                onClick={() => setShowThankYouPopup(true)}
                                                className={`w-full px-6 py-3.5 mt-4 rounded-xl font-semibold transition-all duration-200 ${
                                                    isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 shadow-md'
                                                }`}
                                            >
                                                {t.interviewClose}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>

                        {/* Thank-you popup (after Close on summary) */}
                        {showThankYouPopup && (
                            <ThankYouOverlay
                                companyName={companyName}
                                evaluationOverall={evaluationOverall}
                                getThankYouSummary={getThankYouSummary}
                                isDark={isDark}
                                t={t}
                                onClose={closeModal}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

