"use client";

import { useState, useMemo } from "react";
import { 
  Regex as RegexIcon, 
  Sparkles, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ArrowRightLeft,
  Search
} from "lucide-react";

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const PRESET_PATTERNS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "URL / Link Web", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "g" },
  { name: "Nomor HP Indonesia", pattern: "(\\+62|62|0)8[1-9][0-9]{6,10}", flags: "g" },
  { name: "IPv4 Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { name: "Hex Color (#RGB / #RRGGBB)", pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b", flags: "g" },
  { name: "Tanggal YYYY-MM-DD", pattern: "\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])", flags: "g" },
  { name: "Slug URL", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", flags: "g" },
];

export function RegexTesterTool() {
  const [pattern, setPattern] = useState<string>("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})");
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
  });
  const [testText, setTestText] = useState<string>(
    `Kontak kami di halo@leonorekingdom.xyz atau support.team@service.co.id untuk info lebih lanjut.\nAdmin: dev_master99@portal.io.`
  );
  const [replacePattern, setReplacePattern] = useState<string>("[$1 AT $2]");
  const [copied, setCopied] = useState<boolean>(false);

  const flagString = useMemo(() => {
    let f = "";
    if (flags.g) f += "g";
    if (flags.i) f += "i";
    if (flags.m) f += "m";
    if (flags.s) f += "s";
    return f;
  }, [flags]);

  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern) return { matches: [], error: null, highlightedHtml: testText };

    try {
      const regex = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        let lastIdx = 0;
        let html = "";

        while ((m = regex.exec(testText)) !== null) {
          if (m.index === regex.lastIndex) regex.lastIndex++;
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });

          html += escapeHtml(testText.substring(lastIdx, m.index));
          html += `<mark class="bg-indigo-500/40 text-indigo-200 px-1 py-0.5 rounded border border-indigo-400/50 font-bold">${escapeHtml(m[0])}</mark>`;
          lastIdx = regex.lastIndex;
        }
        html += escapeHtml(testText.substring(lastIdx));

        return { matches: results, error: null, highlightedHtml: html };
      } else {
        const m = regex.exec(testText);
        if (m) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1) });
          const html =
            escapeHtml(testText.substring(0, m.index)) +
            `<mark class="bg-indigo-500/40 text-indigo-200 px-1 py-0.5 rounded border border-indigo-400/50 font-bold">${escapeHtml(m[0])}</mark>` +
            escapeHtml(testText.substring(m.index + m[0].length));
          return { matches: results, error: null, highlightedHtml: html };
        }
        return { matches: [], error: null, highlightedHtml: escapeHtml(testText) };
      }
    } catch (err: any) {
      return { matches: [], error: err.message, highlightedHtml: escapeHtml(testText) };
    }
  }, [pattern, flagString, testText, flags.g]);

  const replacedText = useMemo(() => {
    if (!pattern || error) return testText;
    try {
      const regex = new RegExp(pattern, flagString);
      return testText.replace(regex, replacePattern);
    } catch {
      return testText;
    }
  }, [pattern, flagString, testText, replacePattern, error]);

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return (
    <div className="space-y-6">
      {/* Pattern Input & Flag Controls */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RegexIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Regular Expression Tester</h3>
          </div>

          {/* Flags Toggles */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 font-mono px-1">Flags:</span>
            {[
              { key: "g", label: "Global (g)" },
              { key: "i", label: "Case-Insensitive (i)" },
              { key: "m", label: "Multiline (m)" },
              { key: "s", label: "DotAll (s)" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFlags((prev) => ({ ...prev, [f.key]: !prev[f.key as keyof typeof prev] }))}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  flags[f.key as keyof typeof flags]
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f.key}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2.5 px-4 font-mono text-sm focus-within:border-indigo-500 transition-colors">
            <span className="text-indigo-400 font-bold">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Masukkan pola regex..."
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
            <span className="text-indigo-400 font-bold">/{flagString}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Sintaks Regex Tidak Valid: {error}</span>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 text-[11px]">Pola Populer:</span>
          {PRESET_PATTERNS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPattern(p.pattern);
                setFlags({ g: true, i: true, m: false, s: false });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800/80 transition-colors text-[11px]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Test String & Live Visual Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input String */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Teks Uji (Test String)</span>
            <span className="text-slate-500 font-normal">{testText.length} karakter</span>
          </div>
          <textarea
            rows={8}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Ketik atau tempel teks pengujian di sini..."
          />
        </div>

        {/* Highlight Output */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hasil Highlight Visual</span>
            </span>
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-bold">
              {matches.length} Cocok
            </span>
          </div>
          <div
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 min-h-[170px] max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Match Table & Groups Extraction */}
      {matches.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Kecocokan & Captured Groups ({matches.length})
          </h4>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Full Match</th>
                  <th className="py-2 px-3">Posisi Index</th>
                  <th className="py-2 px-3">Groups ($1, $2, ...)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-indigo-300 font-bold">{m.match}</td>
                    <td className="py-2 px-3 text-slate-400">{m.index} .. {m.index + m.match.length}</td>
                    <td className="py-2 px-3 text-emerald-400">
                      {m.groups.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {m.groups.map((g, gIdx) => (
                            <span key={gIdx} className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                              ${gIdx + 1}: {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Substitution / Replace Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <ArrowRightLeft className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Substitusi & Penggantian (Regex Replace)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1.5 font-sans">Pola Pengganti (Gunakan $1, $2 untuk grup):</label>
            <input
              type="text"
              value={replacePattern}
              onChange={(e) => setReplacePattern(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5 font-sans">
              <span>Hasil Teks Penggantian:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(replacedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-emerald-300 whitespace-pre-wrap max-h-28 overflow-y-auto">
              {replacedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}