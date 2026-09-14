"use client";

import { useState, useRef, useEffect, useMemo, ChangeEvent } from "react";
import { 
  Scissors, 
  Upload, 
  Download, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Grid3X3, 
  Layers, 
  Check, 
  Eye, 
  Trash2, 
  Smartphone, 
  FolderArchive,
  RefreshCw
} from "lucide-react";

interface BoundingBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
}

interface SlicedSticker {
  id: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

// Lightweight client-side pure JS ZIP generator (PKZip Store format)
function createZip(files: { name: string; data: Uint8Array }[]): Blob {
  let fileHeaders: Uint8Array[] = [];
  let centralDirs: Uint8Array[] = [];
  let offset = 0;

  const textEncoder = new TextEncoder();

  for (const file of files) {
    const nameBytes = textEncoder.encode(file.name);
    const date = new Date();
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

    // CRC32 calculation
    let crc = 0 ^ (-1);
    for (let i = 0; i < file.data.length; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ file.data[i]) & 0xff];
    }
    crc = (crc ^ (-1)) >>> 0;

    // Local file header (30 bytes + name + data)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local header signature
    lv.setUint16(4, 20, true); // Version needed
    lv.setUint16(6, 0, true); // General purpose bit flag
    lv.setUint16(8, 0, true); // Compression method (0 = Store)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, file.data.length, true); // Compressed size
    lv.setUint32(22, file.data.length, true); // Uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    fileHeaders.push(localHeader, file.data);

    // Central directory header (46 bytes + name)
    const cdHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0, true); // Flags
    cv.setUint16(10, 0, true); // Compression
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // Extra length
    cv.setUint16(32, 0, true); // Comment length
    cv.setUint16(34, 0, true); // Disk start
    cv.setUint16(36, 0, true); // Internal attributes
    cv.setUint32(38, 0, true); // External attributes
    cv.setUint32(42, offset, true); // Relative offset
    cdHeader.set(nameBytes, 46);

    centralDirs.push(cdHeader);
    offset += localHeader.length + file.data.length;
  }

  const centralDirSize = centralDirs.reduce((acc, b) => acc + b.length, 0);

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true); // Disk number
  ev.setUint16(6, 0, true); // Disk where CD starts
  ev.setUint16(8, files.length, true); // Records on disk
  ev.setUint16(10, files.length, true); // Total records
  ev.setUint32(12, centralDirSize, true); // Size of CD
  ev.setUint32(16, offset, true); // Offset of CD
  const totalLength = offset + centralDirSize + 22;
  const mergedZip = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of [...fileHeaders, ...centralDirs, eocd]) {
    mergedZip.set(part, pos);
    pos += part.length;
  }

  return new Blob([mergedZip.buffer as ArrayBuffer], { type: "application/zip" });
}

// Precomputed CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}

export function StickerCutterTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [mode, setMode] = useState<"smart" | "grid">("smart");

  // Detection Parameters
  const [bgColor, setBgColor] = useState<string>("#000000");
  const [tolerance, setTolerance] = useState<number>(30);
  const [mergeDistance, setMergeDistance] = useState<number>(24); // Merge proximity for floating text/hearts
  const [padding, setPadding] = useState<number>(8);
  const [minSize, setMinSize] = useState<number>(50);

  // Grid Parameters
  const [gridCols, setGridCols] = useState<number>(4);
  const [gridRows, setGridRows] = useState<number>(4);

  // Processing Options
  const [makeTransparent, setMakeTransparent] = useState<boolean>(true);
  const [exportPreset, setExportPreset] = useState<"original" | "whatsapp" | "telegram">("whatsapp");

  // Results
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [slicedStickers, setSlicedStickers] = useState<SlicedSticker[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load a demo sticker sheet on mount
  useEffect(() => {
    loadDemoSheet();
  }, []);

  const loadDemoSheet = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Solid Black Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 800, 800);

    const emojis = [
      { text: "Good morning!", icon: "🌸", col: 0, row: 0 },
      { text: "Whattt?", icon: "😲", col: 1, row: 0 },
      { text: "Huh?", icon: "🤔", col: 2, row: 0 },
      { text: "Reminding you!", icon: "☝️", col: 3, row: 0 },
      { text: "So sleepy", icon: "😴", col: 0, row: 1 },
      { text: "Wow!", icon: "✨", col: 1, row: 1 },
      { text: "Approved!", icon: "👍", col: 2, row: 1 },
      { text: "Nice!", icon: "🥰", col: 3, row: 1 },
      { text: "Hey you!", icon: "👋", col: 0, row: 2 },
      { text: "Achoo!", icon: "🤧", col: 1, row: 2 },
      { text: "Angry!", icon: "💢", col: 2, row: 2 },
      { text: "Good night :3", icon: "🌙", col: 3, row: 2 },
      { text: "Too cuteee", icon: "💖", col: 0, row: 3 },
      { text: "Cool yet?!", icon: "😎", col: 1, row: 3 },
      { text: "Wink", icon: "😉", col: 2, row: 3 },
      { text: "Ehehe", icon: "🤭", col: 3, row: 3 },
    ];

    emojis.forEach((item) => {
      const cx = item.col * 200 + 100;
      const cy = item.row * 200 + 100;

      // Draw white sticker die-cut border background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy - 65, 130, 130, 32);
      ctx.fill();

      // Draw chibi illustration inner circle
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 42, 0, Math.PI * 2);
      ctx.fill();

      // Emoji character
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.icon, cx, cy - 10);

      // Sticker text label with white outline
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#e11d48";
      ctx.fillText(item.text, cx, cy + 45);
    });

    const dataUrl = canvas.toDataURL("image/png");
    setImageSrc(dataUrl);
    setImgDimensions({ w: 800, h: 800 });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        setImageSrc(url);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Auto-detect background color from corners
  const sampleCornerColor = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const p1 = ctx.getImageData(2, 2, 1, 1).data;
    const p2 = ctx.getImageData(w - 3, 2, 1, 1).data;
    const p3 = ctx.getImageData(2, h - 3, 1, 1).data;
    const p4 = ctx.getImageData(w - 3, h - 3, 1, 1).data;

    // Average corners
    const r = Math.round((p1[0] + p2[0] + p3[0] + p4[0]) / 4);
    const g = Math.round((p1[1] + p2[1] + p3[1] + p4[1]) / 4);
    const b = Math.round((p1[2] + p2[2] + p3[2] + p4[2]) / 4);
    const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
    setBgColor(hex);
    return { r, g, b };
  };

  // Run Auto-Detect or Grid Slicing
  const detectStickers = () => {
    if (!imageSrc || !imgDimensions.w || !imgDimensions.h) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      if (mode === "grid") {
        // Grid Slicing mode
        const cellW = Math.floor(w / gridCols);
        const cellH = Math.floor(h / gridRows);
        const newBoxes: BoundingBox[] = [];
        let idCounter = 1;

        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const bx = Math.max(0, c * cellW + padding);
            const by = Math.max(0, r * cellH + padding);
            const bw = Math.min(w - bx, cellW - padding * 2);
            const bh = Math.min(h - by, cellH - padding * 2);
            if (bw > 10 && bh > 10) {
              newBoxes.push({ id: idCounter++, x: bx, y: by, w: bw, h: bh, selected: true });
            }
          }
        }
        setBoxes(newBoxes);
        sliceAllBoxes(img, newBoxes);
        setIsProcessing(false);
        return;
      }

      // Smart Auto-Detect Blob mode
      // Downsample for instant scanning
      const scale = Math.min(1, 800 / Math.max(w, h));
      const sw = Math.round(w * scale);
      const sh = Math.round(h * scale);

      const scanCanvas = document.createElement("canvas");
      scanCanvas.width = sw;
      scanCanvas.height = sh;
      const sCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
      if (!sCtx) {
        setIsProcessing(false);
        return;
      }

      sCtx.drawImage(img, 0, 0, sw, sh);
      const bg = sampleCornerColor(sCtx, sw, sh);
      const sData = sCtx.getImageData(0, 0, sw, sh).data;

      // 1. Create binary foreground mask
      const mask = new Uint8Array(sw * sh);
      for (let i = 0; i < sData.length; i += 4) {
        const r = sData[i];
        const g = sData[i + 1];
        const b = sData[i + 2];
        const a = sData[i + 3];

        if (a < 20) {
          mask[i / 4] = 0; // transparent is background
          continue;
        }

        const diff = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
        mask[i / 4] = diff > tolerance * 3 ? 1 : 0;
      }

      // 2. Connected Component Labeling on downsampled mask
      const visited = new Uint8Array(sw * sh);
      const rawBlobs: { minX: number; minY: number; maxX: number; maxY: number; count: number }[] = [];

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = y * sw + x;
          if (mask[idx] === 1 && visited[idx] === 0) {
            let minX = x;
            let maxX = x;
            let minY = y;
            let maxY = y;
            let count = 0;

            const queue = [x, y];
            visited[idx] = 1;

            while (queue.length > 0) {
              const qy = queue.pop()!;
              const qx = queue.pop()!;
              count++;

              if (qx < minX) minX = qx;
              if (qx > maxX) maxX = qx;
              if (qy < minY) minY = qy;
              if (qy > maxY) maxY = qy;

              const neighbors = [
                [qx + 1, qy],
                [qx - 1, qy],
                [qx, qy + 1],
                [qx, qy - 1],
              ];

              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
                  const nIdx = ny * sw + nx;
                  if (mask[nIdx] === 1 && visited[nIdx] === 0) {
                    visited[nIdx] = 1;
                    queue.push(nx, ny);
                  }
                }
              }
            }

            if (count > 25) {
              rawBlobs.push({ minX, minY, maxX, maxY, count });
            }
          }
        }
      }

      // 3. Proximity Merge: Combine text & hearts that belong to the same sticker
      const scaledMergeDist = mergeDistance * scale;
      let merged = [...rawBlobs];
      let changed = true;

      while (changed) {
        changed = false;
        for (let i = 0; i < merged.length; i++) {
          for (let j = i + 1; j < merged.length; j++) {
            const b1 = merged[i];
            const b2 = merged[j];

            const gapX = Math.max(0, Math.max(b1.minX, b2.minX) - Math.min(b1.maxX, b2.maxX));
            const gapY = Math.max(0, Math.max(b1.minY, b2.minY) - Math.min(b1.maxY, b2.maxY));

            if (gapX <= scaledMergeDist && gapY <= scaledMergeDist) {
              b1.minX = Math.min(b1.minX, b2.minX);
              b1.minY = Math.min(b1.minY, b2.minY);
              b1.maxX = Math.max(b1.maxX, b2.maxX);
              b1.maxY = Math.max(b1.maxY, b2.maxY);
              b1.count += b2.count;
              merged.splice(j, 1);
              changed = true;
              break;
            }
          }
          if (changed) break;
        }
      }

      // 4. Scale back to original dimensions and apply padding & min size filter
      const detectedBoxes: BoundingBox[] = [];
      let idCounter = 1;

      merged.forEach((b) => {
        const origMinX = Math.max(0, Math.round(b.minX / scale) - padding);
        const origMinY = Math.max(0, Math.round(b.minY / scale) - padding);
        const origMaxX = Math.min(w, Math.round(b.maxX / scale) + padding);
        const origMaxY = Math.min(h, Math.round(b.maxY / scale) + padding);

        const bw = origMaxX - origMinX;
        const bh = origMaxY - origMinY;

        if (bw >= minSize && bh >= minSize) {
          detectedBoxes.push({
            id: idCounter++,
            x: origMinX,
            y: origMinY,
            w: bw,
            h: bh,
            selected: true,
          });
        }
      });

      // Sort boxes top-to-bottom, left-to-right
      detectedBoxes.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 40) return a.y - b.y;
        return a.x - b.x;
      });
      // Re-index
      detectedBoxes.forEach((b, idx) => (b.id = idx + 1));

      setBoxes(detectedBoxes);
      sliceAllBoxes(img, detectedBoxes);
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  // Slice individual sticker and perform outer flood-fill transparency
  const sliceAllBoxes = async (img: HTMLImageElement, targetBoxes: BoundingBox[]) => {
    const results: SlicedSticker[] = [];
    const hexToRgb = (hex: string) => {
      const num = parseInt(hex.replace("#", ""), 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };
    const bgRgb = hexToRgb(bgColor);

    for (const box of targetBoxes) {
      if (!box.selected) continue;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = box.w;
      cropCanvas.height = box.h;
      const cCtx = cropCanvas.getContext("2d", { willReadFrequently: true });
      if (!cCtx) continue;

      // Draw cropped slice
      cCtx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

      // If user enabled transparency, run outer border flood fill
      if (makeTransparent) {
        const imgData = cCtx.getImageData(0, 0, box.w, box.h);
        const data = imgData.data;
        const visited = new Uint8Array(box.w * box.h);
        const queue: number[] = [];

        // Push border pixels
        for (let x = 0; x < box.w; x++) {
          queue.push(x, 0);
          queue.push(x, box.h - 1);
        }
        for (let y = 0; y < box.h; y++) {
          queue.push(0, y);
          queue.push(box.w - 1, y);
        }

        const tol = tolerance * 3;

        while (queue.length > 0) {
          const qy = queue.pop()!;
          const qx = queue.pop()!;
          const idx = qy * box.w + qx;

          if (visited[idx]) continue;
          visited[idx] = 1;

          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const a = data[pIdx + 3];

          if (a === 0) continue;

          const diff = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);

          if (diff <= tol) {
            data[pIdx + 3] = 0; // Make transparent!

            // Add 4 neighbors
            if (qx + 1 < box.w && !visited[qy * box.w + (qx + 1)]) queue.push(qx + 1, qy);
            if (qx - 1 >= 0 && !visited[qy * box.w + (qx - 1)]) queue.push(qx - 1, qy);
            if (qy + 1 < box.h && !visited[(qy + 1) * box.w + qx]) queue.push(qx, qy + 1);
            if (qy - 1 >= 0 && !visited[(qy - 1) * box.w + qx]) queue.push(qx, qy - 1);
          }
        }
        cCtx.putImageData(imgData, 0, 0);
      }

      // Final output canvas (WhatsApp 512x512 / Telegram / Original)
      let finalCanvas = cropCanvas;
      if (exportPreset === "whatsapp" || exportPreset === "telegram") {
        finalCanvas = document.createElement("canvas");
        finalCanvas.width = 512;
        finalCanvas.height = 512;
        const fCtx = finalCanvas.getContext("2d");
        if (fCtx) {
          // Fit with preserved aspect ratio inside 512x512 with 16px safety padding
          const maxDim = 512 - 32;
          const scale = Math.min(maxDim / box.w, maxDim / box.h);
          const dw = Math.round(box.w * scale);
          const dh = Math.round(box.h * scale);
          const dx = Math.round((512 - dw) / 2);
          const dy = Math.round((512 - dh) / 2);

          fCtx.drawImage(cropCanvas, 0, 0, box.w, box.h, dx, dy, dw, dh);
        }
      }

      const mime = exportPreset === "whatsapp" ? "image/webp" : "image/png";
      const blob = await new Promise<Blob>((resolve) => {
        finalCanvas.toBlob((b) => resolve(b || new Blob()), mime, 0.95);
      });
      const dataUrl = finalCanvas.toDataURL(mime, 0.95);

      results.push({
        id: box.id,
        dataUrl,
        blob,
        width: finalCanvas.width,
        height: finalCanvas.height,
      });
    }

    setSlicedStickers(results);
  };

  // Re-detect on image change
  useEffect(() => {
    if (imageSrc) {
      detectStickers();
    }
  }, [imageSrc, mode, tolerance, mergeDistance, padding, minSize, gridCols, gridRows, makeTransparent, exportPreset]);

  // Toggle single box selection
  const toggleBox = (id: number) => {
    const updated = boxes.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b));
    setBoxes(updated);
    if (imgRef.current) {
      sliceAllBoxes(imgRef.current, updated);
    }
  };

  // Download single sticker
  const downloadSingle = (stk: SlicedSticker) => {
    const ext = exportPreset === "whatsapp" ? "webp" : "png";
    const a = document.createElement("a");
    a.href = stk.dataUrl;
    a.download = `sticker_${stk.id}.${ext}`;
    a.click();
  };

  // Download all as ZIP
  const downloadAllZip = async () => {
    if (slicedStickers.length === 0) return;
    setDownloadingZip(true);

    try {
      const ext = exportPreset === "whatsapp" ? "webp" : "png";
      const files: { name: string; data: Uint8Array }[] = [];

      for (const stk of slicedStickers) {
        const arrayBuf = await stk.blob.arrayBuffer();
        files.push({
          name: `sticker_${stk.id.toString().padStart(2, "0")}.${ext}`,
          data: new Uint8Array(arrayBuf),
        });
      }

      const zipBlob = createZip(files);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stickers_pack_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal membuat zip", err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <img ref={imgRef} src={imageSrc || ""} alt="" className="hidden" />

      {/* Header card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sticker Pack Auto-Cutter & Slicer</h2>
              <p className="text-xs text-slate-400">Potong otomatis lembar stiker pack menjadi stiker transparan individual siap pakai untuk WhatsApp & Telegram</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDemoSheet}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Contoh Stiker Sheet
            </button>
            <label className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md">
              <Upload className="h-3.5 w-3.5" />
              <span>Unggah Lembar Stiker</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setMode("smart")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "smart"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deteksi Kontur Otomatis (Smart Blob)</span>
            </button>
            <button
              onClick={() => setMode("grid")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "grid"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span>Mode Grid Slicer (Kolom × Baris)</span>
            </button>
          </div>

          {/* Export Preset Selection */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Format Output:</span>
            <select
              value={exportPreset}
              onChange={(e) => setExportPreset(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 focus:outline-none"
            >
              <option value="whatsapp">WhatsApp Sticker (512×512 WebP)</option>
              <option value="telegram">Telegram / Discord (512×512 PNG)</option>
              <option value="original">Resolusi Asli (PNG Bounding Box)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Sliders Panel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-pink-400" />
            Pengaturan Parameter Pemotongan ({mode === "smart" ? "Mode Otomatis" : "Mode Grid"})
          </span>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={makeTransparent}
              onChange={(e) => setMakeTransparent(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            Transparankan Background Luar (Flood-Fill)
          </label>
        </div>

        {mode === "smart" ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Background Color Picker */}
            <div>
              <label className="text-slate-400 block mb-1">Warna Background Sheet</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-12 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="font-mono text-white font-bold">{bgColor}</span>
              </div>
            </div>

            {/* Tolerance */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Toleransi Warna</span>
                <span className="font-mono text-white">{tolerance}</span>
              </div>
              <input
                type="range"
                min={5}
                max={70}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Merge Proximity Distance */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Jarak Gabung Teks/Hati</span>
                <span className="font-mono text-white">{mergeDistance}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={mergeDistance}
                onChange={(e) => setMergeDistance(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Padding */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Padding Margin</span>
                <span className="font-mono text-white">{padding}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Grid Columns */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Jumlah Kolom (Horizontal)</span>
                <span className="font-mono text-white font-bold">{gridCols} Kolom</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={gridCols}
                onChange={(e) => setGridCols(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Grid Rows */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Jumlah Baris (Vertikal)</span>
                <span className="font-mono text-white font-bold">{gridRows} Baris</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={gridRows}
                onChange={(e) => setGridRows(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Grid Inset Padding */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Padding Inset Kotak</span>
                <span className="font-mono text-white">{padding}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual Bounding Box Inspector */}
      {imageSrc && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-400" />
              Pratinjau Lembar Potongan ({boxes.filter((b) => b.selected).length} Stiker Aktif)
            </span>
            <span className="text-slate-500 italic">
              Klik pada kotak angka untuk memilih / mengecualikan stiker tertentu
            </span>
          </div>

          {/* Interactive Scaled Overlay Canvas Frame */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2 max-h-[550px]">
            <div className="relative inline-block max-h-[500px]">
              <img
                src={imageSrc}
                alt="Sticker Sheet"
                className="max-h-[500px] w-auto object-contain rounded-xl block pointer-events-none"
              />

              {/* Overlaid bounding box rectangles */}
              {imgDimensions.w > 0 &&
                boxes.map((box) => {
                  const leftPct = (box.x / imgDimensions.w) * 100;
                  const topPct = (box.y / imgDimensions.h) * 100;
                  const widthPct = (box.w / imgDimensions.w) * 100;
                  const heightPct = (box.h / imgDimensions.h) * 100;

                  return (
                    <div
                      key={box.id}
                      onClick={() => toggleBox(box.id)}
                      className={`absolute cursor-pointer transition-all duration-150 border-2 rounded-lg flex items-start justify-start p-1 ${
                        box.selected
                          ? "border-pink-500 bg-pink-500/15 hover:bg-pink-500/25"
                          : "border-slate-600/40 bg-slate-950/60 opacity-40 hover:opacity-80"
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      title={`Stiker #${box.id} (${box.w}x${box.h}px) - Klik untuk ${box.selected ? "nonaktifkan" : "aktifkan"}`}
                    >
                      <span
                        className={`text-[9px] font-bold px-1 rounded shadow-sm ${
                          box.selected ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        #{box.id}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Sliced Stickers Gallery & Batch Actions */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Hasil Potongan Stiker ({slicedStickers.length} Stiker Siap)
            </h3>
            <p className="text-xs text-slate-400">
              Format: {exportPreset === "whatsapp" ? "WhatsApp (512×512 WebP Transparan)" : exportPreset === "telegram" ? "Telegram (512×512 PNG)" : "Original Cropped PNG"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllZip}
              disabled={slicedStickers.length === 0 || downloadingZip}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg disabled:opacity-40"
            >
              <FolderArchive className="h-4 w-4" />
              <span>{downloadingZip ? "Mengemas ZIP..." : "Unduh Semua (.ZIP)"}</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {slicedStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {slicedStickers.map((stk) => (
              <div
                key={stk.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors group"
              >
                {/* Transparency checkerboard container */}
                <div
                  className="h-28 w-full rounded-xl overflow-hidden flex items-center justify-center p-2 relative"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  <img src={stk.dataUrl} alt={`Sticker #${stk.id}`} className="max-h-full max-w-full object-contain" />
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-pink-400 border border-slate-700">
                    #{stk.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{stk.width}×{stk.height}</span>
                  <button
                    onClick={() => downloadSingle(stk)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors"
                    title="Unduh stiker ini"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500">
            <Scissors className="h-8 w-8 mx-auto mb-2 opacity-40 animate-pulse" />
            <p className="text-xs">Tidak ada stiker yang terdeteksi. Sesuaikan slider toleransi atau pilih mode Grid Slicer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
