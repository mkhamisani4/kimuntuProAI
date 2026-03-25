'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2, Mic, Video, TrendingUp, AlertCircle, X, FileText, ChevronRight, ChevronDown, Sparkles, MessageSquare, LayoutDashboard, Download } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { generateInterviewQuestions, extractResumeText } from '@/services/openaiService';
import { evaluateInterviewResponses, getInterviewFeedback } from '@/services/responseAnalysisService';
import { useFaceExpressionAnalysis } from '@/hooks/useFaceExpressionAnalysis';
import { generatePDF } from '@/lib/pdf/generatePDF';
import InterviewLiveAvatar from '@/components/InterviewLiveAvatar';
import InterviewLiveAvatarEmbed from '@/components/InterviewLiveAvatarEmbed';
import dynamic from 'next/dynamic';

/** Hosted iframe embed: https://embed.liveavatar.com/v1/{id} — no backend token; cannot drive per-question script */
const LIVE_AVATAR_EMBED_ID = (process.env.NEXT_PUBLIC_LIVEAVATAR_EMBED_ID || '').trim();
const LIVE_AVATAR_EMBED_URL = (process.env.NEXT_PUBLIC_LIVEAVATAR_EMBED_URL || '').trim();
/**
 * Web SDK (sandbox or full API): one session for the whole simulation; repeat() per question.
 * When NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR=true, SDK wins over embed (embed vars ignored for the slot).
 */
const USE_LIVE_AVATAR_SDK = process.env.NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR === 'true';
const USE_LIVE_AVATAR_EMBED =
    !USE_LIVE_AVATAR_SDK && Boolean(LIVE_AVATAR_EMBED_ID || LIVE_AVATAR_EMBED_URL);

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

/**
 * Split AI feedback into titled sections ("Label: body"). Handles **markdown**, blank-line bullets, or line-start labels.
 */
function parseFeedbackIntoSections(text) {
    if (!text || typeof text !== 'string') return [];
    const cleaned = text.replace(/\*\*/g, '').trim();
    if (!cleaned) return [];

    const parseBlock = (block) => {
        const lines = block.split('\n');
        const first = lines[0];
        const m = first.match(/^([^:\n]{1,100}):\s*(.*)$/);
        if (m && m[1].trim().length >= 2 && m[1].trim().split(/\s+/).length <= 15) {
            const body = [m[2], ...lines.slice(1)].filter(Boolean).join('\n').trim();
            return { title: `${m[1].trim()}:`, body };
        }
        return null;
    };

    const blocks = cleaned.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    const sections = [];
    for (const block of blocks) {
        const p = parseBlock(block);
        if (p) sections.push(p);
        else sections.push({ title: 'Feedback', body: block });
    }

    if (sections.length === 1 && sections[0].title === 'Feedback' && sections[0].body.includes('\n')) {
        const lines = sections[0].body.split('\n');
        const multi = [];
        let cur = null;
        for (const line of lines) {
            const m = line.match(/^([^:\n]{1,100}):\s*(.*)$/);
            if (m && m[1].trim().split(/\s+/).length <= 15 && m[1].length < 95) {
                if (cur) multi.push(cur);
                cur = { title: `${m[1].trim()}:`, body: (m[2] || '').trim() };
            } else if (cur) {
                cur.body += (cur.body ? '\n' : '') + line;
            } else {
                multi.push({ title: 'Feedback', body: line });
            }
        }
        if (cur) multi.push(cur);
        if (multi.length > 1) {
            return multi.filter((s) => s.body?.trim() || s.title !== 'Feedback');
        }
    }

    return sections.filter((s) => s.body?.trim() || s.title !== 'Feedback');
}

/**
 * Roll up personalized feedback section headings across questions into top themes
 * (same idea as the per-question accordion, aggregated for the report card).
 */
function aggregateImprovementsFromFeedback(feedbacksList) {
    const list = Array.isArray(feedbacksList) ? feedbacksList : [];
    if (!list.some((f) => f && String(f).trim())) return [];

    const slugKey = (title) =>
        String(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

    const map = new Map();
    for (let qi = 0; qi < list.length; qi++) {
        const text = list[qi];
        if (!text || !String(text).trim()) continue;
        const sections = parseFeedbackIntoSections(String(text));
        for (const sec of sections) {
            const rawTitle = (sec.title || '').replace(/:\s*$/, '').trim() || 'Feedback';
            const norm = rawTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (!norm) continue;
            const body = String(sec.body || '')
                .replace(/\s+/g, ' ')
                .trim();
            if (!map.has(norm)) {
                map.set(norm, { displayTitle: rawTitle, bodiesByQ: new Map() });
            }
            const entry = map.get(norm);
            if (rawTitle.length > entry.displayTitle.length) entry.displayTitle = rawTitle;
            if (body && !entry.bodiesByQ.has(qi)) entry.bodiesByQ.set(qi, body);
        }
    }

    const totalSlots = list.length;
    const rows = [...map.values()].map((e) => {
        const bodies = [...e.bodiesByQ.values()];
        let hint = bodies[0] || '';
        if (bodies.length > 1 && hint.length < 140) {
            hint = `${hint} ${bodies[1]}`.trim();
        }
        if (hint.length > 320) hint = `${hint.slice(0, 317)}…`;
        return {
            key: slugKey(e.displayTitle),
            title: e.displayTitle,
            hint: hint || 'Open Personalized feedback for this question for full detail.',
            mentionCount: e.bodiesByQ.size,
            totalSlots,
        };
    });

    rows.sort((a, b) => b.mentionCount - a.mentionCount || b.hint.length - a.hint.length);
    return rows.slice(0, 3);
}

/** Collapsible panel for summary sections (emotions tab). */
function SummaryCollapsible({ title, isDark, defaultOpen, children }) {
    const [open, setOpen] = useState(defaultOpen ?? false);
    return (
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-600/60 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold ${isDark ? 'text-gray-200 hover:bg-gray-700/40' : 'text-gray-800 hover:bg-gray-50'}`}
            >
                <span className="truncate">{title}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div
                    className={`px-3 pb-3 pt-2 text-xs leading-relaxed border-t ${
                        isDark ? 'border-gray-600/50 text-gray-200' : 'border-gray-100 text-gray-700'
                    }`}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

/** Accordion list for personalized feedback bullets. */
function InterviewFeedbackAccordion({ feedbackText, isDark, questionIndex }) {
    const sections = parseFeedbackIntoSections(feedbackText || '');
    const [open, setOpen] = useState(() => new Set());

    useEffect(() => {
        setOpen(new Set());
    }, [questionIndex, feedbackText]);

    const toggle = (i) => {
        setOpen((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });
    };

    const display = (feedbackText || '').replace(/\*\*([^*]+)\*\*/g, '$1');

    if (!sections.length) {
        return (
            <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {display.trim() || '—'}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {sections.map((sec, i) => {
                const isOpen = open.has(i);
                const headingLabel = (sec.title || '').replace(/:\s*$/, '').trim() || sec.title;
                return (
                    <div
                        key={`${sec.title}-${i}`}
                        className={`rounded-lg border overflow-hidden ${isDark ? 'border-sky-500/25 bg-sky-500/5' : 'border-sky-200 bg-white'}`}
                    >
                        <button
                            type="button"
                            onClick={() => toggle(i)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold ${isDark ? 'text-sky-200 hover:bg-sky-500/10' : 'text-sky-800 hover:bg-sky-50'}`}
                        >
                            <span className="truncate">{headingLabel}</span>
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <div
                                className={`px-3 pb-3 pt-0 text-sm leading-relaxed border-t whitespace-pre-wrap ${isDark ? 'border-sky-500/20 text-gray-300' : 'border-sky-100 text-gray-700'}`}
                            >
                                {sec.body}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** Spoken / on-screen intro before question 1 (Alex Chen persona). */
function getInterviewerIntroScript({ companyName, role, interviewType, numQuestions, language }) {
    const co = (companyName || 'the company').trim();
    const r = (role || 'this role').trim();
    const it = (interviewType || 'practice').trim();
    const n = Math.max(1, numQuestions || 1);
    if (language === 'fr') {
        return (
            `Bonjour, je suis Alex Chen, responsable du recrutement chez ${co}. ` +
            `Je vais mener votre entrevue ${it} pour le poste de ${r}. ` +
            `Nous avons environ ${n} questions. Prenez votre temps : utilisez le bouton d’enregistrement quand vous êtes prêt à répondre. ` +
            `Quand vous êtes prêt, appuyez sur Commencer l’entrevue pour voir la première question.`
        );
    }
    return (
        `Hi, I'm Alex Chen, and I'm conducting hiring conversations for ${co}. ` +
        `I'll run your ${it} interview for the ${r} role. ` +
        `We'll work through about ${n} questions. Take your time — use the record button when you're ready to answer each one. ` +
        `When you're set, tap Begin interview to open the first question.`
    );
}

const WAVEFORM_BAR_COUNT = 12;
const WAVEFORM_BAR_CLASS = 'rounded-sm transition-all duration-100 flex-shrink-0';

/** Shared bar strip: same look for user and avatar. heights = array of 0..1, barCount elements. */
function WaveformBars({ heights, isDark, label }) {
    return (
        <div className="flex min-h-0 min-w-0 flex-col justify-end">
            {label && (
                <p className="text-[10px] font-medium text-gray-500 mb-0.5 truncate">{label}</p>
            )}
            <div className="flex h-10 w-full flex-shrink-0 items-end justify-center gap-0.5 sm:h-11">
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

/**
 * Parse question text into segments.
 * Code fences (```lang\\n...\\n```) become { type: 'code', language, code } and any remaining
 * markdown backticks in text segments are stripped so technical questions render cleanly.
 */
function parseQuestionWithCodeBlocks(text) {
    if (!text || typeof text !== 'string') return [{ type: 'text', content: text || '' }];

    const normalized = text.replace(/\r\n/g, '\n');
    const segments = [];

    // ```python\n...``` or ```\n...``` (language is optional, newline is optional)
    const fenceRe = /```\\s*([a-zA-Z0-9_-]+)?\\s*\\n?([\\s\\S]*?)```/g;

    let lastIndex = 0;
    let match;
    while ((match = fenceRe.exec(normalized)) !== null) {
        const before = normalized.slice(lastIndex, match.index);
        if (before && before.trim()) {
            let cleaned = stripHtmlFromText(before);
            // Remove leftover fence markers/backticks if the model produced slightly malformed markdown.
            cleaned = cleaned
                .replace(/```[a-zA-Z0-9_-]*\\n?/g, '')
                .replace(/```/g, '')
                .replace(/`{1,3}/g, '');
            // Remove inline code backticks but keep content.
            cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
            // Drop heading markers to reduce noise in question text.
            cleaned = cleaned.replace(/^#{1,6}\\s+/gm, '');
            segments.push({ type: 'text', content: cleaned || before });
        }

        const lang = match[1] ? String(match[1]).trim().toLowerCase() : undefined;
        let code = match[2] ?? '';
        code = stripHtmlFromText(code);
        // Avoid a leading newline right after the fence language token.
        code = code.replace(/^\\n/, '').replace(/\\n$/, '');

        if (code && code.trim()) {
            segments.push({ type: 'code', language: lang, code: code.trimEnd() });
        }

        lastIndex = fenceRe.lastIndex;
    }

    const after = normalized.slice(lastIndex);
    if (after && after.trim()) {
        let cleaned = stripHtmlFromText(after);
        cleaned = cleaned
            .replace(/```[a-zA-Z0-9_-]*\\n?/g, '')
            .replace(/```/g, '')
            .replace(/`{1,3}/g, '')
            .replace(/`([^`]+)`/g, '$1');
        cleaned = cleaned.replace(/^#{1,6}\\s+/gm, '');
        segments.push({ type: 'text', content: cleaned || after });
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

function answeredLabelToScore(label) {
    if (!label) return 0.3;
    if (label === 'fully_answered') return 1;
    if (label === 'partially_answered') return 0.65;
    if (label === 'not_answered') return 0.25;
    return 0.3;
}

function relevanceLabelToScore(label) {
    if (!label) return 0.3;
    if (label === 'high') return 1;
    if (label === 'medium') return 0.65;
    if (label === 'low') return 0.25;
    return 0.3;
}

function formalityLabelToScore(label) {
    if (!label) return 0.7;
    if (label === 'formal') return 1;
    if (label === 'informal') return 0.7;
    return 0.75;
}

function toneLabelToScore(tone) {
    const raw = (tone || '').toString().toLowerCase();
    if (!raw) return 0.7;
    const positive = ['joy', 'love', 'excited', 'excitation', 'admiration', 'approval', 'gratitude', 'optimism', 'curiosity', 'caring', 'relief', 'amusement'];
    const negative = ['anger', 'disgust', 'fear', 'sadness', 'nervousness', 'confusion', 'remorse', 'grief', 'disapproval', 'embarrassment', 'disappointment', 'annoyance', 'sad', 'worried', 'anxious'];
    if (positive.some((k) => raw.includes(k))) return 0.95;
    if (negative.some((k) => raw.includes(k))) return 0.45;
    return 0.7;
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

export default function InterviewSimulatorPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t, language } = useLanguage();
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
    const responsesRef = useRef(responses);
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
    /** After Start simulation: intro screen before question 1 */
    const [showPreInterviewIntro, setShowPreInterviewIntro] = useState(false);
    /** Summary: report vs emotions vs feedback tab */
    const [summaryResultsTab, setSummaryResultsTab] = useState('report');
    /** Summary: selected question for the sub-tab panel */
    const [summarySelectedQuestionIndex, setSummarySelectedQuestionIndex] = useState(0);
    /** Delay after eval+feedback ready before showing results (progress bar finishes) */
    const [summaryRevealReady, setSummaryRevealReady] = useState(false);
    /** LiveAvatar UI / initial gate; can be cleared by onError while session still works for manual Listen */
    const [liveAvatarSessionReady, setLiveAvatarSessionReady] = useState(() => !USE_LIVE_AVATAR_SDK);
    /**
     * Once LiveAvatar stream is up, stay true until sim ends. Auto-speak uses this ref so a stale
     * `liveAvatarSessionReady === false` (e.g. onError edge cases) does not block Q2–Q5; manual Listen ignores that state.
     */
    const liveAvatarHudReadyRef = useRef(false);
    const liveAvatarRef = useRef(null);
    const introScriptSpokenRef = useRef(false);
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

    useEffect(() => {
        responsesRef.current = responses;
    }, [responses]);

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
            // The question container uses `key` and can remount the <video> element.
            // Re-attach the existing stream on every question change to prevent a "blank" camera.
            video.srcObject = stream;
            // Ensure playback starts (some browsers need an explicit play() after srcObject changes).
            try {
                const p = video.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch (_) {
                /* noop */
            }
        }

        return () => {
            if (video && video.srcObject) video.srcObject = null;
        };
    }, [videoStream, currentQuestionIndex, showPreInterviewIntro]);

    const closeModal = () => {
        // Stop any currently playing avatar/browser speech.
        try {
            if (USE_LIVE_AVATAR_SDK && liveAvatarRef.current) {
                liveAvatarRef.current.interrupt?.();
            }
        } catch (_) {
            /* noop */
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (emotionLogIntervalRef.current) clearInterval(emotionLogIntervalRef.current);
        emotionLogIntervalRef.current = null;
        const sr = speechRecognitionRef.current;
        if (sr) try { sr.abort(); } catch (_) {}
        speechRecognitionRef.current = null;
        stopVideoPreview();
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
        liveAvatarHudReadyRef.current = false;
        setLiveAvatarSessionReady(!USE_LIVE_AVATAR_SDK);
        setShowPreInterviewIntro(false);
        setSummaryResultsTab('report');
        setSummarySelectedQuestionIndex(0);
        setSummaryRevealReady(false);
    };

    const handleStartSimulation = () => {
        // Stop any currently playing avatar/browser speech from the previous run.
        try {
            if (USE_LIVE_AVATAR_SDK && liveAvatarRef.current) {
                liveAvatarRef.current.interrupt?.();
            }
        } catch (_) {
            /* noop */
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsAvatarSpeaking(false);
        liveAvatarHudReadyRef.current = false;
        if (USE_LIVE_AVATAR_SDK) setLiveAvatarSessionReady(false);
        introScriptSpokenRef.current = false;
        setSummarySelectedQuestionIndex(0);
        setSimulationActive(true);
        setShowPreInterviewIntro(true);
        setCurrentQuestionIndex(0);
        setResponses(generatedQuestions.map(() => ''));
        setResponseEmotions(generatedQuestions.map(() => null));
        setTranscriptSegments(generatedQuestions.map(() => []));
        setEmotionLogs(generatedQuestions.map(() => []));
        startVideoPreview();

        // In embed/VRM modes (no LiveAvatar SDK control), autoplay TTS can be blocked.
        // Trigger the pre-intro speaking immediately from this user click so audio starts.
        if (!USE_LIVE_AVATAR_SDK && typeof window !== 'undefined' && window.speechSynthesis) {
            try {
                const script = getInterviewerIntroScript({
                    companyName,
                    role,
                    interviewType,
                    numQuestions: generatedQuestions.length,
                    language,
                });
                window.speechSynthesis.cancel();
                setIsAvatarSpeaking(true);
                const u = new SpeechSynthesisUtterance(script);
                u.rate = 0.95;
                u.lang = language === 'fr' ? 'fr-FR' : 'en-GB';
                u.onend = () => setIsAvatarSpeaking(false);
                u.onerror = () => setIsAvatarSpeaking(false);
                const voices = window.speechSynthesis.getVoices();
                const voice = voices.find((v) => v.name === 'Google UK English Male')
                    || voices.find((v) => v.lang.startsWith('en-GB'))
                    || voices.find((v) => v.lang.startsWith('en'));
                if (voice) u.voice = voice;
                introScriptSpokenRef.current = true;
                window.speechSynthesis.speak(u);
            } catch (_) {
                // ignore
            }
        }
    };

    const dismissPreInterviewIntro = () => {
        if (USE_LIVE_AVATAR_SDK && liveAvatarRef.current) {
            try {
                liveAvatarRef.current.interrupt?.();
            } catch (_) {
                /* noop */
            }
        }
        // Force "ready" to be re-established for the Q1 avatar instance.
        // The pre-intro avatar unmounts and a new avatar instance mounts for the first question.
        liveAvatarHudReadyRef.current = false;
        if (USE_LIVE_AVATAR_SDK) setLiveAvatarSessionReady(false);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsAvatarSpeaking(false);
        setShowPreInterviewIntro(false);
    };

    const speakQuestion = () => {
        const question = generatedQuestions[currentQuestionIndex];
        if (!question || typeof window === 'undefined') return;
        if (USE_LIVE_AVATAR_SDK && liveAvatarRef.current) {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            const plain = stripHtmlFromText(question);
            const runFallbackTts = () => {
                if (!window.speechSynthesis) return;
                window.speechSynthesis.cancel();
                setIsAvatarSpeaking(true);
                const u = new SpeechSynthesisUtterance(plain);
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
            try {
                try {
                    liveAvatarRef.current.interrupt();
                } catch (_) {
                    /* noop */
                }
                window.setTimeout(() => {
                    try {
                        liveAvatarRef.current?.speak(plain);
                    } catch (err) {
                        console.warn('[Interview] LiveAvatar speak', err);
                        runFallbackTts();
                    }
                }, 220);
            } catch (_) {
                runFallbackTts();
            }
            return;
        }
        if (!window.speechSynthesis) return;
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

    const speakQuestionRef = useRef(speakQuestion);
    speakQuestionRef.current = speakQuestion;

    /** Re-run auto-speak when tailored question text updates at the same index */
    const interviewQuestionTextForSpeech =
        simulationActive &&
        !showPreInterviewIntro &&
        generatedQuestions.length > 0 &&
        currentQuestionIndex < generatedQuestions.length
            ? (generatedQuestions[currentQuestionIndex] ?? '')
            : '';

    useEffect(() => {
        if (!simulationActive || !generatedQuestions?.length) return;
        // Pre-interview screen: only the intro script should play, not Q1.
        if (showPreInterviewIntro) return;
        if (currentQuestionIndex >= generatedQuestions.length) return;
        const question = generatedQuestions[currentQuestionIndex];
        if (!question) return;
        const delayMs = USE_LIVE_AVATAR_SDK ? 550 : 400;
        let cancelled = false;
        let retryTimer = null;

        const speakLoop = () => {
            if (cancelled) return;
            if (USE_LIVE_AVATAR_SDK && !liveAvatarHudReadyRef.current) {
                retryTimer = window.setTimeout(speakLoop, 350);
                return;
            }
            speakQuestionRef.current?.();
        };

        const t = window.setTimeout(() => {
            speakLoop();
        }, delayMs);

        return () => {
            cancelled = true;
            window.clearTimeout(t);
            if (retryTimer) window.clearTimeout(retryTimer);
        };
    }, [
        simulationActive,
        showPreInterviewIntro,
        currentQuestionIndex,
        liveAvatarSessionReady,
        generatedQuestions.length,
        interviewQuestionTextForSpeech,
    ]);

    const stopSpeech = () => {
        if (USE_LIVE_AVATAR_SDK && liveAvatarRef.current) {
            try {
                liveAvatarRef.current.interrupt();
            } catch (_) {
                /* noop */
            }
        }
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
                            previousAnswer: (responsesRef.current[currentQuestionIndex] ?? '').trim(),
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
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            stopVideoPreview();
            setCurrentQuestionIndex(generatedQuestions.length);
        }
    };

    const handleNext = async () => {
        if (pendingFollowUpQuestion) return;
        if (currentQuestionIndex >= generatedQuestions.length) return;
        const answer = (responsesRef.current[currentQuestionIndex] ?? '').trim();
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

    const inSummaryView = showQuestionsModal && simulationActive && generatedQuestions.length > 0 && currentQuestionIndex >= generatedQuestions.length;
    /** Release camera on the summary screen (not needed for report UI; face hook stops analyzing). */
    useEffect(() => {
        if (inSummaryView) stopVideoPreview();
    }, [inSummaryView]);
    const inQuestionPhase = simulationActive && !showPreInterviewIntro && currentQuestionIndex < generatedQuestions.length;
    const isFeedbackLoading = loadingFeedbackIndex !== null;
    const evaluationReady = !!responseAnalyses && !analyzingResponses;
    const feedbackReady = !!feedbacks && !isFeedbackLoading;
    const summaryDataReady = evaluationReady && feedbackReady;
    const summaryProgress = !inSummaryView ? 0 : (((evaluationReady ? 1 : 0) + (feedbackReady ? 1 : 0)) / 2) * 100;
    const showSummaryLoadingPanel = inSummaryView && !summaryRevealReady;

    // Interview report overview (radar chart + improvement breakdown).
    const reportAnalyses = Array.isArray(responseAnalyses) ? responseAnalyses : [];
    const reportCount = reportAnalyses.length || 1;
    const reportAvgCertainty =
        reportAnalyses.reduce((s, a) => s + (typeof a?.certainty?.score === 'number' ? a.certainty?.score : 0.5), 0) / reportCount;
    const reportAvgRelevance =
        reportAnalyses.reduce((s, a) => s + relevanceLabelToScore(a?.relevance?.label), 0) / reportCount;
    const reportAvgAnswered =
        reportAnalyses.reduce((s, a) => s + answeredLabelToScore(a?.answered?.label), 0) / reportCount;
    const reportAvgFormality =
        reportAnalyses.reduce((s, a) => s + formalityLabelToScore(a?.formality?.label), 0) / reportCount;
    const reportAvgTone =
        reportAnalyses.reduce((s, a) => s + toneLabelToScore(a?.tone?.tone), 0) / reportCount;

    const reportAxes = [
        { key: 'certainty', label: 'Confidence', value: Math.round(reportAvgCertainty * 100) },
        { key: 'relevance', label: 'Relevance', value: Math.round(reportAvgRelevance * 100) },
        { key: 'answered', label: 'Coverage', value: Math.round(reportAvgAnswered * 100) },
        { key: 'formality', label: 'Professionalism', value: Math.round(reportAvgFormality * 100) },
        { key: 'tone', label: 'Tone', value: Math.round(reportAvgTone * 100) },
    ];

    const reportRadarData = reportAxes.map((a) => ({ subject: a.label, score: a.value }));
    const reportWeakAreas = [...reportAxes].sort((a, b) => a.value - b.value).slice(0, 3);

    const reportImprovementCopy = (axisKey) => {
        switch (axisKey) {
            case 'certainty':
                return { title: 'Increase confidence', hint: 'Use assertive wording and concrete outcomes (e.g., “I led…”, “I delivered…”).' };
            case 'relevance':
                return { title: 'Answer more directly', hint: 'Address the core requirement first, then add context and supporting examples.' };
            case 'answered':
                return { title: 'Improve coverage', hint: 'Use a simple structure (STAR or 3-step flow) to ensure every part of the question is answered.' };
            case 'formality':
                return { title: 'Sound more professional', hint: 'Keep sentences concise, avoid filler, and maintain a consistent professional tone.' };
            case 'tone':
                return { title: 'Refine your tone', hint: 'Emphasize positivity and engagement by highlighting achievements and what you learned.' };
            default:
                return { title: 'Improve', hint: 'Focus on clarity, structure, and confident delivery.' };
        }
    };

    const reportImprovementItems = reportWeakAreas.map((a) => ({ ...a, ...(reportImprovementCopy(a.key)) }));

    const feedbackImprovementAgg = useMemo(
        () => aggregateImprovementsFromFeedback(Array.isArray(feedbacks) ? feedbacks : []),
        [feedbacks]
    );
    const reportImprovementDisplayItems =
        feedbackImprovementAgg.length > 0 ? feedbackImprovementAgg : reportImprovementItems;

    useEffect(() => {
        if (!inSummaryView || !summaryDataReady) {
            setSummaryRevealReady(false);
            return;
        }
        const t = window.setTimeout(() => setSummaryRevealReady(true), 700);
        return () => window.clearTimeout(t);
    }, [inSummaryView, summaryDataReady]);

    useEffect(() => {
        if (!inSummaryView) setSummaryResultsTab('report');
    }, [inSummaryView]);

    useEffect(() => {
        if (inSummaryView) setSummarySelectedQuestionIndex(0);
    }, [inSummaryView]);

    useEffect(() => {
        if (!showPreInterviewIntro || !simulationActive) return;
        // Only auto-speak via LiveAvatar SDK. In embed/VRM modes we trigger speaking from
        // the user's "Start simulation" click (see handleStartSimulation) to avoid autoplay blocks.
        if (!USE_LIVE_AVATAR_SDK) return;

        // Ensure no old audio is still playing while we show the intro.
        try {
            liveAvatarRef.current?.interrupt?.();
        } catch (_) {
            /* noop */
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const script = getInterviewerIntroScript({
            companyName,
            role,
            interviewType,
            numQuestions: generatedQuestions.length,
            language,
        });
        const delay = USE_LIVE_AVATAR_SDK ? 1200 : 450;
        let cancelled = false;
        let retryTimer = null;

        const speakLoop = () => {
            if (cancelled || introScriptSpokenRef.current) return;
            if (typeof window === 'undefined') return;

            const canSpeak = !!liveAvatarRef.current && liveAvatarHudReadyRef.current;
            if (!canSpeak) {
                // LiveAvatar sessions can take a while (especially if previous sessions are still winding down).
                // Keep waiting until the avatar is truly ready, then speak.
                retryTimer = window.setTimeout(speakLoop, 450);
                return;
            }

            introScriptSpokenRef.current = true;
            try {
                liveAvatarRef.current.interrupt?.();
            } catch (_) {
                /* noop */
            }
            window.setTimeout(() => {
                if (cancelled) return;
                try {
                    liveAvatarRef.current?.speak?.(script);
                } catch (_) {
                    // If speak fails for any reason, allow another loop attempt.
                    introScriptSpokenRef.current = false;
                    retryTimer = window.setTimeout(speakLoop, 450);
                }
            }, 280);
        };

        const timer = window.setTimeout(() => {
            speakLoop();
        }, delay);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            if (retryTimer) window.clearTimeout(retryTimer);
        };
    }, [showPreInterviewIntro, simulationActive, companyName, role, interviewType, generatedQuestions.length, language, liveAvatarSessionReady]);

    // When the question changes, the avatar subtree can remount (due to `key` on the question wrapper).
    // Reset readiness so the auto-speak logic waits for the new avatar instance's `onReady`.
    useEffect(() => {
        if (!USE_LIVE_AVATAR_SDK) return;
        if (!simulationActive) return;
        if (showPreInterviewIntro) return;
        liveAvatarHudReadyRef.current = false;
        setLiveAvatarSessionReady(false);
    }, [USE_LIVE_AVATAR_SDK, simulationActive, showPreInterviewIntro, currentQuestionIndex]);

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

    /** After stop, wait for final speech-recognition updates then same flow as former “Next”. */
    const stopRecordingAndAdvance = (faceSnapshot) => {
        setIsTranscribing(true);
        stopRecording(faceSnapshot);
        window.setTimeout(async () => {
            try {
                await handleNext();
            } finally {
                setIsTranscribing(false);
            }
        }, 450);
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
                    <div className={(`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[min(90vh,calc(100dvh-1rem))] flex min-h-0 flex-col overflow-hidden border ${isDark ? 'border-gray-700/80' : 'border-gray-200'} shadow-2xl ${isDark ? 'shadow-black/50' : 'shadow-xl shadow-gray-400/20'} relative animate-interview-modal-in`)} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeModal}
                            className={(`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 z-20 ${isDark
                                ? 'bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 shadow-lg'
                                : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-md'
                            } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className={`flex-1 flex flex-col min-w-0 min-h-0 max-h-full ${inQuestionPhase ? 'overflow-hidden h-full' : 'overflow-y-auto'}`}>
                        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${inQuestionPhase ? 'overflow-hidden h-full min-h-0 p-2 sm:p-3 pb-1.5' : 'overflow-visible p-4 sm:p-6'}`}>
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
                            ) : simulationActive && showPreInterviewIntro ? (
                                <div key="pre-intro" className="flex h-full min-h-0 flex-1 flex-col overflow-hidden animate-interview-view-in">
                                    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-1 flex-col px-2 py-4 sm:py-6">
                                        <div className={`flex min-h-0 flex-1 flex-col rounded-2xl border p-4 sm:p-6 shadow-lg ${isDark ? 'bg-gray-800/60 border-gray-600/80' : 'bg-gray-50 border-gray-200'}`}>
                                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {t.interviewIntroTitle}
                                            </p>
                                            <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Alex Chen
                                            </h2>

                                            {/* LiveAvatar: Alex Chen introduces himself */}
                                            <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-md ${isDark ? 'border-gray-600/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                                <div className={`flex-shrink-0 px-3 py-2 border-b ${isDark ? 'border-gray-600/80 bg-gray-800/50' : 'border-gray-200 bg-gray-100/80'}`}>
                                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alex Chen</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{role || 'Senior Software Engineer'}</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{companyName || '—'}</p>
                                                </div>
                                                <div className="relative flex flex-1 min-h-[min(36vh,380px)] min-w-0 flex-col overflow-hidden">
                                                    {USE_LIVE_AVATAR_EMBED ? (
                                                        <InterviewLiveAvatarEmbed
                                                            key="liveavatar-embed-preintro"
                                                            embedId={LIVE_AVATAR_EMBED_ID}
                                                            embedUrl={LIVE_AVATAR_EMBED_URL}
                                                            className="min-h-0 flex-1"
                                                            compact
                                                        />
                                                    ) : USE_LIVE_AVATAR_SDK ? (
                                                        <InterviewLiveAvatar
                                                            key="liveavatar-sdk-session-preintro"
                                                            ref={liveAvatarRef}
                                                            className="min-h-0 flex-1"
                                                            onSpeakingChange={setIsAvatarSpeaking}
                                                            onReady={() => {
                                                                liveAvatarHudReadyRef.current = true;
                                                                setLiveAvatarSessionReady(true);
                                                            }}
                                                            onError={() => {
                                                                liveAvatarHudReadyRef.current = false;
                                                                setLiveAvatarSessionReady(false);
                                                            }}
                                                        />
                                                    ) : (
                                                        <InterviewAvatarVrm className="min-h-[min(32vh,300px)] flex-1 min-w-0 max-w-full overflow-hidden rounded-b-xl" isSpeaking={isAvatarSpeaking} />
                                                    )}
                                                </div>
                                            </div>

                                            <p className={`mt-3 flex-shrink-0 text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                                {t.interviewIntroHint}
                                            </p>
                                            <div className="mt-12 flex w-full flex-shrink-0 flex-col sm:mt-auto sm:pt-5">
                                                <button
                                                    type="button"
                                                    onClick={dismissPreInterviewIntro}
                                                    className="w-full rounded-xl px-8 py-3.5 font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 sm:w-auto"
                                                >
                                                    {t.interviewBeginInterview}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : currentQuestionIndex < generatedQuestions.length ? (
                                <div
                                    key={`q-${currentQuestionIndex}`}
                                    className="flex flex-col flex-1 min-h-0 h-full gap-2 overflow-hidden animate-interview-slide-next"
                                >
                                    <div className="flex flex-col gap-2 min-h-0 min-w-0 overflow-hidden flex-shrink-0">
                                        <div className={`flex-shrink-0 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700/80' : 'bg-gray-50/80 border border-gray-200'} shadow-sm overflow-hidden`}>
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/15 text-emerald-700'}`}>
                                                {t.interviewQuestionOf} {currentQuestionIndex + 1} {t.interviewOf} {generatedQuestions.length}
                                            </div>
                                            <div className={`text-base sm:text-lg font-bold leading-snug break-words space-y-2 max-h-[min(14rem,22vh)] sm:max-h-[min(16rem,24vh)] overflow-y-auto pr-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                                                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Answer briefly if you like, then tap <span className="font-semibold">Continue</span> in the You header.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border min-h-[min(66vh,600px)] sm:min-h-[min(86h,720px)] ${isDark ? 'border-gray-700/70 bg-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]' : 'border-gray-300/90 bg-gray-950/[0.04] shadow-inner'}`}>
                                        {/* Two columns: header (persona + controls) → video (flex-1) → waveform */}
                                        <div className="flex min-h-0 min-w-0 flex-1 gap-1.5 overflow-hidden p-0.5 sm:gap-2 sm:p-1">
                                            {/* User — header with controls, video (flex-1), mic waveform */}
                                            <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-lg ${isDark ? 'border-gray-600/60 bg-gray-900/80' : 'border-gray-200 bg-white/95'}`}>
                                                <div className={`flex flex-shrink-0 flex-col border-b px-3 py-1.5 ${isDark ? 'border-gray-600/80 bg-gray-900/95' : 'border-gray-200 bg-gray-100/95'}`}>
                                                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You</p>
                                                    {/* One control row below label; min-height ~ interviewer name + 2 detail lines */}
                                                    <div className="mt-0.5 flex min-h-[3.25rem] flex-wrap content-center items-center gap-1.5 sm:min-h-[3.05rem]">
                                                        {!videoStream ? (
                                                            <button
                                                                type="button"
                                                                onClick={startVideoPreview}
                                                                aria-label="Start camera"
                                                                title="Start camera"
                                                                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-all ${isDark
                                                                    ? 'border border-gray-500 bg-gray-600 text-gray-50 ring-1 ring-white/15 hover:bg-gray-500'
                                                                    : 'border border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                                }`}
                                                            >
                                                                <Video className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                                                <span>Camera</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={stopVideoPreview}
                                                                aria-label="Stop camera"
                                                                title="Stop camera"
                                                                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-all ${isDark
                                                                    ? 'border border-red-500/50 bg-red-500/25 text-red-300 ring-1 ring-red-400/20 hover:bg-red-500/35'
                                                                    : 'border border-red-200 bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                <Video className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                                                                <span>Stop</span>
                                                            </button>
                                                        )}
                                                        {pendingFollowUpQuestion ? (
                                                            <button
                                                                type="button"
                                                                onClick={dismissFollowUpAndAdvance}
                                                                disabled={isTailoringNextQuestion || isLoadingFollowUp}
                                                                className={`inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-all ${isTailoringNextQuestion || isLoadingFollowUp
                                                                    ? isDark ? 'cursor-not-allowed border border-gray-600 bg-gray-700 text-gray-500' : 'cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-400'
                                                                    : isDark
                                                                        ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                                                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                }`}
                                                            >
                                                                {isTailoringNextQuestion ? (
                                                                    <>
                                                                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                                                                        <span>Prep…</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                                                        <span>Continue</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : null}
                                                        {!pendingFollowUpQuestion && isRecording ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => stopRecordingAndAdvance({ dominant: faceDominant, expressions: faceExpressions ? { ...faceExpressions } : {} })}
                                                                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-all ${isDark
                                                                    ? 'border border-red-500/50 bg-red-500/25 text-red-300 hover:bg-red-500/35'
                                                                    : 'border border-red-200 bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />
                                                                <span>Stop</span>
                                                            </button>
                                                        ) : !pendingFollowUpQuestion ? (
                                                            <button
                                                                type="button"
                                                                onClick={startRecording}
                                                                disabled={isTranscribing || isTailoringNextQuestion || isLoadingFollowUp}
                                                                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-all ${isTranscribing || isTailoringNextQuestion || isLoadingFollowUp
                                                                    ? isDark ? 'cursor-not-allowed border border-gray-600 bg-gray-700 text-gray-500' : 'cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-400'
                                                                    : isDark
                                                                        ? 'border border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                                        : 'border border-red-200 bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                {isTranscribing ? (
                                                                    <>
                                                                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                                                                        <span>Next…</span>
                                                                    </>
                                                                ) : isTailoringNextQuestion ? (
                                                                    <>
                                                                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                                                                        <span>Prep…</span>
                                                                    </>
                                                                ) : isLoadingFollowUp ? (
                                                                    <>
                                                                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                                                                        <span>…</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Mic className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                                                        <span>Record</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-black/25">
                                                    {!videoStream ? (
                                                        <div className={`flex min-h-0 flex-1 w-full items-stretch overflow-hidden p-1 sm:p-1.5 ${isDark ? 'bg-gray-900/40' : 'bg-gray-50/80'}`}>
                                                            <div className={`relative flex min-h-0 flex-1 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border ${isDark ? 'border-gray-700/60 bg-gray-800/50 text-gray-500' : 'border-gray-200 bg-gray-100/80 text-gray-500'}`}>
                                                                <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/80'}`}>
                                                                    <Video className="w-8 h-8 opacity-60" />
                                                                </div>
                                                                <span className="px-2 text-center text-xs">Your video will appear here.</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden p-1 sm:p-1.5">
                                                            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg bg-black">
                                                                <video
                                                                    ref={videoPreviewRef}
                                                                    autoPlay
                                                                    muted
                                                                    playsInline
                                                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`flex flex-shrink-0 flex-col justify-end border-t px-2 py-0.5 ${isDark ? 'border-gray-700/70 bg-gray-950/65' : 'border-gray-200 bg-gray-100'}`}>
                                                    {recordingStream ? (
                                                        <UserWaveform stream={recordingStream} isDark={isDark} />
                                                    ) : (
                                                        <WaveformBars heights={Array(WAVEFORM_BAR_COUNT).fill(0.15)} isDark={isDark} />
                                                    )}
                                                </div>
                                                {videoError && !videoStream && (
                                                    <p className="px-3 py-1 text-sm text-red-400">{videoError}</p>
                                                )}
                                            </div>
                                            {/* Interviewer — persona header (like You), then video, then waveform */}
                                            <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-lg ${isDark ? 'border-gray-600/60 bg-gray-900/80' : 'border-gray-200 bg-white/95'}`}>
                                                <div className={`flex-shrink-0 border-b px-3 py-1.5 ${isDark ? 'border-gray-600/80 bg-gray-900/95' : 'border-gray-200 bg-gray-100/95'}`}>
                                                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Interviewer</p>
                                                    <p className={`mt-0.5 text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Alex Chen</p>
                                                    <p className={`text-[11px] leading-snug ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{role || 'Senior Software Engineer'}</p>
                                                    <p className={`text-[11px] leading-snug ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{companyName || '—'}</p>
                                                </div>
                                                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-black/25">
                                                    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden p-1 sm:p-1.5">
                                                        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg bg-black">
                                                            {USE_LIVE_AVATAR_EMBED ? (
                                                                <InterviewLiveAvatarEmbed
                                                                    key="liveavatar-embed"
                                                                    embedId={LIVE_AVATAR_EMBED_ID}
                                                                    embedUrl={LIVE_AVATAR_EMBED_URL}
                                                                    className="h-full min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden"
                                                                />
                                                            ) : USE_LIVE_AVATAR_SDK ? (
                                                                <InterviewLiveAvatar
                                                                    key="liveavatar-sdk-session"
                                                                    ref={liveAvatarRef}
                                                                    className="h-full min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden"
                                                                    onSpeakingChange={setIsAvatarSpeaking}
                                                                    onReady={() => {
                                                                        liveAvatarHudReadyRef.current = true;
                                                                        setLiveAvatarSessionReady(true);
                                                                    }}
                                                                    onError={() => {
                                                                        liveAvatarHudReadyRef.current = false;
                                                                        setLiveAvatarSessionReady(false);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <InterviewAvatarVrm className="min-h-0 min-w-0 h-full w-full flex-1 overflow-hidden" isSpeaking={isAvatarSpeaking} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`flex flex-shrink-0 flex-col justify-end border-t px-2 py-0.5 ${isDark ? 'border-gray-700/70 bg-gray-950/65' : 'border-gray-200 bg-gray-100'}`}>
                                                    <AvatarWaveform isActive={isAvatarSpeaking} isDark={isDark} />
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                        {/* Transcript is captured in the background but not shown until the end summary */}
                                    </div>
                                </div>
                            ) : (
                                <div key="summary" className="flex-1 flex flex-col min-h-0 animate-interview-view-in">
                                    <div className="flex-1 flex flex-col min-h-0">
                                        {showSummaryLoadingPanel ? (
                                            <div className="flex flex-col items-center justify-center flex-1 min-h-[42vh] py-10 px-4">
                                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" aria-hidden />
                                                <p className={`text-sm font-medium text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {summaryDataReady ? t.interviewSummaryAlmost : t.interviewSummaryPreparing}
                                                </p>
                                                {analyzingResponses && !summaryDataReady && (
                                                    <p className={`mt-2 text-xs text-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                        {t.interviewAnalyzing}
                                                    </p>
                                                )}
                                                <div className="w-full max-w-md mt-8 px-2">
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
                                                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/80' : 'bg-gray-200'}`}>
                                                        <div
                                                            className={`${isDark ? 'bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400' : 'bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500'} h-full transition-all duration-500 ease-out`}
                                                            style={{ width: `${Math.max(10, Math.min(100, summaryProgress))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                        <div className="flex-shrink-0">
                                            <div className="text-center mb-4">
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
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 px-2 sm:px-4 mb-3 max-w-3xl mx-auto w-full">
                                            <p className={`text-xs text-center mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                                {summaryResultsTab === 'report'
                                                    ? t.interviewSummaryTabReportDesc
                                                    : summaryResultsTab === 'emotions'
                                                        ? t.interviewSummaryTabEmotionsDesc
                                                        : t.interviewSummaryTabFeedbackDesc}
                                            </p>
                                            <div
                                                role="tablist"
                                                className={`grid grid-cols-1 sm:grid-cols-3 rounded-xl p-1 gap-1 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}
                                            >
                                                <button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={summaryResultsTab === 'report'}
                                                    onClick={() => setSummaryResultsTab('report')}
                                                    className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                                        summaryResultsTab === 'report'
                                                            ? isDark
                                                                ? 'bg-violet-500/25 text-violet-200 shadow-sm'
                                                                : 'bg-white text-violet-900 shadow-sm'
                                                            : isDark
                                                                ? 'text-gray-400 hover:text-gray-200'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden />
                                                    <span className="truncate">{t.interviewSummaryTabReport}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={summaryResultsTab === 'emotions'}
                                                    onClick={() => setSummaryResultsTab('emotions')}
                                                    className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                                        summaryResultsTab === 'emotions'
                                                            ? isDark
                                                                ? 'bg-emerald-500/25 text-emerald-300 shadow-sm'
                                                                : 'bg-white text-emerald-800 shadow-sm'
                                                            : isDark
                                                                ? 'text-gray-400 hover:text-gray-200'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
                                                    <span className="truncate">{t.interviewSummaryTabEmotions}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={summaryResultsTab === 'feedback'}
                                                    onClick={() => setSummaryResultsTab('feedback')}
                                                    className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                                        summaryResultsTab === 'feedback'
                                                            ? isDark
                                                                ? 'bg-sky-500/25 text-sky-300 shadow-sm'
                                                                : 'bg-white text-sky-800 shadow-sm'
                                                            : isDark
                                                                ? 'text-gray-400 hover:text-gray-200'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <MessageSquare className="w-4 h-4 shrink-0" aria-hidden />
                                                    <span className="truncate">{t.interviewSummaryTabFeedback}</span>
                                                </button>
                                            </div>

                                            {/* Sub-tabs: pick a specific question to inspect */}
                                            {summaryResultsTab !== 'report' && (
                                            <div className="mt-3">
                                                <div
                                                    role="tablist"
                                                    aria-label="Summary question selector"
                                                    className="overflow-x-auto pb-1"
                                                >
                                                    <div className="flex gap-2 min-w-max">
                                                        {generatedQuestions.map((_, idx) => {
                                                            const isActive = idx === summarySelectedQuestionIndex;
                                                            const activeCls =
                                                                summaryResultsTab === 'emotions'
                                                                    ? isDark
                                                                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40'
                                                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                                    : isDark
                                                                        ? 'bg-sky-500/25 text-sky-200 border border-sky-500/40'
                                                                        : 'bg-sky-50 text-sky-800 border border-sky-200';
                                                            const inactiveCls = isDark
                                                                ? 'bg-gray-800/50 text-gray-300 border border-gray-700/60 hover:bg-gray-700/50'
                                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    role="tab"
                                                                    aria-selected={isActive}
                                                                    onClick={() => setSummarySelectedQuestionIndex(idx)}
                                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors duration-150 ${
                                                                        isActive ? activeCls : inactiveCls
                                                                    }`}
                                                                >
                                                                    Q{idx + 1}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
                                        {summaryResultsTab === 'report' ? (
                                            <div className={`rounded-xl border p-3 sm:p-4 ${isDark ? 'bg-gray-800/40 border-gray-700/80' : 'bg-white/60 border-gray-200'}`}>
                                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                                                    <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.interviewSummaryTabReport}</h3>
                                                    {evaluationOverall?.overallBand != null && (
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                                                            {t[`interviewBand_${evaluationOverall.overallBand}`] ?? evaluationOverall.overallBand}
                                                            {evaluationOverall?.overallScore != null ? ` · ${Math.round(evaluationOverall.overallScore * 100)}%` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid lg:grid-cols-12 gap-3 items-start">
                                                    <div className={`lg:col-span-5 rounded-lg border p-2 ${isDark ? 'border-gray-700/60 bg-gray-900/20' : 'border-gray-200 bg-gray-50/80'}`}>
                                                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Radar</p>
                                                        <div className="h-[min(200px,32vh)] w-full">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadarChart data={reportRadarData} outerRadius="72%">
                                                                    <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#cbd5e1' : '#4b5563', fontSize: 10 }} />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            background: isDark ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.98)',
                                                                            border: isDark ? '1px solid rgba(75,85,99,0.7)' : '1px solid rgba(209,213,219,0.9)'
                                                                        }}
                                                                        formatter={(value) => `${Math.round(Number(value))}/100`}
                                                                    />
                                                                    <Radar dataKey="score" name="score" stroke={isDark ? '#34d399' : '#059669'} fill={isDark ? 'rgba(52,211,153,0.18)' : 'rgba(5,150,105,0.14)'} />
                                                                </RadarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-7 min-w-0">
                                                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Areas of improvement</p>
                                                        {feedbackImprovementAgg.length > 0 ? (
                                                            <p className={`text-[11px] leading-snug mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                Themes aggregated from your personalized feedback (per-question detail on the Personalized feedback tab).
                                                            </p>
                                                        ) : (
                                                            <p className={`text-[11px] leading-snug mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                Based on your lowest radar dimensions — personalized feedback may add more once it finishes loading.
                                                            </p>
                                                        )}
                                                        <div className="space-y-2">
                                                            {reportImprovementDisplayItems.map((it) => (
                                                                <div key={it.key} className={`rounded-lg border px-2.5 py-2 ${isDark ? 'bg-gray-900/20 border-gray-700/60' : 'bg-white border-gray-200'}`}>
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>{it.title}</p>
                                                                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${isDark ? 'bg-gray-800/60 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                                                            {it.mentionCount != null && it.totalSlots != null
                                                                                ? `${it.mentionCount}/${it.totalSlots} Qs`
                                                                                : `${it.value}/100`}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-xs mt-1 leading-snug ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{it.hint}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700/60' : 'border-gray-200'}`}>
                                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>By question</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(generatedQuestions || []).map((_, idx) => {
                                                            const a = responseAnalyses?.[idx];
                                                            const band = a?.band != null ? (t[`interviewBand_${a.band}`] ?? a.band) : '—';
                                                            const pct = a?.score != null ? Math.round(a.score * 100) : null;
                                                            return (
                                                                <div key={idx} className={`rounded-md border px-2 py-1 text-[11px] ${isDark ? 'bg-gray-800/40 border-gray-700/60 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                                                    <span className="font-semibold">Q{idx + 1}</span>
                                                                    <span className="opacity-80"> · {band}{pct != null ? ` ${pct}%` : ''}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                        generatedQuestions.map((question, index) => {
                                            if (index !== summarySelectedQuestionIndex) return null;
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
                                                        <p className={`text-base font-medium flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {question}
                                                        </p>
                                                        {band != null && scorePct != null && !analyzingResponses && (
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                                {t[`interviewBand_${band}`] ?? band} ({scorePct}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                    {summaryResultsTab === 'feedback' ? (
                                                        <div className={`pl-12 border-l-2 ${isDark ? 'border-gray-600' : 'border-gray-200'} grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start`}>
                                                            <div className={`rounded-xl p-3 max-h-[min(52vh,380px)] overflow-y-auto ${isDark ? 'bg-gray-800/40 border border-gray-700/60' : 'bg-white border border-gray-200'}`}>
                                                                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                                    {t.interviewYourAnswer}
                                                                </p>
                                                                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    {responses[index]?.trim() || '—'}
                                                                </p>
                                                            </div>
                                                            <div className={`rounded-xl p-3 max-h-[min(52vh,380px)] overflow-y-auto text-sm shadow-sm ${isDark ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-sky-50 border border-sky-200'}`}>
                                                                <p className={`font-semibold mb-2 shrink-0 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>{t.interviewAIFeedback}</p>
                                                                <InterviewFeedbackAccordion
                                                                    feedbackText={feedbacks && feedbacks[index] ? feedbacks[index] : ''}
                                                                    isDark={isDark}
                                                                    questionIndex={index}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                    <div className={`pl-12 border-l-2 ${isDark ? 'border-gray-600' : 'border-gray-200'} space-y-3`}>
                                                        <div className={`rounded-xl border p-3 ${isDark ? 'bg-gray-800/30 border-gray-700/60' : 'bg-white border-gray-200'}`}>
                                                            <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                                {t.interviewTranscript ?? 'Transcript'}
                                                            </p>
                                                            <div className={`max-h-36 overflow-y-auto pr-1 ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed whitespace-pre-wrap`}>
                                                                {responses[index]?.trim() || '—'}
                                                            </div>
                                                        </div>
                                                        {(getAggregatedEmotionsForQuestion(emotionLogs[index]) || responseEmotions[index] || getSegmentsWithGaps(transcriptSegments[index], emotionLogs[index]).length > 0) && (
                                                            <SummaryCollapsible title={t.interviewFacialAnalysisSection} isDark={isDark} defaultOpen={false}>
                                                                {(() => {
                                                                    const aggregated = getAggregatedEmotionsForQuestion(emotionLogs[index]);
                                                                    const snapshot = responseEmotions[index]?.expressions;
                                                                    const emotionsSource = (aggregated && Object.keys(aggregated).length > 0) ? aggregated : (snapshot && Object.keys(snapshot).length > 0 ? snapshot : null);
                                                                    const avgGaze = getAvgGazeForQuestion(emotionLogs[index]);
                                                                    const topNames = emotionsSource ? getTopExpressionNames(emotionsSource, 3) : [];
                                                                    return (
                                                                        <>
                                                                            {emotionsSource ? (
                                                                                <p className={`text-xs leading-relaxed mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                                    {Object.entries(emotionsSource)
                                                                                        .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                                        .sort((a, b) => b[1] - a[1])
                                                                                        .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                                        .join(' · ')}
                                                                                </p>
                                                                            ) : null}
                                                                            {(avgGaze != null || topNames.length > 0) && (
                                                                                <p className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600 opacity-90'}`}>
                                                                                    {avgGaze != null && <span>Eye contact: {Math.round(avgGaze * 100)}%</span>}
                                                                                    {avgGaze != null && topNames.length > 0 && ' · '}
                                                                                    {topNames.length > 0 && <span>Top: {topNames.join(', ')}</span>}
                                                                                </p>
                                                                            )}
                                                                            {(() => {
                                                                                const questionAUs = getAggregatedAUsForQuestion(emotionLogs[index]);
                                                                                const topAUs = questionAUs ? getTopAUNames(questionAUs, 3) : [];
                                                                                return topAUs.length > 0 ? (
                                                                                    <p className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600 opacity-90'}`}>Micro-expressions (AUs): {topAUs.join(', ')}</p>
                                                                                ) : null;
                                                                            })()}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </SummaryCollapsible>
                                                        )}
                                                        {getSegmentsWithGaps(transcriptSegments[index], emotionLogs[index]).length > 0 && emotionLogs[index]?.length > 0 && (
                                                            <SummaryCollapsible title={t.interviewPhraseTimingSection} isDark={isDark} defaultOpen={false}>
                                                                <div className={`space-y-1 max-h-48 overflow-y-auto pr-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
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
                                                                            <p key={i} className={`text-xs leading-snug ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                                <span className={isDark ? 'text-gray-400' : 'opacity-75'}>[{seg.start.toFixed(1)}s–{seg.end.toFixed(1)}s]</span>{' '}
                                                                                {label} — {str}
                                                                                {extras && <span className={isDark ? 'text-gray-300' : 'opacity-80'}>{extras}</span>}
                                                                            </p>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </SummaryCollapsible>
                                                        )}
                                                        {analysis && !analyzingResponses && (responses[index]?.trim() || '').length > 0 && (
                                                            <SummaryCollapsible title={t.interviewSentimentSection} isDark={isDark} defaultOpen>
                                                                <div className="flex flex-wrap gap-2 pt-0.5">
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
                                                            </SummaryCollapsible>
                                                        )}
                                                    </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                        )}
                                        </div>

                                        <div className={`flex-shrink-0 pt-4 mt-4 flex flex-row flex-wrap justify-center gap-2 border-t ${isDark ? 'border-gray-700/80' : 'border-gray-200'}`}>
                                            <button
                                                type="button"
                                                onClick={handleDownloadInterviewPDF}
                                                className={`inline-flex items-center justify-center gap-1.5 max-w-full px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                                    isDark
                                                        ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-500/50'
                                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50'
                                                }`}
                                            >
                                                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
                                                <span className="text-left leading-snug">{t.interviewDownloadPlaceholder}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                                    isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900'
                                                }`}
                                            >
                                                {t.interviewClose}
                                            </button>
                                        </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

