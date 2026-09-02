"use client";

import { useState, useRef } from "react";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  FileCheck
} from "lucide-react";

interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

// Generate simple valid standard PDF format with embedded JPEG images in raw bytes
async function buildPdfFromImages(
  items: ImageFileItem[],
  orientation: "portrait" | "landscape",
  pageSize: "a4" | "fit"
): Promise<Blob> {
  // We will build a multi-page PDF using canvas to draw images and build PDF structure
  // Standard A4 dimensions in points (72 DPI): 595.28 x 841.89
  const a4Width = orientation === "portrait" ? 595.28 : 841.89;
  const a4Height = orientation === "portrait" ? 841.89 : 595.28;

  // Let us build the PDF stream objects
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  // 1: Catalog
  // 2: Pages
  // Pages will be added starting object 3

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Draw on temporary canvas to get clean JPEG bytes
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = item.previewUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);

    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64Data = jpegDataUrl.split(",")[1];
    const binaryData = atob(base64Data);

    const pWidth = pageSize === "a4" ? a4Width : img.width * 0.75;
    const pHeight = pageSize === "a4" ? a4Height : img.height * 0.75;

    // Calculate scale to fit page maintaining aspect ratio
    const scale = Math.min(pWidth / img.width, pHeight / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const drawX = (pWidth - drawWidth) / 2;
    const drawY = (pHeight - drawHeight) / 2;

    const pageObjId = 3 + i * 3;
    const contentObjId = pageObjId + 1;
    const imageObjId = pageObjId + 2;

    pageObjectIds.push(pageObjId);

    // Image XObject
    const imageObj = `${imageObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binaryData.length} >>\nstream\n${binaryData}\nendstream\nendobj`;

    // Content stream: place image
    const contentStream = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm\n/Im${i + 1} Do\nQ`;
    const contentObj = `${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`;

    // Page Object
    const pageObj = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pWidth.toFixed(2)} ${pHeight.toFixed(2)}] /Contents ${contentObjId} 0 R /Resources << /XObject << /Im${i + 1} ${imageObjId} 0 R >> >> >>\nendobj`;

    objects.push(pageObj, contentObj, imageObj);
  }

  // Object 1: Catalog
  const catalogObj = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;
  // Object 2: Pages root
  const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>\nendobj`;

  const allObjs = [catalogObj, pagesObj, ...objects];

  // Assemble full PDF with xref table
  let pdf = `%PDF-1.4\n`;
  const xrefs = [0];

  for (const obj of allObjs) {
    xrefs.push(pdf.length);
    pdf += `${obj}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${xrefs.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < xrefs.length; i++) {
    pdf += `${String(xrefs[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${xrefs.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  // Convert string to uint8 array to preserve binary image bytes
  const buf = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    buf[i] = pdf.charCodeAt(i) & 0xff;
  }

  return new Blob([buf], { type: "application/pdf" });
}

export function ImageToPdfTool() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"a4" | "fit">("a4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (files: FileList) => {
    const newItems: ImageFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.width, h: img.height });
          img.src = url;
        });

        newItems.push({
          id: `img-${Date.now()}-${i}`,
          file,
          previewUrl: url,
          width: dimensions.w,
          height: dimensions.h,
        });
      }
    }
    setImages((prev) => [...prev, ...newItems]);
    setGeneratedPdfUrl(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = temp;
    setImages(newImages);
    setGeneratedPdfUrl(null);
  };

  const removeItem = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setGeneratedPdfUrl(null);
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const pdfBlob = await buildPdfFromImages(images, orientation, pageSize);
      const url = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(url);
    } catch {
      alert("Gagal merangkai PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedPdfUrl) return;
    const a = document.createElement("a");
    a.href = generatedPdfUrl;
    a.download = `Leonore-Dokumen-${Date.now()}.pdf`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files);
        }}
        className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/60 p-8 text-center hover:border-pink-500/50 hover:bg-slate-900/90 transition-all shadow-xl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mx-auto mb-3 border border-pink-500/30">
          <Upload className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Pilih atau Tarik Beberapa File Gambar
        </h3>
        <p className="text-xs text-slate-400">
          Gabungkan multiple gambar (JPG, PNG, WebP) menjadi satu berkas PDF siap cetak.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Settings & Generate */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Pengaturan PDF</span>
              <span className="text-xs font-mono font-normal text-slate-400">{images.length} Halaman</span>
            </h3>

            {/* Page Size */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Ukuran Kertas:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageSize("a4")}
                  className={`rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                    pageSize === "a4"
                      ? "border-pink-500 bg-pink-950/30 text-white ring-1 ring-pink-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Standar A4
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize("fit")}
                  className={`rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                    pageSize === "fit"
                      ? "border-pink-500 bg-pink-950/30 text-white ring-1 ring-pink-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Sesuai Ukuran Gambar
                </button>
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Orientasi Halaman:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation("portrait")}
                  className={`rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                    orientation === "portrait"
                      ? "border-pink-500 bg-pink-950/30 text-white ring-1 ring-pink-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Tegak (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("landscape")}
                  className={`rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                    orientation === "landscape"
                      ? "border-pink-500 bg-pink-950/30 text-white ring-1 ring-pink-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  Mendatar (Landscape)
                </button>
              </div>
            </div>

            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-pink-600 p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <FileCheck className="h-4 w-4" />
              <span>{isGenerating ? "Menyusun PDF..." : "Buat Dokumen PDF"}</span>
            </button>

            {generatedPdfUrl && (
              <button
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all animate-in fade-in"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Berkas PDF Sekarang</span>
              </button>
            )}
          </div>

          {/* Image List & Reordering */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Urutan Halaman Gambar
            </h3>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-950 p-3 border border-slate-800 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <img
                      src={item.previewUrl}
                      alt="Thumbnail"
                      className="h-12 w-12 object-cover rounded-xl border border-slate-800 shrink-0"
                    />
                    <div className="truncate max-w-[160px] sm:max-w-xs">
                      <div className="text-xs font-semibold text-slate-200 truncate">{item.file.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.width} × {item.height} px
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, "up")}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      title="Pindah ke Atas"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveItem(idx, "down")}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                      title="Pindah ke Bawah"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400"
                      title="Hapus Halaman"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}