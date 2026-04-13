'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  Upload,
  FileText,
  X,
  Send,
  AlertTriangle,
  CheckCircle,
  Info,
  Scale,
  Shield,
  ChevronDown,
  ChevronRight,
  Loader2,
  Download,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import InterviewLiveAvatar from '@/components/InterviewLiveAvatar';

let pdfjsLib = null;

async function getPdfjsLib() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    const pdfjsModule = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib = pdfjsModule;

    if (pdfjsLib?.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    if (!pdfjsLib?.getDocument) {
      throw new Error('PDF.js getDocument function not found.');
    }
  }

  return pdfjsLib;
}

// ─── Text extraction — match the client-side resume flow ────────────────────
async function extractDocText(file) {
  const name = (file?.name || '').toLowerCase();
  const type = file?.type || '';
  const isText = type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md');
  const isPdf =
    type === 'application/pdf' ||
    type === 'application/x-pdf' ||
    type === 'application/acrobat' ||
    type === 'applications/pdf' ||
    (type === 'application/octet-stream' && name.endsWith('.pdf')) ||
    name.endsWith('.pdf');

  if (isText) {
    return await file.text();
  }

  if (!isPdf) {
    throw new Error('Unsupported file type. Please upload a PDF, TXT, or Markdown file.');
  }

  try {
    const pdfjs = await getPdfjsLib();
    if (!pdfjs) {
      throw new Error('PDF.js is not available in this browser.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .filter(Boolean)
        .join(' ');
      fullText += `${pageText}\n`;
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error?.message || 'Unknown error'}`);
  }
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  high: {
    badge: 'bg-red-500/15 text-red-500 border-red-500/25',
    icon: 'text-red-500',
    border: 'border-l-red-500',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
    icon: 'text-amber-500',
    border: 'border-l-amber-500',
  },
  low: {
    badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
    icon: 'text-emerald-500',
    border: 'border-l-emerald-500',
  },
};

function RiskBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.badge}`}>
      {severity}
    </span>
  );
}

// ─── Upload dropzone ──────────────────────────────────────────────────────────
function DropZone({ onFile, isDark }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-indigo-400 bg-indigo-500/10'
          : isDark
          ? 'border-white/15 hover:border-indigo-400/50 hover:bg-white/3'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <Upload className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
      <p className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
        Drop a legal document here
      </p>
      <p className={`text-xs mt-1 ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
        PDF, TXT, or Markdown — up to 10 MB
      </p>
    </div>
  );
}

// ─── Analysis report panel ────────────────────────────────────────────────────
function AnalysisReport({ analysis, fileName, isDark }) {
  const [openSection, setOpenSection] = useState('findings');
  if (!analysis) return null;

  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  const Section = ({ id, label, children }) => (
    <div className={`border-b last:border-0 ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
      <button
        onClick={() => toggle(id)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
          isDark
            ? 'text-white/80 hover:text-white hover:bg-white/3'
            : 'text-gray-800 hover:bg-gray-50'
        }`}
      >
        {label}
        {openSection === id
          ? <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
      </button>
      {openSection === id && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  );

  return (
    <div className={`rounded-2xl overflow-hidden border ${
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center gap-3 ${
        isDark ? 'border-white/10 bg-indigo-500/8' : 'border-gray-100 bg-indigo-50/60'
      }`}>
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold truncate ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
            {fileName}
          </p>
          <p className={`text-[10px] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {analysis.documentType}
          </p>
        </div>
        {(analysis.legalAreas || []).slice(0, 2).map((area) => (
          <span key={area} className={`hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {area}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className={`px-4 py-3 text-xs leading-relaxed ${isDark ? 'text-white/55' : 'text-gray-500'}`}>
        {analysis.summary}
      </div>

      {/* Parties */}
      {(analysis.parties || []).length > 0 && (
        <div className={`px-4 pb-3 flex flex-wrap gap-2`}>
          {analysis.parties.map((p, i) => (
            <span key={i} className={`px-2 py-1 rounded-lg text-[10px] font-medium ${
              isDark ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className="opacity-60">{p.role}:</span> {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Accordion sections */}
      <Section id="findings" label={`Key Findings (${(analysis.keyFindings || []).length})`}>
        <ul className="space-y-2">
          {(analysis.keyFindings || []).map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
              <span className={`text-xs leading-relaxed ${isDark ? 'text-white/65' : 'text-gray-600'}`}>{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="risks" label={`Risks (${(analysis.risks || []).length})`}>
        <div className="space-y-2">
          {(analysis.risks || []).map((r, i) => {
            const s = SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.low;
            return (
              <div key={i} className={`pl-3 border-l-2 ${s.border}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{r.issue}</span>
                  <RiskBadge severity={r.severity} />
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{r.detail}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="recommendations" label={`Recommendations (${(analysis.recommendations || []).length})`}>
        <ul className="space-y-2">
          {(analysis.recommendations || []).map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <Sparkles className={`w-3 h-3 mt-0.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              <span className={`text-xs leading-relaxed ${isDark ? 'text-white/65' : 'text-gray-600'}`}>{r}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

// ─── Chat message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, isDark }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 mr-2">
          <Scale className="w-3 h-3 text-indigo-400" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : isDark
            ? 'bg-white/8 text-white/85 rounded-bl-sm border border-white/8'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LegalDocumentAnalyzerPage() {
  const { isDark } = useTheme();

  // Document state
  const [uploadedFile, setUploadedFile] = useState(null);   // { name, text }
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  // Analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [answering, setAnswering] = useState(false);

  // Avatar state
  const avatarRef = useRef(null);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const useAvatar = process.env.NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR === 'true';

  // UI state
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showLawyerModal, setShowLawyerModal] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Speak via avatar (or console fallback) ──
  const speak = useCallback((text) => {
    if (avatarRef.current && avatarReady) {
      avatarRef.current.speak(text);
    }
  }, [avatarReady]);

  // ── File uploaded ──
  const handleFile = useCallback(async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(ext)) {
      setExtractError('Only PDF, TXT, and Markdown files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setExtractError('File exceeds 10 MB limit.');
      return;
    }

    setExtractError('');
    setAnalyzeError('');
    setAnalysis(null);
    setMessages([]);
    setShowLawyerModal(false);
    setExtracting(true);

    try {
      const text = await extractDocText(file);
      if (!text || text.trim().length < 50) {
        setExtractError('Could not extract readable text from this file.');
        return;
      }
      setUploadedFile({ name: file.name, text });
    } catch (e) {
      setExtractError(`Failed to read file: ${e?.message || 'Unknown error'}`);
    } finally {
      setExtracting(false);
    }
  }, []);

  // ── Run analysis once file is loaded ──
  useEffect(() => {
    if (!uploadedFile) return;

    let cancelled = false;
    setAnalyzing(true);
    setAnalyzeError('');

    (async () => {
      try {
        const res = await fetch('/api/legal/document-analyzer/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: uploadedFile.text,
            fileName: uploadedFile.name,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setAnalyzeError(data.error || 'Analysis failed.');
          return;
        }
        setAnalysis(data.analysis);

        // Initial assistant message
        const greeting = data.analysis?.greeting || `I've reviewed your document. What would you like to know about it?`;
        setMessages([{ role: 'assistant', content: greeting }]);
        setShowLawyerModal(true);
        speak(greeting);
      } catch (e) {
        if (!cancelled) setAnalyzeError(e?.message || 'Analysis failed.');
      } finally {
        if (!cancelled) setAnalyzing(false);
      }
    })();

    return () => { cancelled = true; };
  }, [uploadedFile, speak]);

  // ── Send question ──
  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || answering || !uploadedFile) return;

    setInput('');
    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setAnswering(true);

    try {
      // Interrupt avatar if speaking
      avatarRef.current?.interrupt?.();

      const res = await fetch('/api/legal/document-analyzer/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          documentText: uploadedFile.text,
          analysisContext: analysis,
          history: messages.slice(-12),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        const errMsg = data.error || 'Could not get an answer. Please try again.';
        setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
        return;
      }

      const answer = data.answer;
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      speak(answer);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setAnswering(false);
    }
  }, [input, answering, uploadedFile, analysis, messages, speak]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Export report as text ──
  const handleExport = useCallback(() => {
    if (!analysis) return;
    const lines = [
      `LEGAL DOCUMENT ANALYSIS REPORT`,
      `File: ${uploadedFile?.name || 'Unknown'}`,
      `Document Type: ${analysis.documentType}`,
      `Legal Areas: ${(analysis.legalAreas || []).join(', ')}`,
      ``,
      `SUMMARY`,
      analysis.summary,
      ``,
      `PARTIES`,
      ...(analysis.parties || []).map((p) => `  ${p.role}: ${p.name}`),
      ``,
      `KEY FINDINGS`,
      ...(analysis.keyFindings || []).map((f, i) => `  ${i + 1}. ${f}`),
      ``,
      `RISKS`,
      ...(analysis.risks || []).map((r) => `  [${r.severity.toUpperCase()}] ${r.issue}: ${r.detail}`),
      ``,
      `RECOMMENDATIONS`,
      ...(analysis.recommendations || []).map((r, i) => `  ${i + 1}. ${r}`),
      ``,
      `---`,
      `Generated by Kimuntu AI Legal Document Analyzer`,
      `This report is for informational purposes only and does not constitute legal advice.`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis, uploadedFile]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col h-[calc(100vh-2rem)] -m-8 overflow-hidden ${
      isDark ? 'bg-gray-950' : 'bg-[#f5f7fb]'
    }`}>

      {/* ── Top bar ── */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b shrink-0 ${
        isDark ? 'bg-gray-950 border-white/8' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <Link
          href="/dashboard/legal"
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Legal Track
        </Link>
        <span className={`${isDark ? 'text-white/20' : 'text-gray-300'}`}>/</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
            <Scale className="w-3 h-3 text-indigo-400" />
          </div>
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Legal Document Analyzer
          </span>
        </div>
        <div className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
        }`}>
          AI Lawyer
        </div>

        <div className="flex-1" />

        {/* Avatar status indicator */}
        {useAvatar && showLawyerModal && (
          <div className={`flex items-center gap-1.5 text-xs ${
            avatarReady
              ? isDark ? 'text-emerald-400' : 'text-emerald-600'
              : isDark ? 'text-white/30' : 'text-gray-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              avatarSpeaking ? 'bg-emerald-400 animate-pulse' : avatarReady ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
            {avatarSpeaking ? 'Speaking…' : avatarReady ? 'AI Lawyer Ready' : 'Connecting…'}
          </div>
        )}

        {analysis && (
          <button
            onClick={handleExport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDark
                ? 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white border border-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        )}
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Document + Report ── */}
        <div className={`w-[420px] shrink-0 flex flex-col border-r overflow-y-auto ${
          isDark ? 'border-white/8 bg-gray-950' : 'border-gray-200 bg-[#f5f7fb]'
        }`}>
          <div className="p-4 space-y-4">

            {/* Upload */}
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                isDark ? 'text-white/30' : 'text-gray-400'
              }`}>Document</p>

              {!uploadedFile && !extracting && (
                <DropZone onFile={handleFile} isDark={isDark} />
              )}

              {extracting && (
                <div className={`rounded-2xl p-5 flex items-center gap-3 border ${
                  isDark ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'
                }`}>
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                      Extracting text…
                    </p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      Reading document contents
                    </p>
                  </div>
                </div>
              )}

              {extractError && (
                <div className="rounded-2xl p-4 bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{extractError}</p>
                </div>
              )}

              {uploadedFile && !extracting && (
                <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${
                  isDark ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
                      {uploadedFile.name}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                      {(uploadedFile.text.length / 1000).toFixed(1)}k characters extracted
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setAnalysis(null);
                      setMessages([]);
                      setAnalyzeError('');
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isDark ? 'hover:bg-white/10 text-white/40 hover:text-white/70' : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Analysis loading */}
            {analyzing && (
              <div className={`rounded-2xl p-5 border space-y-3 ${
                isDark ? 'bg-indigo-500/6 border-indigo-500/15' : 'bg-indigo-50 border-indigo-200/60'
              }`}>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                      Analyzing document…
                    </p>
                    <p className={`text-xs ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/70'}`}>
                      Identifying parties, risks, and key clauses
                    </p>
                  </div>
                </div>
                {/* Skeleton lines */}
                <div className="space-y-2 pl-8">
                  {[90, 75, 85, 60].map((w, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full animate-pulse ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-200/60'}`}
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {analyzeError && (
              <div className="rounded-2xl p-4 bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{analyzeError}</p>
              </div>
            )}

            {/* Analysis report */}
            {analysis && <AnalysisReport analysis={analysis} fileName={uploadedFile?.name} isDark={isDark} />}

            {/* Disclaimer */}
            <div className={`rounded-xl p-3 flex items-start gap-2 ${
              isDark ? 'bg-white/3 border border-white/6' : 'bg-gray-50 border border-gray-200'
            }`}>
              <Shield className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              <p className={`text-[10px] leading-relaxed ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                This analysis is for informational purposes only and does not constitute legal advice.
                Consult a licensed attorney for your specific situation.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Avatar + Chat ── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className={`flex-1 flex items-center justify-center p-6 lg:p-10 ${
            isDark ? 'bg-gray-950' : 'bg-[#f5f7fb]'
          }`}>
            <div className={`w-full max-w-2xl rounded-[28px] border p-8 text-center ${
              isDark
                ? 'border-white/10 bg-white/[0.03]'
                : 'border-gray-200 bg-white shadow-sm'
            }`}>
              <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                isDark ? 'bg-indigo-500/15' : 'bg-indigo-100'
              }`}>
                {analyzing || extracting ? (
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
                ) : (
                  <Scale className="h-7 w-7 text-indigo-400" />
                )}
              </div>

              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {!uploadedFile
                  ? 'Upload a legal document'
                  : analyzing || extracting
                  ? 'Review in progress'
                  : analysis
                  ? 'Your AI lawyer is ready'
                  : 'Waiting for analysis'}
              </h2>

              <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {!uploadedFile
                  ? 'Add a PDF, TXT, or Markdown document to generate a legal summary and open a private AI lawyer conversation when the review is finished.'
                  : analyzing || extracting
                  ? 'We are extracting the text, reviewing the document, and preparing the lawyer chat popup.'
                  : analysis
                  ? 'The document has been processed. Open the popup to talk through risks, clauses, negotiation points, and next questions.'
                  : 'Once processing finishes, the AI lawyer conversation will open in a popup.'}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  'What are the biggest risks here?',
                  'What should I negotiate?',
                  'Is anything unusual in this document?',
                ].map((prompt) => (
                  <span
                    key={prompt}
                    className={`rounded-xl border px-3 py-1.5 text-xs ${
                      isDark ? 'border-white/10 text-white/45' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {prompt}
                  </span>
                ))}
              </div>

              {analysis && (
                <button
                  onClick={() => setShowLawyerModal(true)}
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
                >
                  <Sparkles className="h-4 w-4" />
                  Open AI Lawyer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLawyerModal && analysis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setShowLawyerModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative flex h-[min(92vh,920px)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-[30px] border ${
              isDark
                ? 'border-white/10 bg-gray-950 shadow-2xl shadow-black/40'
                : 'border-gray-200 bg-white shadow-2xl shadow-gray-400/20'
            }`}
          >
            <button
              onClick={() => setShowLawyerModal(false)}
              className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                isDark ? 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              <X className="h-4 w-4" />
            </button>

            <div className={`flex items-center gap-3 border-b px-5 py-4 pr-16 ${
              isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-200 bg-gray-50/80'
            }`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15">
                <Scale className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI Lawyer Conversation
                </p>
                <p className={`truncate text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {uploadedFile?.name} • {analysis.documentType || 'Legal document'}
                </p>
              </div>
              {useAvatar && (
                <div className={`flex items-center gap-1.5 text-xs ${
                  avatarReady
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : isDark ? 'text-white/30' : 'text-gray-400'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    avatarSpeaking ? 'bg-emerald-400 animate-pulse' : avatarReady ? 'bg-emerald-500' : 'bg-gray-400'
                  }`} />
                  {avatarSpeaking ? 'Speaking…' : avatarReady ? 'AI Lawyer Ready' : 'Connecting…'}
                </div>
              )}
            </div>

            <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
              <div className={`relative h-[260px] flex-shrink-0 overflow-hidden lg:h-auto lg:w-[42%] ${isDark ? 'bg-black' : 'bg-gray-900'}`}>
                {useAvatar ? (
                  <InterviewLiveAvatar
                    ref={avatarRef}
                    className="h-full w-full"
                    onSpeakingChange={setAvatarSpeaking}
                    onReady={() => setAvatarReady(true)}
                    onError={setAvatarError}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-900">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-indigo-500/30 bg-indigo-500/20">
                        <Scale className="h-12 w-12 text-indigo-400" />
                      </div>
                      {avatarSpeaking && (
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping" />
                      )}
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-sm font-semibold text-white/75">AI Legal Counsel</p>
                      <p className="mt-1 text-xs text-white/35">
                        {avatarError ? `Avatar unavailable: ${avatarError}` : 'Set NEXT_PUBLIC_INTERVIEW_USE_LIVEAVATAR=true to enable the live avatar'}
                      </p>
                    </div>
                  </div>
                )}

                {avatarSpeaking && (
                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-end gap-0.5">
                    {[3, 7, 5, 9, 6, 8, 4, 7, 5, 3].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-indigo-400 opacity-80 animate-bounce"
                        style={{
                          height: `${h * 3}px`,
                          animationDelay: `${i * 60}ms`,
                          animationDuration: '0.6s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex flex-1 min-h-0 flex-col ${isDark ? 'bg-gray-950' : 'bg-[#f5f7fb]'}`}>
                {messages.length > 0 && (
                  <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {analysis && messages.length === 1 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {[
                          'What are the biggest risks here?',
                          'Explain the key findings',
                          'What should I negotiate?',
                          'Is this document standard?',
                        ].map((p) => (
                          <button
                            key={p}
                            onClick={() => { setInput(p); }}
                            className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                              isDark
                                ? 'border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10'
                                : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <ChatMessage key={i} msg={msg} isDark={isDark} />
                    ))}

                    {answering && (
                      <div className="flex items-end justify-start gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 shrink-0">
                          <Scale className="h-3 w-3 text-indigo-400" />
                        </div>
                        <div className={`rounded-2xl rounded-bl-sm px-4 py-2.5 ${
                          isDark ? 'border border-white/8 bg-white/8' : 'bg-gray-100'
                        }`}>
                          <div className="flex h-4 items-center gap-1">
                            {[0, 150, 300].map((d) => (
                              <div
                                key={d}
                                className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                                style={{ animationDelay: `${d}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                <div className={`shrink-0 border-t px-4 py-3 ${
                  isDark ? 'border-white/8 bg-gray-950' : 'border-gray-200 bg-white'
                }`}>
                  <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all ${
                    isDark
                      ? 'border-white/10 bg-white/5 focus-within:border-indigo-500/50'
                      : 'border-gray-200 bg-gray-50 focus-within:border-indigo-400'
                  }`}>
                    <Scale className={`h-4 w-4 shrink-0 ${isDark ? 'text-white/25' : 'text-gray-300'}`} />
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={analyzing ? 'Analyzing document…' : 'Ask your AI lawyer anything about this document…'}
                      disabled={!uploadedFile || analyzing || answering}
                      className={`flex-1 resize-none bg-transparent text-sm outline-none placeholder-opacity-40 ${
                        isDark ? 'text-white placeholder-white/30' : 'text-gray-800 placeholder-gray-400'
                      }`}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || !uploadedFile || analyzing || answering}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                        input.trim() && uploadedFile && !analyzing && !answering
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500'
                          : isDark
                          ? 'bg-white/8 text-white/20'
                          : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      {answering
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
