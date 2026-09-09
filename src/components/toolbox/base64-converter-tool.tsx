"use client";

import { useState, ChangeEvent } from "react";
import { 
  Binary, 
  Upload, 
  Copy, 
  Check, 
  Download, 
  Code, 
  FileText, 
  Image as ImageIcon 
} from "lucide-react";

export function Base64ConverterTool() {
  const [base64Raw, setBase64Raw] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileMime, setFileMime] = useState("image/png");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || "application/octet-stream");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const fullUri = ev.target?.result as string;
      setDataUri(fullUri);
      const raw = fullUri.split(",")[1] || "";
      setBase64Raw(raw);
    };
    reader.readAsDataURL(file);
  };

  const handleManualBase64 = (val: string) => {
    setBase64Raw(val);
    if (val.startsWith("data:")) {
      setDataUri(val);
    } else {
      setDataUri(`data:${fileMime};base64,${val.trim()}`);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!dataUri) return;
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = fileName || "file_from_base64";
    a.click();
  };

  const isImage = fileMime.startsWith("image/");
  const htmlSnippet = `<img src="${dataUri}" alt="Base64 Image" />`;
  const cssSnippet = `background-image: url('${dataUri}');`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Base64 Image & File Encoder</h2>
            <p className="text-xs text-slate-400">Enkripsi berkas/gambar lokal ke string Base64 Data URI untuk inline HTML/CSS</p>
          </div>
        </div>

        <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md self-start sm:self-auto">
          <Upload className="h-4 w-4" />
          <span>Pilih Berkas / Foto</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Grid: Preview & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Preview & Details */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-400" />
              Pratinjau Berkas
            </h3>

            {isImage && dataUri ? (
              <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 overflow-hidden">
                <img src={dataUri} alt="Base64 Preview" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-500 p-4">
                <FileText className="h-10 w-10 mb-2 opacity-40" />
                <span className="text-xs">{fileName || "Belum ada berkas dipilih"}</span>
              </div>
            )}

            {fileName && (
              <div className="text-xs text-slate-400 space-y-1">
                <div>Nama: <strong className="text-white">{fileName}</strong></div>
                <div>MIME: <strong className="text-white">{fileMime}</strong></div>
                <div>Panjang Base64: <strong className="text-emerald-400 font-mono">~{Math.round(base64Raw.length / 1024)} KB</strong></div>
              </div>
            )}
          </div>

          {dataUri && (
            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" /> Unduh Berkas Asli
            </button>
          )}
        </div>

        {/* Right Code Formats */}
        <div className="lg:col-span-7 space-y-4">
          {/* Data URI */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Data URI (Lengkap)</span>
              <button
                onClick={() => handleCopy("datauri", dataUri)}
                disabled={!dataUri}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors disabled:opacity-40"
              >
                {copiedKey === "datauri" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <textarea
              readOnly
              value={dataUri}
              placeholder="data:image/png;base64,..."
              rows={3}
              className="w-full rounded-xl bg-slate-950/80 p-3 text-xs font-mono text-emerald-400 border border-slate-800 focus:outline-none resize-none select-all"
            />
          </div>

          {/* Raw Base64 string */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Raw Base64 (Hanya String)</span>
              <button
                onClick={() => handleCopy("raw", base64Raw)}
                disabled={!base64Raw}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors disabled:opacity-40"
              >
                {copiedKey === "raw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <textarea
              value={base64Raw}
              onChange={(e) => handleManualBase64(e.target.value)}
              placeholder="Tempel string base64 manual di sini untuk didekode..."
              rows={3}
              className="w-full rounded-xl bg-slate-950/80 p-3 text-xs font-mono text-slate-300 border border-slate-800 focus:outline-none resize-none"
            />
          </div>

          {/* HTML & CSS Snippets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Code className="h-3 w-3 text-indigo-400" /> HTML &lt;img&gt;</span>
                <button
                  onClick={() => handleCopy("html", htmlSnippet)}
                  disabled={!dataUri}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === "html" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-400 truncate bg-slate-950 p-2 rounded-lg border border-slate-800">
                {dataUri ? htmlSnippet : "<img> snippet..."}
              </pre>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Code className="h-3 w-3 text-pink-400" /> CSS Background</span>
                <button
                  onClick={() => handleCopy("css", cssSnippet)}
                  disabled={!dataUri}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === "css" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-400 truncate bg-slate-950 p-2 rounded-lg border border-slate-800">
                {dataUri ? cssSnippet : "background-image snippet..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
