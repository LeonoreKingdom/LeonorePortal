"use client";

import { useState } from "react";
import { 
  Upload, 
  Download, 
  FileText, 
  Split, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Copy,
  Check,
  FileType,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export function PdfToolkitTool() {
  const [activeTab, setActiveTab] = useState<"pdf-to-docx" | "docx-to-pdf" | "merge" | "extract">("pdf-to-docx");

  // PDF to DOCX State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [docxBlobUrl, setDocxBlobUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);

  // DOCX / Text to PDF State
  const [inputText, setInputText] = useState<string>(
    "Judul Dokumen\n\nIni adalah contoh isi paragraf dokumen yang akan dikonversi menjadi berkas PDF standar.\n\n- Poin 1: Keamanan 100% lokal di browser\n- Poin 2: Tanpa perantara server luar\n- Poin 3: Format siap cetak"
  );
  const [isCompilingPdf, setIsCompilingPdf] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

  // Extract State
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [extractTotalPages, setExtractTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>("1");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedBlobUrl, setExtractedBlobUrl] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Helper to load PDF.js dynamically in browser
  const loadPdfJs = async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(lib);
        } else {
          reject(new Error("pdfjsLib tidak ditemukan setelah skrip dimuat."));
        }
      };
      script.onerror = () => reject(new Error("Gagal mengunduh modul PDF.js."));
      document.head.appendChild(script);
    });
  };

  // Generate valid Word DOCX binary blob using docx library
  const generateValidDocx = async (title: string, content: string): Promise<Blob> => {
    const paragraphs: Paragraph[] = [];

    // Title paragraph
    paragraphs.push(
      new Paragraph({
        text: title.replace(/\.pdf$/i, ""),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240, before: 100 },
      })
    );

    // Split text into paragraphs
    const rawParagraphs = content.split(/\n\s*\n/);

    for (const rawPara of rawParagraphs) {
      const trimmed = rawPara.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("--- Halaman") || trimmed.startsWith("=== Halaman")) {
        paragraphs.push(
          new Paragraph({
            text: trimmed,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          })
        );
      } else {
        const lines = trimmed.split("\n");
        const children: TextRun[] = [];

        lines.forEach((line, idx) => {
          children.push(
            new TextRun({
              text: line.trim(),
              size: 24, // 12pt
              font: "Calibri",
            })
          );
          if (idx < lines.length - 1) {
            children.push(new TextRun({ break: 1 }));
          }
        });

        paragraphs.push(
          new Paragraph({
            children,
            spacing: { after: 160, line: 280 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch (1440 dxa)
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    return await Packer.toBlob(doc);
  };

  // Handle PDF upload and extraction
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (docxBlobUrl) {
      URL.revokeObjectURL(docxBlobUrl);
      setDocxBlobUrl(null);
    }

    setPdfFile(file);
    setIsProcessing(true);
    setProcessStatus("Memuat dokumen dan mesin pembaca PDF...");

    try {
      const buffer = await file.arrayBuffer();
      let extractedPages: string[] = [];
      let totalPages = 1;

      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;
        setPdfPageCount(totalPages);

        for (let i = 1; i <= totalPages; i++) {
          setProcessStatus(`Mengekstrak teks halaman ${i} dari ${totalPages}...`);
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          
          let pageText = "";
          let lastY: number | null = null;

          for (const item of textContent.items as any[]) {
            const currentY = item.transform ? item.transform[5] : 0;
            if (lastY !== null && Math.abs(currentY - lastY) > 5) {
              pageText += "\n" + item.str;
            } else {
              pageText += (pageText ? " " : "") + item.str;
            }
            lastY = currentY;
          }

          if (pageText.trim()) {
            extractedPages.push(`--- Halaman ${i} ---\n` + pageText.trim());
          }
        }
      } catch (pdfErr) {
        console.warn("PDF.js extractor fallback:", pdfErr);
        // Fallback simple stream regex
        const textDecoded = new TextDecoder("latin1").decode(new Uint8Array(buffer));
        const streamMatches = textDecoded.match(/\((.*?)\)\s*Tj/g) || [];
        const cleanText = streamMatches
          .map((s) => s.replace(/^\(|\)\s*Tj$/g, ""))
          .join(" ")
          .replace(/\\(\d{3})/g, "")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")");

        if (cleanText.trim()) {
          extractedPages.push(cleanText.trim());
        }
      }

      let finalText = extractedPages.join("\n\n");
      if (!finalText.trim()) {
        finalText = `Dokumen: ${file.name}\nUkuran: ${(file.size / 1024).toFixed(1)} KB\n\n(Catatan: Berkas PDF ini kemungkinan berupa hasil scan gambar/foto atau menggunakan proteksi enkripsi teks khusus. Anda dapat mengetik atau mengedit teks tambahan di bawah ini sebelum membuat berkas Word DOCX.)`;
      }

      setExtractedContent(finalText);
      setProcessStatus("Menyusun berkas Word DOCX berstandar OpenXML...");

      // Generate valid binary DOCX
      const docxBlob = await generateValidDocx(file.name, finalText);
      setDocxBlobUrl(URL.createObjectURL(docxBlob));
    } catch (err: any) {
      console.error("Gagal mengekstrak PDF:", err);
      setExtractedContent(`Terjadi kesalahan saat memproses PDF: ${err.message || "Format tidak didukung"}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  // Re-generate DOCX when user edits the text
  const handleRegenerateDocx = async () => {
    if (!extractedContent.trim() || !pdfFile) return;
    setIsProcessing(true);
    setProcessStatus("Memperbarui dokumen Word DOCX...");
    try {
      if (docxBlobUrl) URL.revokeObjectURL(docxBlobUrl);
      const docxBlob = await generateValidDocx(pdfFile.name, extractedContent);
      setDocxBlobUrl(URL.createObjectURL(docxBlob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  // Copy extracted text
  const handleCopyText = () => {
    if (!extractedContent) return;
    navigator.clipboard.writeText(extractedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert text / markdown to PDF using pdf-lib
  const handleConvertTextToPdf = async () => {
    if (!inputText.trim()) return;
    setIsCompilingPdf(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 11;
      const lineHeight = 16;
      const margin = 50;
      const pageWidth = 595.28; // A4 Width
      const pageHeight = 841.89; // A4 Height
      const printableWidth = pageWidth - margin * 2;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // Document Title Header
      page.drawText("Dokumen Hasil Kompilasi", {
        x: margin,
        y: y,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.25),
      });
      y -= 28;

      const lines = inputText.split("\n");
      for (const rawLine of lines) {
        if (!rawLine.trim()) {
          y -= lineHeight * 0.8;
          continue;
        }

        const isHeading = rawLine.startsWith("#") || rawLine.toUpperCase() === rawLine && rawLine.length < 40;
        const currentFont = isHeading ? boldFont : font;
        const currentSize = isHeading ? 13 : fontSize;
        const currentLineHeight = isHeading ? 20 : lineHeight;
        const cleanedText = rawLine.replace(/^#+\s*/, "");

        // Word wrap
        const words = cleanedText.split(" ");
        let lineBuffer = "";

        for (const word of words) {
          const testLine = lineBuffer ? `${lineBuffer} ${word}` : word;
          const textWidth = currentFont.widthOfTextAtSize(testLine, currentSize);

          if (textWidth > printableWidth && lineBuffer) {
            if (y < margin + currentLineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawText(lineBuffer, {
              x: margin,
              y,
              size: currentSize,
              font: currentFont,
              color: rgb(0.12, 0.12, 0.15),
            });
            y -= currentLineHeight;
            lineBuffer = word;
          } else {
            lineBuffer = testLine;
          }
        }

        if (lineBuffer) {
          if (y < margin + currentLineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(lineBuffer, {
            x: margin,
            y,
            size: currentSize,
            font: currentFont,
            color: rgb(0.12, 0.12, 0.15),
          });
          y -= currentLineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Gagal menyusun PDF:", err);
    } finally {
      setIsCompilingPdf(false);
    }
  };

  // Merge Multiple PDFs using pdf-lib
  const handleMergePdfs = async () => {
    if (mergeFiles.length < 2) return;
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as any], { type: "application/pdf" });
      if (mergedBlobUrl) URL.revokeObjectURL(mergedBlobUrl);
      setMergedBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Gagal menggabungkan PDF:", err);
    } finally {
      setIsMerging(false);
    }
  };

  // Extract / Split Specific Pages using pdf-lib
  const handleExtractPages = async () => {
    if (!extractFile) return;
    setIsExtracting(true);
    setExtractError(null);

    try {
      const arrayBuffer = await extractFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = srcDoc.getPageCount();

      const targetIndices = new Set<number>();
      const parts = pageRange.split(",");

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
          const [startStr, endStr] = trimmed.split("-");
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
              if (p >= 1 && p <= totalPages) {
                targetIndices.add(p - 1);
              }
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            targetIndices.add(p - 1);
          }
        }
      }

      if (targetIndices.size === 0) {
        throw new Error(`Tidak ada halaman valid dalam rentang. Berkas memiliki ${totalPages} halaman.`);
      }

      const sortedIndices = Array.from(targetIndices).sort((a, b) => a - b);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, sortedIndices);
      pages.forEach((p) => newDoc.addPage(p));

      const extractedBytes = await newDoc.save();
      const blob = new Blob([extractedBytes as any], { type: "application/pdf" });
      if (extractedBlobUrl) URL.revokeObjectURL(extractedBlobUrl);
      setExtractedBlobUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error("Gagal mengekstrak halaman PDF:", err);
      setExtractError(err.message || "Gagal mengekstrak halaman.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-2xl mx-auto shadow-lg">
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
          <span>Teks ke PDF</span>
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

      {/* Tab 1: PDF to DOCX */}
      {activeTab === "pdf-to-docx" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileType className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Konversi PDF ke Microsoft Word DOCX Standar</h3>
                <p className="text-[11px] text-slate-400">Menghasilkan berkas Word .docx biner OpenXML asli yang dapat dibuka tanpa error di Microsoft Word</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> 100% Client-side
            </span>
          </div>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl bg-slate-950/60 cursor-pointer transition-all group">
            <Upload className="h-10 w-10 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
            <span className="text-xs font-semibold text-slate-200">
              {pdfFile ? pdfFile.name : "Klik atau seret file PDF ke sini"}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">Ekstraksi teks penuh & penyusunan struktur dokumen Word (.docx)</span>
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
          </label>

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>{processStatus || "Sedang memproses dokumen..."}</span>
            </div>
          )}

          {extractedContent && !isProcessing && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span>Pratinjau & Edit Konten Teks</span>
                  {pdfPageCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-normal text-slate-400">
                      {pdfPageCount} Halaman
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Disalin!" : "Salin Teks"}</span>
                  </button>
                  <button
                    onClick={handleRegenerateDocx}
                    title="Perbarui berkas DOCX dari teks yang telah diedit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs border border-indigo-500/30 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Perbarui DOCX</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={extractedContent}
                onChange={(e) => setExtractedContent(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50 leading-relaxed"
                placeholder="Konten teks hasil ekstraksi..."
              />

              {docxBlobUrl && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Dokumen Word (.docx) Valid Siap Diunduh</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Berkas ini dikemas sebagai arsip OpenXML berstandar internasional sehingga kompatibel penuh dan dapat langsung dibuka di Microsoft Word tanpa pesan peringatan rusak/unreadable.
                  </p>
                  <a
                    href={docxBlobUrl}
                    download={`${pdfFile?.name.replace(/\.pdf$/i, "") || "dokumen"}.docx`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Dokumen Word (.docx)</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Text / DOCX to PDF */}
      {activeTab === "docx-to-pdf" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Konversi Teks ke Dokumen PDF Standar</h3>
              <p className="text-[11px] text-slate-400">Kompilasi paragraf dan teks langsung menjadi berkas PDF A4 siap cetak</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Isi Konten Dokumen / Paragraf:</label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 leading-relaxed font-mono"
            />
          </div>

          <button
            onClick={handleConvertTextToPdf}
            disabled={isCompilingPdf}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isCompilingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Kompilasi ke Berkas PDF A4</span>
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Berkas PDF (.pdf)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Merge PDF */}
      {activeTab === "merge" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Gabungkan Beberapa Berkas PDF (Merge)</h3>
              <p className="text-[11px] text-slate-400">Satukan banyak dokumen PDF menjadi satu kesatuan dokumen utuh</p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-750 hover:border-indigo-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
            <Upload className="h-8 w-8 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Pilih Berkas PDF (Dapat Memilih Banyak)</span>
            <span className="text-[11px] text-slate-500 mt-1">Pilih minimal 2 file untuk digabungkan</span>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setMergeFiles(files);
                if (mergedBlobUrl) {
                  URL.revokeObjectURL(mergedBlobUrl);
                  setMergedBlobUrl(null);
                }
              }}
              className="hidden"
            />
          </label>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Daftar Dokumen yang Akan Digabung ({mergeFiles.length}):</span>
                <button
                  onClick={() => setMergeFiles([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Bersihkan
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mergeFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="font-medium text-slate-300 truncate max-w-sm">{idx + 1}. {f.name}</span>
                    <span className="text-[11px] text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleMergePdfs}
                disabled={isMerging || mergeFiles.length < 2}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                <span>Gabungkan {mergeFiles.length} Berkas PDF</span>
              </button>

              {mergedBlobUrl && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Penggabungan Berhasil!</span>
                  </div>
                  <a
                    href={mergedBlobUrl}
                    download="dokumen-tergabung.pdf"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Berkas PDF Hasil Gabung</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Extract Pages */}
      {activeTab === "extract" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Split className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Ekstrak Halaman Spesifik Dokumen (Split)</h3>
              <p className="text-[11px] text-slate-400">Ambil dan pisahkan halaman tertentu menjadi file PDF baru</p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-750 hover:border-indigo-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
            <Upload className="h-8 w-8 text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">
              {extractFile ? extractFile.name : "Pilih Berkas PDF yang Akan Diekstrak"}
            </span>
            {extractTotalPages > 0 && (
              <span className="text-[11px] text-indigo-400 mt-1">Total {extractTotalPages} Halaman Terdeteksi</span>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setExtractFile(f);
                if (extractedBlobUrl) {
                  URL.revokeObjectURL(extractedBlobUrl);
                  setExtractedBlobUrl(null);
                }
                try {
                  const buf = await f.arrayBuffer();
                  const doc = await PDFDocument.load(buf);
                  setExtractTotalPages(doc.getPageCount());
                  setPageRange(`1-${Math.min(3, doc.getPageCount())}`);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="hidden"
            />
          </label>

          {extractFile && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Rentang Halaman (Contoh: 1-3 atau 1, 4, 6):
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="Contoh: 1-3, 5"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan nomor halaman dari 1 sampai {extractTotalPages}.
                </p>
              </div>

              {extractError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <span>{extractError}</span>
                </div>
              )}

              <button
                onClick={handleExtractPages}
                disabled={isExtracting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Split className="h-4 w-4" />}
                <span>Ekstrak Halaman Terpilih</span>
              </button>

              {extractedBlobUrl && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Halaman Berhasil Diekstrak!</span>
                  </div>
                  <a
                    href={extractedBlobUrl}
                    download={`ekstrak-${extractFile.name}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Berkas PDF Hasil Ekstraksi</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}