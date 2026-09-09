"use client";

import { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Lock 
} from "lucide-react";

const SAMPLE_LEAKY_PROMPT = `Halo AI, tolong bantu debug kenapa script backend saya gagal menghubungi database:

const config = {
  dbHost: "192.168.1.105",
  dbPassword: "SuperSecretPassword123!",
  openAiKey: "sk-proj-abc1234567890defghijklmnopqrstuVWXYZ123456789",
  awsKey: "AKIAIOSFODNN7EXAMPLE",
  adminEmail: "budi.santoso@perusahaan.co.id",
  phone: "+6281234567890"
};

JWT Token pengguna: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
`;

export function AiPromptSanitizerTool() {
  const [inputPrompt, setInputPrompt] = useState(SAMPLE_LEAKY_PROMPT);
  const [maskApiKeys, setMaskApiKeys] = useState(true);
  const [maskEmails, setMaskEmails] = useState(true);
  const [maskIps, setMaskIps] = useState(true);
  const [maskTokens, setMaskTokens] = useState(true);
  const [maskPhones, setMaskPhones] = useState(true);
  const [copied, setCopied] = useState(false);

  // Redaction logic
  const { sanitized, detectionsCount } = useMemo(() => {
    let text = inputPrompt;
    let detections = 0;

    if (maskApiKeys) {
      // OpenAI API Keys
      const openAiMatches = text.match(/sk-[a-zA-Z0-9_\-]{20,}/g) || [];
      detections += openAiMatches.length;
      text = text.replace(/sk-[a-zA-Z0-9_\-]{20,}/g, "[REDACTED_OPENAI_KEY]");

      // AWS Access Key ID
      const awsMatches = text.match(/AKIA[0-9A-Z]{16}/g) || [];
      detections += awsMatches.length;
      text = text.replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_AWS_KEY]");

      // Generic passwords / secrets in config: (password|secret|key)["']?\s*[:=]\s*["']([^"']+)["']
      text = text.replace(/((?:password|passwd|secret|api_?key)\s*[:=]\s*["'])([^"']+)(["'])/gi, (match, p1, p2, p3) => {
        detections++;
        return `${p1}[REDACTED_SECRET]${p3}`;
      });
    }

    if (maskTokens) {
      // JWT tokens
      const jwtMatches = text.match(/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g) || [];
      detections += jwtMatches.length;
      text = text.replace(/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[REDACTED_JWT_TOKEN]");

      // GitHub tokens
      const ghMatches = text.match(/gh[pousr]_[A-Za-z0-9_]{36,}/g) || [];
      detections += ghMatches.length;
      text = text.replace(/gh[pousr]_[A-Za-z0-9_]{36,}/g, "[REDACTED_GITHUB_TOKEN]");
    }

    if (maskIps) {
      // IPv4
      const ipMatches = text.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g) || [];
      detections += ipMatches.length;
      text = text.replace(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, "[REDACTED_IP_ADDRESS]");
    }

    if (maskEmails) {
      // Emails
      const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      detections += emailMatches.length;
      text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
    }

    if (maskPhones) {
      // Phones
      const phoneMatches = text.match(/(?:\+62|62|0)8[1-9][0-9]{7,10}\b/g) || [];
      detections += phoneMatches.length;
      text = text.replace(/(?:\+62|62|0)8[1-9][0-9]{7,10}\b/g, "[REDACTED_PHONE]");
    }

    return { sanitized: text, detectionsCount: detections };
  }, [inputPrompt, maskApiKeys, maskEmails, maskIps, maskTokens, maskPhones]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Zero-Trust AI Prompt Sanitizer</h2>
            <p className="text-xs text-slate-400">Sensor otomatis API Key, Token JWT, Email, dan Password sebelum dikirim ke AI/LLM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputPrompt(SAMPLE_LEAKY_PROMPT)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Muat Contoh Data Rahasia
          </button>
          <button
            onClick={() => setInputPrompt("")}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
            title="Bersihkan"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Redaction Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={maskApiKeys}
              onChange={(e) => setMaskApiKeys(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            API Keys & Password
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={maskTokens}
              onChange={(e) => setMaskTokens(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            JWT & GitHub Tokens
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={maskEmails}
              onChange={(e) => setMaskEmails(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            Alamat Email
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={maskIps}
              onChange={(e) => setMaskIps(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            IP Address
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={maskPhones}
              onChange={(e) => setMaskPhones(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            Nomor Telepon
          </label>
        </div>

        <div className="flex items-center gap-2">
          {detectionsCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> {detectionsCount} Data Rahasia Disensor
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Bersih / Aman
            </span>
          )}
        </div>
      </div>

      {/* Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Input */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 flex flex-col">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            Prompt Asli (Mengandung Data Sensitif)
          </span>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            rows={13}
            placeholder="Tempel teks prompt atau potongan kode yang ingin Anda tanyakan ke ChatGPT/Claude..."
            className="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-300 focus:border-rose-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Sanitized Output */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Prompt Bersih (Aman Dikirim ke AI)
            </span>
            <button
              onClick={handleCopy}
              disabled={!sanitized}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Prompt Bersih"}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={sanitized}
            rows={13}
            placeholder="Hasil prompt tersanitasi akan muncul di sini..."
            className="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-emerald-300 focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>
      </div>
    </div>
  );
}
