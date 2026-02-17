'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2, Mic, Video, TrendingUp, AlertCircle, X, FileText, ChevronRight, ChevronLeft, Volume2, Square } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { generateInterviewQuestions, extractResumeText } from '@/services/openaiService';
import { evaluateInterviewResponses, getInterviewFeedback } from '@/services/responseAnalysisService';

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
    const [responseTypes, setResponseTypes] = useState([]); // 'text' | 'audio' per question
    const [speechVoices, setSpeechVoices] = useState([]);
    const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

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

    const closeModal = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setShowQuestionsModal(false);
        setSimulationActive(false);
        setCurrentQuestionIndex(0);
        setResponses([]);
        setResponseAnalyses(null);
        setEvaluationOverall(null);
        setFeedbacks(null);
        setAnalyzingResponses(false);
        setIsRecording(false);
        setIsTranscribing(false);
        setResponseTypes([]);
    };

    const handleStartSimulation = () => {
        setSimulationActive(true);
        setCurrentQuestionIndex(0);
        setResponses(generatedQuestions.map(() => ''));
        setResponseTypes(generatedQuestions.map(() => 'audio'));
    };

    const setResponseTypeForCurrent = (type) => {
        setResponseTypes(prev => {
            const next = [...prev];
            next[currentQuestionIndex] = type;
            return next;
        });
    };

    const currentResponseType = responseTypes[currentQuestionIndex] ?? 'audio';

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

    const stopRecording = () => {
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
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push('/dashboard/career')}
                    className={`p-2 rounded-lg transition-all ${isDark
                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <Users className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.interviewSimulator}
                    </h1>
                </div>
            </div>

            <div className={`${isDark
                ? 'bg-gray-900/80 border border-gray-800'
                : 'bg-white border border-gray-200'
            } rounded-2xl p-8 shadow-lg`}>
                <div className="max-w-3xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.interviewConfigure}
                    </h2>
                    <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t.interviewConfigureDesc}
                    </p>

                    <div className="space-y-6">
                        {/* Job Description */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewJobDescription} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder={t.interviewPasteJobDesc}
                                rows={6}
                                className={`w-full px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewRole} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder={t.interviewRolePlaceholder}
                                className={`w-full px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Company name <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                className={`w-full px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                required
                            />
                        </div>

                        {/* Company Website */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewCompanyWebsite} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <input
                                type="url"
                                value={companyWebsite}
                                onChange={(e) => setCompanyWebsite(e.target.value)}
                                placeholder={t.interviewWebsitePlaceholder}
                                className={`w-full px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                            />
                        </div>

                        {/* Type of Interview */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewType} <span className={`${isDark ? 'text-red-500' : 'text-red-600'}`}>{t.interviewRequired}</span>
                            </label>
                            <select
                                value={interviewType}
                                onChange={(e) => setInterviewType(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg ${isDark
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
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewResume} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <input
                                type="file"
                                accept=".txt,.pdf"
                                onChange={handleResumeFileChange}
                                className={`w-full px-4 py-2 rounded-lg text-sm ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white'
                                    : 'bg-white border border-gray-300 text-gray-900'
                                } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30`}
                            />
                            <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                Supported formats: .txt, .pdf
                            </p>
                            {resumeFile && (
                                <p className={`mt-2 text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    ✓ {resumeFile.name}
                                </p>
                            )}
                        </div>

                        {/* Skills List */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t.interviewSkills} <span className="text-gray-500">{t.interviewOptional}</span>
                            </label>
                            <textarea
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder={t.interviewSkillsPlaceholder}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                            />
                        </div>

                        {error && (
                            <div className={`p-4 rounded-lg ${isDark
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
                            className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                !jobDescription || !role || !companyName || !interviewType || isLoading
                                    ? isDark
                                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
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
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4" onClick={closeModal}>
                    <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl w-full max-w-6xl min-h-[88vh] max-h-[95vh] flex overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-2xl relative`} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeModal}
                            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all z-20 ${
                                isDark
                                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left pane: session info (questions view + ending screen only) */}
                        {simulationActive && (
                            <div className={`hidden sm:flex flex-col items-center justify-start pt-24 pb-12 px-6 w-64 flex-shrink-0 border-r min-h-0 ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/80'}`}>
                                <div className={`w-28 h-28 rounded-full flex-shrink-0 shadow-lg ${isDark ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-2 ring-emerald-500/40' : 'bg-gradient-to-br from-emerald-400/40 to-teal-400/40 ring-2 ring-emerald-400/50'}`} />
                                <div className="flex-1 min-h-0 flex flex-col justify-center items-center w-full mt-8 pb-20">
                                    <div className="w-full text-center space-y-5 flex flex-col items-center">
                                        <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {role || '—'}
                                        </p>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {t.interviewCompanyName}: {companyName || '—'}
                                        </p>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {t.interviewInterviewType}: {interviewType || '—'}
                                        </p>
                                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {t.interviewNumQuestions}: {generatedQuestions?.length ?? 0}
                                        </p>
                                        <div className={`pt-6 mt-6 border-t w-full ${isDark ? 'border-gray-600/50' : 'border-gray-200'}`}>
                                            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {t.interviewDownloadPlaceholder}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                        {/* Mobile: compact session bar (only when simulation is active) */}
                        {simulationActive && (
                            <div className={`sm:hidden flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30' : 'bg-gradient-to-br from-emerald-400/40 to-teal-400/40'}`} />
                                <div className="min-w-0">
                                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{role || '—'}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{companyName} · {interviewType} · {generatedQuestions?.length ?? 0} questions</p>
                                </div>
                            </div>
                        )}
                        <div className="p-8 sm:p-10 flex-1 flex flex-col min-h-0">
                            {!simulationActive ? (
                                <>
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="flex flex-col items-center justify-center text-center pt-16 pb-12 px-4 max-w-xl mx-auto flex-1">
                                            <h2 className={`text-3xl sm:text-4xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                Welcome to Your Interview with <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{companyName || '—'}</span>
                                            </h2>
                                            <p className={`text-lg sm:text-xl mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                for the role of <span className="font-semibold">{role || '—'}</span>
                                            </p>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {interviewType} interview · {generatedQuestions?.length ?? 0} questions
                                            </p>
                                            <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                When you’re ready, start the simulation to see the first question.
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-6 flex gap-4 w-full max-w-2xl mx-auto">
                                            <button
                                                onClick={closeModal}
                                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                                                    isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                {t.interviewClose}
                                            </button>
                                            <button
                                                onClick={handleStartSimulation}
                                                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-2"
                                            >
                                                {t.interviewStartSimulation}
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : currentQuestionIndex < generatedQuestions.length ? (
                                <>
                                    <div className="mb-6">
                                        <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            {t.interviewQuestionOf} {currentQuestionIndex + 1} {t.interviewOf} {generatedQuestions.length}
                                        </p>
                                        <h2 className={`text-2xl font-bold leading-relaxed mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {generatedQuestions[currentQuestionIndex]}
                                        </h2>
                                    </div>

                                    <div className="mb-10">
                                        <div className="my-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={speakQuestion}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0 ${isDark
                                                    ? 'bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/50'
                                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-600'
                                                }`}
                                            >
                                                <Volume2 className="w-4 h-4" aria-hidden />
                                                <span>{t.interviewListenQuestion ?? 'Listen to question'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopSpeech}
                                                title="Stop"
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0 ${isDark
                                                    ? 'bg-red-500/25 text-red-300 hover:bg-red-500/35 border border-red-500/50'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                                }`}
                                            >
                                                <Square className="w-4 h-4" aria-hidden />
                                                <span>Stop</span>
                                            </button>
                                            {speechVoices.length > 1 && (
                                                <label className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Voice:</span>
                                                    <select
                                                        value={selectedVoiceUri}
                                                        onChange={(e) => setSelectedVoiceUri(e.target.value)}
                                                        className={`text-sm rounded-lg px-3 py-1.5 border ${isDark
                                                            ? 'bg-gray-800 border-gray-600 text-gray-200'
                                                            : 'bg-white border-gray-300 text-gray-900'
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
                                        <label className={`block text-sm font-medium mt-8 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="interview-response">
                                            {t.interviewYourResponse}
                                        </label>
                                        <div className={`flex rounded-xl p-1 mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                            <button
                                                type="button"
                                                onClick={() => setResponseTypeForCurrent('text')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${currentResponseType === 'text'
                                                    ? isDark ? 'bg-gray-700 text-white shadow' : 'bg-white text-gray-900 shadow'
                                                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <FileText className="w-4 h-4" />
                                                {t.interviewResponseTypeText ?? 'Type'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setResponseTypeForCurrent('audio')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${currentResponseType === 'audio'
                                                    ? isDark ? 'bg-gray-700 text-white shadow' : 'bg-white text-gray-900 shadow'
                                                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                <Mic className="w-4 h-4" />
                                                {t.interviewResponseTypeAudio ?? 'Record'}
                                            </button>
                                        </div>
                                        {currentResponseType === 'text' ? (
                                            <textarea
                                                id="interview-response"
                                                value={responses[currentQuestionIndex] ?? ''}
                                                onChange={(e) => handleResponseChange(e.target.value)}
                                                placeholder={t.interviewYourResponse + '...'}
                                                rows={8}
                                                className={`w-full px-5 py-4 rounded-xl text-base leading-relaxed ${isDark
                                                    ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                            />
                                        ) : (
                                            <div className={`rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'} p-4`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    {isRecording ? (
                                                        <button
                                                            type="button"
                                                            onClick={stopRecording}
                                                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                        >
                                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                                            {t.interviewStopRecording ?? 'Stop'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={startRecording}
                                                            disabled={isTranscribing}
                                                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium ${isTranscribing
                                                                ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            }`}
                                                        >
                                                            {isTranscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                                                            {isTranscribing ? (t.interviewTranscribing ?? 'Transcribing...') : (t.interviewRecord ?? 'Record')}
                                                        </button>
                                                    )}
                                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        {isRecording ? (t.interviewRecordingHint ?? 'Click Stop when finished.') : isTranscribing ? '' : (t.interviewRecordHint ?? 'Record your answer, then we’ll transcribe it to text.')}
                                                    </p>
                                                </div>
                                                {(responses[currentQuestionIndex] ?? '').trim() && (
                                                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600/50' : 'border-gray-200'}`}>
                                                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.interviewTranscript ?? 'Transcript'}</p>
                                                        <textarea
                                                            value={responses[currentQuestionIndex] ?? ''}
                                                            onChange={(e) => handleResponseChange(e.target.value)}
                                                            rows={4}
                                                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-300' : 'bg-white border border-gray-300 text-gray-700'}`}
                                                            placeholder={t.interviewEditTranscript ?? 'Edit if needed...'}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentQuestionIndex === 0}
                                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                                currentQuestionIndex === 0
                                                    ? isDark ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            {t.interviewPrevious}
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-2"
                                        >
                                            {currentQuestionIndex === generatedQuestions.length - 1 ? t.interviewFinish : t.interviewNext}
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <div className="flex-shrink-0">
                                            <div className="text-center mb-6">
                                                {evaluationOverall && !analyzingResponses && (
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-emerald-50 border border-emerald-200'}`}>
                                                        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                                            {t.interviewOverall}: {t[`interviewBand_${evaluationOverall.overallBand}`] ?? evaluationOverall.overallBand}
                                                        </span>
                                                        <span className={`text-xs ${isDark ? 'text-emerald-400/90' : 'text-emerald-600'}`}>
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
                                                    className={`p-6 rounded-xl ${isDark
                                                        ? 'bg-gray-800/50 border border-gray-700'
                                                        : 'bg-gray-50 border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isDark
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-emerald-100 text-emerald-600'
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
                                                            <div className={`mt-4 p-4 rounded-xl text-sm ${isDark ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-sky-50 border border-sky-200'}`}>
                                                                <p className={`font-medium mb-2 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>{t.interviewAIFeedback}</p>
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

                                        <div className={`flex-shrink-0 pt-4 mt-4 flex flex-col sm:flex-row gap-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                            <button
                                                type="button"
                                                onClick={handleGetAllFeedback}
                                                disabled={loadingFeedbackIndex !== null || !responseAnalyses?.length}
                                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                                    loadingFeedbackIndex !== null || !responseAnalyses?.length
                                                        ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isDark ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'
                                                }`}
                                            >
                                                {loadingFeedbackIndex === -1 ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                <span>{t.interviewGetFeedback ?? 'Get AI feedback'}</span>
                                            </button>
                                            <button
                                                onClick={closeModal}
                                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                                                    isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                {t.interviewClose}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

