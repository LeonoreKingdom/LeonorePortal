"use client";

import { useState, useMemo } from "react";
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Columns, 
  Sparkles,
  Maximize2
} from "lucide-react";

const TEMPLATES = [
  {
    name: "Kartu Modern (CSS)",
    html: `<div class="card">
  <h2>Halo dari LeonorePortal! 🚀</h2>
  <p>Ini adalah demo live editor HTML, CSS, dan JavaScript interaktif langsung di browser.</p>
  <button onclick="klikSaya()">Klik Saya!</button>
</div>`,
    css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  margin: 0;
}
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  text-align: center;
}
h2 {
  color: #38bdf8;
  margin-top: 0;
}
p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}
button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
button:hover {
  background: #4f46e5;
  transform: scale(1.05);
}`,
    js: `function klikSaya() {
  alert("🎉 Halo! JavaScript berjalan live di LeonorePortal!");
}`,
  },
  {
    name: "Animasi Partikel Canvas",
    html: `<canvas id="canvas"></canvas>`,
    css: `body {
  margin: 0;
  overflow: hidden;
  background: #090d16;
}
canvas {
  display: block;
}`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = Array.from({ length: 40 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 3 + 1,
  dx: (Math.random() - 0.5) * 2,
  dy: (Math.random() - 0.5) * 2,
  color: ['#6366f1', '#38bdf8', '#ec4899'][Math.floor(Math.random() * 3)]
}));

function animate() {
  ctx.fillStyle = 'rgba(9, 13, 22, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(animate);
}
animate();`,
  },
];

export function HtmlEditorTool() {
  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css" | "js">("html");
  const [htmlCode, setHtmlCode] = useState<string>(TEMPLATES[0].html);
  const [cssCode, setCssCode] = useState<string>(TEMPLATES[0].css);
  const [jsCode, setJsCode] = useState<string>(TEMPLATES[0].js);
  const [copied, setCopied] = useState<boolean>(false);

  const fullDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    ${jsCode}
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  const handleApplyTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    setHtmlCode(t.html);
    setCssCode(t.css);
    setJsCode(t.js);
  };

  const handleDownload = () => {
    const blob = new Blob([fullDocument], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preview-${Date.now()}.html`;
    a.click();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 border border-slate-800 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Template Cepat:</span>
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyTemplate(idx)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:border-emerald-500 hover:text-white transition-colors"
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Tersalin" : "Salin Kode HTML"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh .html</span>
          </button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Code Editor Pane */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col h-[520px]">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCodeTab("html")}
                className={`rounded-lg px-3 py-1 text-xs font-bold font-mono transition-colors ${
                  activeCodeTab === "html"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("css")}
                className={`rounded-lg px-3 py-1 text-xs font-bold font-mono transition-colors ${
                  activeCodeTab === "css"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CSS
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("js")}
                className={`rounded-lg px-3 py-1 text-xs font-bold font-mono transition-colors ${
                  activeCodeTab === "js"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                JavaScript
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">Real-time Sandbox</span>
          </div>

          {/* Textarea for Active Code */}
          <div className="flex-1 bg-slate-950 p-4">
            {activeCodeTab === "html" && (
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="<!-- Ketik struktur HTML di sini -->"
                className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-rose-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            )}
            {activeCodeTab === "css" && (
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                placeholder="/* Ketik styling CSS di sini */"
                className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-sky-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            )}
            {activeCodeTab === "js" && (
              <textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                placeholder="// Ketik skrip JavaScript di sini"
                className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-amber-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Live Sandboxed Preview */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Pratinjau Langsung (Live Preview)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-emerald-400">Aktif</span>
            </div>
          </div>

          <div className="flex-1 bg-white relative">
            <iframe
              title="Live Preview Sandbox"
              srcDoc={fullDocument}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}