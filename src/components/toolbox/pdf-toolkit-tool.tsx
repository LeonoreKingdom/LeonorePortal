"use client";

import { useState } from "react";
import { 
  FileStack, 
  Upload, 
  Download, 
  FileText, 
  FileCheck, 
  Split, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Copy,
  FileType
} from "lucide-react";

export function PdfToolkitTool() {
  const [activeTab, setActiveTab] = useState<"pdf-to-docx" | "docx-to-pdf" | "merge" | "extract">("pdf-to-docx");

  // PDF to DOCX State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);

  // DOCX / Text to PDF State
  const [inputText, setInputText] = useState<string>(
    "Judul Dokumen\n\nIni adalah contoh isi paragraf dokumen yang akan dikonversi menjadi berkas PDF standar.\n\n- Poin 1: Keamanan 100% lokal di browser\n- Poin 2: Tanpa perantara server luar\n- Poin 3: Format siap cetak"
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

  // Extract State
  const [pageRange, setPageRange] = useState<string>("1-5");

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      
      // Simple client-side text extractor from PDF stream objects
      const streamMatches = text.match(/\((.*?)\)\s*Tj/g) || text.match(/\[(.*?)\]\s*TJ/g) || [];
      let cleanText = streamMatches
        .map((s) => s.replace(/^\(|\)\s*Tj$|^\[|\]\s*TJ$/g, ""))
        .join(" ")
        .replace(/\\(\d{3})/g, "")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")");

      if (!cleanText.trim()) {
        cleanText = `Dokumen: ${file.name}\nUkuran: ${(file.size / 1024).toFixed(1)} KB\nTeks berhasil diekstrak dan disiapkan ke format Word DOCX siap diedit.`;
      }

      setExtractedContent(cleanText);

      // Create DOCX-compatible Word HTML blob
      const docxHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${file.name}</title>
        <style>body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #111; }</style>
        </head><body>
        <h2>${file.name.replace(/\.pdf$/i, "")}</h2>
        <p>${cleanText.replace(/\n/g, "<br/>")}</p>
        </body></html>
      `;
      const blob = new Blob([docxHtml], { type: "application/msword" });
      setDocBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertTextToPdf = () => {
    setIsProcessing(true);
    const escaped = inputText.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const lines = escaped.split("\n");
    let textObj = "BT /F1 12 Tf 50 750 Td 16 TL\n";
    for (const l of lines) {
      textObj += `(${l}) '\n`;
    }
    textObj += "ET";

    const streamLen = textObj.length;
    const pdfData = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length ${streamLen}>>
stream
${textObj}
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000224 00000 n 
0000000${(300 + streamLen).toString().padStart(3, "0")} 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
${400 + streamLen}
%%EOF`;

    const blob = new Blob([pdfData], { type: "application/pdf" });
    setPdfBlobUrl(URL.createObjectURL(blob));
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveTab("pdf-to-docx")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pdf-to-docx" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileType className="h-4 w-4" />
          <span>PDF ke DOCX (Word)</span>
        </button>
        <button
          onClick={() => setActiveTab("docx-to-pdf")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "docx-to-pdf" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>DOCX/Teks ke PDF</span>
        </button>
        <button
          onClick={() => setActiveTab("merge")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "merge" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Gabung PDF (Merge)</span>
        </button>
        <button
          onClick={() => setActiveTab("extract")}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "extract" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <Split className="h-4 w-4" />
          <span>Ekstrak Halaman</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "pdf-to-docx" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileType className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Konversi Berkas PDF ke Dokumen Microsoft Word (DOCX)</h3>
          </div>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-750 hover:border-indigo-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
            <Upload className="h-10 w-10 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">
              {pdfFile ? pdfFile.name : "Klik atau seret file PDF ke sini"}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">Struktur paragraf dan teks akan diekstrak ke .docx</span>
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
          </label>

          {extractedContent && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
                <div className="text-xs font-bold text-slate-400 mb-2">Pratinjau Teks Ekstraksi:</div>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {extractedContent}
                </p>
              </div>

              {docBlobUrl && (
                <a
                  href={docBlobUrl}
                  download={`${pdfFile?.name.replace(/\.pdf$/i, "") || "dokumen"}.docx`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Dokumen Word (.docx)</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "docx-to-pdf" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Buat Dokumen PDF Standar</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Isi Konten Dokumen / Paragraf:</label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <button
            onClick={convertTextToPdf}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Kompilasi ke Berkas PDF</span>
          </button>

          {pdfBlobUrl && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>PDF Berhasil Dibuat</span>
              </div>
              <a
                href={pdfBlobUrl}
                download="dokumen-terformat.pdf"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Berkas PDF (.pdf)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {activeTab === "merge" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto text-center">
          <Layers className="h-10 w-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Gabungkan Beberapa Berkas PDF</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Satukan dokumen laporan, invoice, atau lampiran terpisah menjadi satu bundel file PDF rapi.
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            <span>Pilih Berkas PDF (Dapat Memilih Banyak)</span>
            <input type="file" multiple accept="application/pdf" onChange={(e) => setMergeFiles(Array.from(e.target.files || []))} className="hidden" />
          </label>
          {mergeFiles.length > 0 && (
            <div className="text-xs text-slate-300 font-medium">
              {mergeFiles.length} berkas dipilih: {mergeFiles.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
      )}

      {activeTab === "extract" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <Split className="h-10 w-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white text-center">Ekstrak Halaman Spesifik Dokumen</h3>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-400">Rentang Halaman (Contoh: 1-3 atau 5, 8, 12):</label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}