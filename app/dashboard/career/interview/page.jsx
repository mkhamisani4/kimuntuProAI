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

/** Strip HTML tags so class names like "text-emerald-400" never show as visible text. */
function stripHtmlFromText(html) {
    if (!html || typeof html !== 'string') return html || '';
    return html.replace(/<[^>]+>/g, '').trim();
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
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [speechVoices, setSpeechVoices] = useState([]);
    const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
    const [videoStream, setVideoStream] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [showThankYouPopup, setShowThankYouPopup] = useState(false);
    /** Noted emotions per question when user stops recording (dominant + expression scores). */
    const [responseEmotions, setResponseEmotions] = useState([]);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const videoPreviewRef = useRef(null);

    const { expressions: faceExpressions, dominant: faceDominant, loading: faceLoading, error: faceError, log: faceLog } = useFaceExpressionAnalysis(videoPreviewRef, !!videoStream, { intervalMs: 800 });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const load = () => setSpeechVoices(window.speechSynthesis.getVoices());
        load();
        window.speechSynthesis.onvoiceschanged = load;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    useEffect(() => {
        if (speechVoices.length > 0 && !selectedVoiceUri) {
            const lang = document.documentElement?.lang === 'fr' ? 'fr' : 'en';
            const match = speechVoices.find((v) => v.lang.startsWith(lang)) || speechVoices[0];
            setSelectedVoiceUri(match?.voiceURI ?? '');
        }
    }, [speechVoices, selectedVoiceUri]);

    const interviewTypes = [
        'Technical',
        'Behavioral',
        'Case Study',
        'Mixed',
        'System Design',
        'Leadership',
        'Other'
    ];

    const handleResumeFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            try {
                const text = await extractResumeText(file);
                setResumeText(text);
            } catch (err) {
                console.error('Error extracting resume text:', err);
                setError(t.interviewErrorExtract);
            }
        }
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
        stopVideoPreview();
        setShowThankYouPopup(false);
        setShowQuestionsModal(false);
        setSimulationActive(false);
        setCurrentQuestionIndex(0);
        setResponses([]);
        setResponseEmotions([]);
        setResponseAnalyses(null);
        setEvaluationOverall(null);
        setFeedbacks(null);
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
        startVideoPreview();
    };

    const speakQuestion = () => {
        const question = generatedQuestions[currentQuestionIndex];
        if (!question || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(question);
        u.rate = 0.95;
        u.lang = document.documentElement?.lang === 'fr' ? 'fr-FR' : 'en-US';
        const voice = speechVoices.find((v) => v.voiceURI === selectedVoiceUri);
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
    };

    const stopSpeech = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    };

    const handleResponseChange = (value) => {
        setResponses(prev => {
            const next = [...prev];
            next[currentQuestionIndex] = value;
            return next;
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < generatedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setCurrentQuestionIndex(generatedQuestions.length);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const inSummaryView = showQuestionsModal && simulationActive && generatedQuestions.length > 0 && currentQuestionIndex >= generatedQuestions.length;

    const handleGetAllFeedback = () => {
        if (!responseAnalyses?.length || loadingFeedbackIndex !== null) return;
        setLoadingFeedbackIndex(-1);
        getInterviewFeedback(generatedQuestions, responses, responseAnalyses)
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoadingFeedbackIndex(null));
    };

    /** Build and download a single PDF with questions, responses, model findings, and AI feedback. */
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
            const emotions = responseEmotions[index];
            const emotionsLine = emotions?.expressions && Object.keys(emotions.expressions).length > 0
                ? Object.entries(emotions.expressions)
                    .filter(([, v]) => typeof v === 'number' && v >= 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                    .join(', ')
                : '—';
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
            sections[`Question ${index + 1}`] = [
                question,
                '',
                'Your response:',
                response,
                '',
                'Emotions noted:',
                emotionsLine,
                '',
                'Model findings:',
                findings,
                '',
                'AI feedback:',
                feedback
            ].join('\n');
        });

        generatePDF(sections, {
            assistantType: 'interview',
            model: 'Interview Simulator',
            generatedAt: new Date()
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks = [];
            recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                if (chunks.length === 0) return;
                const blob = new Blob(chunks, { type: mime });
                setIsTranscribing(true);
                try {
                    const form = new FormData();
                    form.append('file', blob, 'audio.webm');
                    const res = await fetch('/api/interview/transcribe', { method: 'POST', body: form });
                    const data = await res.json();
                    if (res.ok && typeof data.text === 'string') {
                        handleResponseChange((responses[currentQuestionIndex] ?? '') + (responses[currentQuestionIndex] ? ' ' : '') + data.text);
                    }
                } catch (err) {
                    console.warn('Transcribe failed:', err);
                } finally {
                    setIsTranscribing(false);
                }
            };
            recorder.start(1000);
            setIsRecording(true);
        } catch (err) {
            console.warn('Microphone access failed:', err);
        }
    };

    /** Stops recording, runs transcription, and stores current face emotions for this question. */
    const stopRecording = (faceSnapshot) => {
        if (faceSnapshot) {
            setResponseEmotions((prev) => {
                const next = [...prev];
                while (next.length <= currentQuestionIndex) next.push(null);
                next[currentQuestionIndex] = {
                    dominant: faceSnapshot.dominant ?? null,
                    expressions: faceSnapshot.expressions ? { ...faceSnapshot.expressions } : {}
                };
                return next;
            });
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
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

            setGeneratedQuestions(Array.isArray(questions) ? questions.slice(0, 6) : []);
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
                                        {speechVoices.length > 1 && (
                                            <label className="block w-full">
                                                <span className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Voice</span>
                                                <select
                                                    value={selectedVoiceUri}
                                                    onChange={(e) => setSelectedVoiceUri(e.target.value)}
                                                    className={`w-full text-sm rounded-xl px-3 py-2.5 border transition-colors ${isDark
                                                        ? 'bg-gray-800 border-gray-600 text-gray-200 focus:border-emerald-500/50'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                                >
                                                    {speechVoices.map((v) => (
                                                        <option key={v.voiceURI} value={v.voiceURI}>
                                                            {v.name} {v.lang ? `(${v.lang})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
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
                                            {/* User camera slot */}
                                            <div className={`flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden border shadow-md ${isDark ? 'border-gray-600/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
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
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {videoError && !videoStream && (
                                                    <p className="text-sm text-red-400 px-3 py-2">{videoError}</p>
                                                )}
                                            </div>
                                            {/* Avatar slot (placeholder: green circle + label) */}
                                            <div className={`flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden border shadow-md ${isDark ? 'border-gray-600/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                                <div className={`flex-1 min-h-0 flex flex-col items-center justify-center gap-3 ${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-100/80 text-gray-500'}`}>
                                                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0 shadow-lg ${isDark ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-gray-800' : 'bg-gradient-to-br from-emerald-400/50 to-teal-400/50 ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-gray-100'}`} />
                                                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avatar</span>
                                                </div>
                                            </div>
                                        </div>

                                        {(responses[currentQuestionIndex] ?? '').trim() && (
                                            <div className={`rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'} p-3`}>
                                                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.interviewTranscript ?? 'Transcript'}</p>
                                                <textarea
                                                    id="interview-response"
                                                    value={responses[currentQuestionIndex] ?? ''}
                                                    onChange={(e) => handleResponseChange(e.target.value)}
                                                    rows={2}
                                                    className={`w-full px-2 py-1.5 rounded text-xs min-h-[48px] max-h-[80px] resize-y ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-300 text-gray-700'}`}
                                                    placeholder={t.interviewEditTranscript ?? 'Edit if needed...'}
                                                />
                                                {responseEmotions[currentQuestionIndex] && (
                                                    <div className={`mt-2 pt-2 border-t ${isDark ? 'border-gray-600/50 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                                                        <p className="text-xs font-medium mb-1">Emotions noted</p>
                                                        {responseEmotions[currentQuestionIndex].expressions && Object.keys(responseEmotions[currentQuestionIndex].expressions).length > 0 ? (
                                                            <p className="text-xs leading-relaxed">
                                                                {Object.entries(responseEmotions[currentQuestionIndex].expressions)
                                                                    .filter(([, v]) => typeof v === 'number' && v >= 0)
                                                                    .sort((a, b) => b[1] - a[1])
                                                                    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round((v ?? 0) * 100)}%`)
                                                                    .join(' · ')}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs opacity-75">No face detected</p>
                                                        )}
                                                    </div>
                                                )}
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
                                                {t.interviewStopRecording ?? 'Stop'}
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
                                                {isTranscribing ? (t.interviewTranscribing ?? 'Transcribing...') : (t.interviewRecord ?? 'Record')}
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 min-w-0 px-2 sm:px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                                        >
                                            <span className="truncate">{currentQuestionIndex === generatedQuestions.length - 1 ? t.interviewFinish : t.interviewNext}</span>
                                            <ChevronRight className="w-4 h-4 shrink-0" />
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
                                                        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {t.interviewYourResponse}:
                                                        </p>
                                                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                                                            {responses[index]?.trim() || '—'}
                                                        </p>
                                                        {analysis && !analyzingResponses && (responses[index]?.trim() || '').length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
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

                                        <div className={`flex-shrink-0 pt-4 mt-4 flex flex-col sm:flex-row gap-3 border-t ${isDark ? 'border-gray-700/80' : 'border-gray-200'}`}>
                                            <button
                                                type="button"
                                                onClick={handleGetAllFeedback}
                                                disabled={loadingFeedbackIndex !== null || !responseAnalyses?.length}
                                                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    loadingFeedbackIndex !== null || !responseAnalyses?.length
                                                        ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isDark ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25'
                                                }`}
                                            >
                                                {loadingFeedbackIndex === -1 ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                <span>{t.interviewGetFeedback ?? 'Get AI feedback'}</span>
                                            </button>
                                            <button
                                                onClick={() => setShowThankYouPopup(true)}
                                                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
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

