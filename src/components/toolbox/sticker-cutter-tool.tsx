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
  Pipette,
  FolderArchive,
  RefreshCw,
  Info,
  Maximize2
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
  ev.setUint16(20, 0, true); // Comment length

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
  
  // Slicing Modes: "gutters" (XY-Cut channels - best for sheets), "blobs" (free contour), "grid" (NxM)
  const [mode, setMode] = useState<"gutters" | "blobs" | "grid">("gutters");

  // Detection Parameters
  const [bgColor, setBgColor] = useState<string>("#000000");
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(25); // Color threshold
  const [gutterSensitivity, setGutterSensitivity] = useState<number>(2); // 1 - 10%
  const [mergeDistance, setMergeDistance] = useState<number>(15); // Distance for floating text in blob mode
  const [padding, setPadding] = useState<number>(6);
  const [minSize, setMinSize] = useState<number>(40);

  // Grid Parameters
  const [gridCols, setGridCols] = useState<number>(3);
  const [gridRows, setGridRows] = useState<number>(5);
  const [autoSnapGrid, setAutoSnapGrid] = useState<boolean>(true);

  // Processing Options
  const [makeTransparent, setMakeTransparent] = useState<boolean>(true);
  const [exportPreset, setExportPreset] = useState<"whatsapp" | "telegram" | "original">("whatsapp");
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);

  // Results
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [slicedStickers, setSlicedStickers] = useState<SlicedSticker[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);

  // Load sample demo sheet on mount
  useEffect(() => {
    loadDemoSheet();
  }, []);

  const loadDemoSheet = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark Purple Background
    ctx.fillStyle = "#120a1a";
    ctx.fillRect(0, 0, 600, 1000);

    const emojis = [
      { text: "Good morning!", icon: "🌸", col: 0, row: 0 },
      { text: "Whattt?", icon: "😲", col: 1, row: 0 },
      { text: "Huh?", icon: "🤔", col: 2, row: 0 },
      { text: "Reminding you!", icon: "☝️", col: 0, row: 1 },
      { text: "So sleepy", icon: "😴", col: 1, row: 1 },
      { text: "Wow!", icon: "✨", col: 2, row: 1 },
      { text: "Approved!", icon: "👍", col: 0, row: 2 },
      { text: "Nice!", icon: "🥰", col: 1, row: 2 },
      { text: "Hey you!", icon: "👋", col: 2, row: 2 },
      { text: "Achoo!", icon: "🤧", col: 0, row: 3 },
      { text: "Angry!", icon: "💢", col: 1, row: 3 },
      { text: "Huh???", icon: "❓", col: 2, row: 3 },
      { text: "Good night :3", icon: "🌙", col: 0, row: 4 },
      { text: "Too cuteee", icon: "💖", col: 1, row: 4 },
      { text: "Am I cool yet?!", icon: "😎", col: 2, row: 4 },
    ];

    emojis.forEach((item) => {
      const cx = item.col * 200 + 100;
      const cy = item.row * 200 + 100;

      // Draw white sticker die-cut border background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cx - 65, cy - 65, 130, 130, 28);
      ctx.fill();

      // Inner illustration circle
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 42, 0, Math.PI * 2);
      ctx.fill();

      // Emoji
      ctx.font = "38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.icon, cx, cy - 10);

      // Text label
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#e11d48";
      ctx.fillText(item.text, cx, cy + 45);
    });

    const dataUrl = canvas.toDataURL("image/png");
    setBgColor("#120a1a");
    setGridCols(3);
    setGridRows(5);
    setImageSrc(dataUrl);
    setImgDimensions({ w: 600, h: 1000 });
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
        // Auto detect background from perimeter on upload
        autoDetectBackground(img);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Auto-detect dominant background color by sampling outer perimeter
  const autoDetectBackground = (img: HTMLImageElement) => {
    const scanCanvas = document.createElement("canvas");
    scanCanvas.width = 100;
    scanCanvas.height = 100;
    const ctx = scanCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, 100, 100);
    const data = ctx.getImageData(0, 0, 100, 100).data;

    let transparentCount = 0;
    const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};

    const checkPixel = (idx: number) => {
      const a = data[idx + 3];
      if (a < 30) {
        transparentCount++;
        return;
      }
      const r = Math.round(data[idx] / 8) * 8;
      const g = Math.round(data[idx + 1] / 8) * 8;
      const b = Math.round(data[idx + 2] / 8) * 8;
      const key = `${r},${g},${b}`;
      if (!colorCounts[key]) {
        colorCounts[key] = { count: 0, r: data[idx], g: data[idx + 1], b: data[idx + 2] };
      }
      colorCounts[key].count++;
    };

    // Sample perimeter borders
    for (let x = 0; x < 100; x++) {
      checkPixel((0 * 100 + x) * 4);
      checkPixel((99 * 100 + x) * 4);
    }
    for (let y = 0; y < 100; y++) {
      checkPixel((y * 100 + 0) * 4);
      checkPixel((y * 100 + 99) * 4);
    }

    if (transparentCount > 150) {
      setIsTransparentBg(true);
      return;
    }

    setIsTransparentBg(false);
    const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    if (sorted.length > 0) {
      const top = sorted[0];
      const hex = "#" + [top.r, top.g, top.b].map((x) => x.toString(16).padStart(2, "0")).join("");
      setBgColor(hex);
    }
  };

  // Eyedropper click on image preview to pick exact background
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive || !imgRef.current) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * imgDimensions.w);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * imgDimensions.h);

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(imgRef.current, clickX, clickY, 1, 1, 0, 0, 1, 1);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    if (p[3] < 30) {
      setIsTransparentBg(true);
    } else {
      setIsTransparentBg(false);
      const hex = "#" + [p[0], p[1], p[2]].map((x) => x.toString(16).padStart(2, "0")).join("");
      setBgColor(hex);
    }
    setIsEyedropperActive(false);
  };

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const num = parseInt(hex.replace("#", ""), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  // Main Detection Engine
  const detectStickers = () => {
    if (!imageSrc || !imgDimensions.w || !imgDimensions.h) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const bgRgb = hexToRgb(bgColor);

      // Downsample for speed
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
      const sData = sCtx.getImageData(0, 0, sw, sh).data;

      // 1. Compute Binary Mask (1 = Sticker Foreground, 0 = Background)
      const mask = new Uint8Array(sw * sh);
      const tolVal = tolerance * 3;

      for (let i = 0; i < sData.length; i += 4) {
        const r = sData[i];
        const g = sData[i + 1];
        const b = sData[i + 2];
        const a = sData[i + 3];

        if (a < 30) {
          mask[i / 4] = 0;
          continue;
        }

        if (isTransparentBg) {
          mask[i / 4] = a > 50 ? 1 : 0;
        } else {
          const diff = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);
          mask[i / 4] = diff > tolVal ? 1 : 0;
        }
      }

      let detectedBoxes: BoundingBox[] = [];

      // =========================================================================
      // METHOD 1: Celah Antar Stiker (XY-Cut / River-Gutter Analysis)
      // Best for sheets with rows & columns (eliminates any cross-merging!)
      // =========================================================================
      if (mode === "gutters") {
        // Horizontal profile
        const rowDensity = new Float32Array(sh);
        for (let y = 0; y < sh; y++) {
          let count = 0;
          for (let x = 0; x < sw; x++) {
            if (mask[y * sw + x] === 1) count++;
          }
          rowDensity[y] = count / sw;
        }

        const rowThreshold = (gutterSensitivity / 100) * 0.8;
        interface Band { minY: number; maxY: number; }
        const bands: Band[] = [];
        let inBand = false;
        let bandStart = 0;

        for (let y = 0; y < sh; y++) {
          if (rowDensity[y] > rowThreshold) {
            if (!inBand) {
              inBand = true;
              bandStart = y;
            }
          } else {
            if (inBand) {
              inBand = false;
              if (y - bandStart > 18) {
                bands.push({ minY: bandStart, maxY: y });
              }
            }
          }
        }
        if (inBand && sh - bandStart > 18) {
          bands.push({ minY: bandStart, maxY: sh });
        }

        // For each horizontal row band, find vertical cuts
        const rawCells: { minX: number; maxX: number; minY: number; maxY: number }[] = [];
        const colThreshold = (gutterSensitivity / 100) * 0.8;

        for (const band of bands) {
          const colDensity = new Float32Array(sw);
          const bHeight = band.maxY - band.minY;
          for (let x = 0; x < sw; x++) {
            let count = 0;
            for (let y = band.minY; y < band.maxY; y++) {
              if (mask[y * sw + x] === 1) count++;
            }
            colDensity[x] = count / bHeight;
          }

          let inCol = false;
          let colStart = 0;
          for (let x = 0; x < sw; x++) {
            if (colDensity[x] > colThreshold) {
              if (!inCol) {
                inCol = true;
                colStart = x;
              }
            } else {
              if (inCol) {
                inCol = false;
                if (x - colStart > 18) {
                  rawCells.push({ minX: colStart, maxX: x, minY: band.minY, maxY: band.maxY });
                }
              }
            }
          }
          if (inCol && sw - colStart > 18) {
            rawCells.push({ minX: colStart, maxX: sw, minY: band.minY, maxY: band.maxY });
          }
        }

        // Trim each cell tightly to the actual sticker pixels inside it
        let idCounter = 1;
        for (const cell of rawCells) {
          let cMinX = cell.maxX;
          let cMaxX = cell.minX;
          let cMinY = cell.maxY;
          let cMaxY = cell.minY;
          let fgCount = 0;

          for (let y = cell.minY; y < cell.maxY; y++) {
            for (let x = cell.minX; x < cell.maxX; x++) {
              if (mask[y * sw + x] === 1) {
                fgCount++;
                if (x < cMinX) cMinX = x;
                if (x > cMaxX) cMaxX = x;
                if (y < cMinY) cMinY = y;
                if (y > cMaxY) cMaxY = y;
              }
            }
          }

          if (fgCount > 40 && cMaxX > cMinX && cMaxY > cMinY) {
            const bx = Math.max(0, Math.round(cMinX / scale) - padding);
            const by = Math.max(0, Math.round(cMinY / scale) - padding);
            const bw = Math.min(w - bx, Math.round((cMaxX - cMinX) / scale) + padding * 2);
            const bh = Math.min(h - by, Math.round((cMaxY - cMinY) / scale) + padding * 2);

            if (bw >= minSize && bh >= minSize) {
              detectedBoxes.push({
                id: idCounter++,
                x: bx,
                y: by,
                w: bw,
                h: bh,
                selected: true,
              });
            }
          }
        }
      }

      // =========================================================================
      // METHOD 2: Kontur Bebas (CCL with Major/Minor Classification)
      // =========================================================================
      else if (mode === "blobs") {
        const visited = new Uint8Array(sw * sh);
        const blobs: { minX: number; minY: number; maxX: number; maxY: number; count: number }[] = [];

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
                blobs.push({ minX, minY, maxX, maxY, count });
              }
            }
          }
        }

        // Separate into Major Stickers and Minor Fragments (e.g. text/hearts)
        // Two major stickers NEVER merge!
        const majorThreshold = 400; // pixels in downsampled space
        const majors = blobs.filter((b) => b.count >= majorThreshold);
        const minors = blobs.filter((b) => b.count < majorThreshold);

        const scaledMergeDist = mergeDistance * scale;

        // Absorb minor fragments into the nearest major sticker ONLY
        for (const min of minors) {
          let closestMajor: { minX: number; minY: number; maxX: number; maxY: number; count: number } | null = null;
          let minDist = Infinity;

          for (const maj of majors) {
            const gapX = Math.max(0, Math.max(min.minX, maj.minX) - Math.min(min.maxX, maj.maxX));
            const gapY = Math.max(0, Math.max(min.minY, maj.minY) - Math.min(min.maxY, maj.maxY));
            const dist = Math.sqrt(gapX * gapX + gapY * gapY);

            if (dist <= scaledMergeDist && dist < minDist) {
              minDist = dist;
              closestMajor = maj;
            }
          }

          if (closestMajor) {
            closestMajor.minX = Math.min(closestMajor.minX, min.minX);
            closestMajor.minY = Math.min(closestMajor.minY, min.minY);
            closestMajor.maxX = Math.max(closestMajor.maxX, min.maxX);
            closestMajor.maxY = Math.max(closestMajor.maxY, min.maxY);
          }
        }

        const finalBlobs = majors.length > 0 ? majors : blobs;
        let idCounter = 1;

        finalBlobs.forEach((b) => {
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
      }

      // =========================================================================
      // METHOD 3: Grid Slicer (NxM) with Auto-Snap to Content
      // =========================================================================
      else {
        const cellW = Math.floor(w / gridCols);
        const cellH = Math.floor(h / gridRows);
        let idCounter = 1;

        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            let bx = Math.max(0, c * cellW + padding);
            let by = Math.max(0, r * cellH + padding);
            let bw = Math.min(w - bx, cellW - padding * 2);
            let bh = Math.min(h - by, cellH - padding * 2);

            // Auto-Snap to content inside cell
            if (autoSnapGrid) {
              const startX = Math.round(bx * scale);
              const endX = Math.round((bx + bw) * scale);
              const startY = Math.round(by * scale);
              const endY = Math.round((by + bh) * scale);

              let snapMinX = endX;
              let snapMaxX = startX;
              let snapMinY = endY;
              let snapMaxY = startY;
              let foundFg = false;

              for (let sy = startY; sy < endY; sy++) {
                for (let sx = startX; sx < endX; sx++) {
                  if (sx >= 0 && sx < sw && sy >= 0 && sy < sh && mask[sy * sw + sx] === 1) {
                    foundFg = true;
                    if (sx < snapMinX) snapMinX = sx;
                    if (sx > snapMaxX) snapMaxX = sx;
                    if (sy < snapMinY) snapMinY = sy;
                    if (sy > snapMaxY) snapMaxY = sy;
                  }
                }
              }

              if (foundFg && snapMaxX > snapMinX && snapMaxY > snapMinY) {
                bx = Math.max(0, Math.round(snapMinX / scale) - padding);
                by = Math.max(0, Math.round(snapMinY / scale) - padding);
                bw = Math.min(w - bx, Math.round((snapMaxX - snapMinX) / scale) + padding * 2);
                bh = Math.min(h - by, Math.round((snapMaxY - snapMinY) / scale) + padding * 2);
              }
            }

            if (bw > 15 && bh > 15) {
              detectedBoxes.push({
                id: idCounter++,
                x: bx,
                y: by,
                w: bw,
                h: bh,
                selected: true,
              });
            }
          }
        }
      }

      // Sort boxes top-to-bottom, left-to-right
      detectedBoxes.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 35) return a.y - b.y;
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
      if (makeTransparent && !isTransparentBg) {
        const imgData = cCtx.getImageData(0, 0, box.w, box.h);
        const data = imgData.data;
        const visited = new Uint8Array(box.w * box.h);
        const queue: number[] = [];

        // Push border pixels as seed
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

  // Re-detect on parameter change
  useEffect(() => {
    if (imageSrc) {
      detectStickers();
    }
  }, [imageSrc, mode, tolerance, gutterSensitivity, mergeDistance, padding, minSize, gridCols, gridRows, autoSnapGrid, bgColor, isTransparentBg, makeTransparent, exportPreset]);

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
              onClick={() => setMode("gutters")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "gutters"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Auto Celah / Gutters (Sangat Akurat)</span>
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
              <span>Grid Slicer (NxM)</span>
            </button>
            <button
              onClick={() => setMode("blobs")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === "blobs"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Kontur Bebas (Blobs)</span>
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
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-pink-400" />
            Parameter Pemotongan & Warna Background
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEyedropperActive(!isEyedropperActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isEyedropperActive
                  ? "bg-pink-600 text-white border-pink-500 animate-pulse"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              <Pipette className="h-3.5 w-3.5" />
              <span>{isEyedropperActive ? "Klik Titik Background pada Gambar..." : "Pipet Warna Background"}</span>
            </button>

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
        </div>

        {/* Mode Specific Controls */}
        {mode === "gutters" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Background Color */}
            <div>
              <label className="text-slate-400 block mb-1">Warna Background Sheet</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    setIsTransparentBg(false);
                  }}
                  className="h-8 w-12 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="font-mono text-white font-bold">{bgColor}</span>
              </div>
            </div>

            {/* Tolerance */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Toleransi Warna</span>
                <span className="font-mono text-white font-bold">{tolerance}</span>
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

            {/* Gutter Sensitivity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Ambang Celah Pemisah</span>
                <span className="font-mono text-white font-bold">{gutterSensitivity}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={gutterSensitivity}
                onChange={(e) => setGutterSensitivity(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Padding */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Padding Margin Kotak</span>
                <span className="font-mono text-white font-bold">{padding}px</span>
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

        {mode === "grid" && (
          <div className="space-y-4 text-xs">
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold">Preset Cepat:</span>
              <button
                onClick={() => { setGridCols(3); setGridRows(5); }}
                className={`px-3 py-1 rounded-xl font-medium border transition-colors ${
                  gridCols === 3 && gridRows === 5
                    ? "bg-pink-600 text-white border-pink-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                3 × 5 (15 Stiker)
              </button>
              <button
                onClick={() => { setGridCols(4); setGridRows(4); }}
                className={`px-3 py-1 rounded-xl font-medium border transition-colors ${
                  gridCols === 4 && gridRows === 4
                    ? "bg-pink-600 text-white border-pink-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                4 × 4 (16 Stiker)
              </button>
              <button
                onClick={() => { setGridCols(3); setGridRows(4); }}
                className={`px-3 py-1 rounded-xl font-medium border transition-colors ${
                  gridCols === 3 && gridRows === 4
                    ? "bg-pink-600 text-white border-pink-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                3 × 4 (12 Stiker)
              </button>
              <button
                onClick={() => { setGridCols(4); setGridRows(5); }}
                className={`px-3 py-1 rounded-xl font-medium border transition-colors ${
                  gridCols === 4 && gridRows === 5
                    ? "bg-pink-600 text-white border-pink-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                4 × 5 (20 Stiker)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Grid Columns */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Kolom (Horizontal)</span>
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
                  <span className="text-slate-400">Baris (Vertikal)</span>
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
                  <span className="text-slate-400">Padding Kotak</span>
                  <span className="font-mono text-white font-bold">{padding}px</span>
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

              {/* Auto-Snap Toggle */}
              <div className="flex items-center pt-3">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={autoSnapGrid}
                    onChange={(e) => setAutoSnapGrid(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Auto-Snap Pas ke Kontur Stiker</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {mode === "blobs" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Background Color */}
            <div>
              <label className="text-slate-400 block mb-1">Warna Background</label>
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
                <span className="font-mono text-white font-bold">{tolerance}</span>
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

            {/* Merge Distance */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Jarak Gabung Teks (Hanya Elemen Kecil)</span>
                <span className="font-mono text-white font-bold">{mergeDistance}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={mergeDistance}
                onChange={(e) => setMergeDistance(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Padding */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Padding Margin</span>
                <span className="font-mono text-white font-bold">{padding}px</span>
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
              Pratinjau Lembar Potongan ({boxes.filter((b) => b.selected).length} dari {boxes.length} Stiker Terdeteksi)
            </span>
            <div className="flex items-center gap-3 text-slate-400">
              <button
                onClick={detectStickers}
                className="text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Deteksi Ulang
              </button>
              <span>&bull;</span>
              <span className="italic">Klik kotak nomor stiker untuk mematikan/mengaktifkan</span>
            </div>
          </div>

          {/* Interactive Scaled Overlay Canvas Frame */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-3 max-h-[600px]">
            <div className="relative inline-block max-h-[550px]">
              <img
                ref={previewImgRef}
                src={imageSrc}
                alt="Sticker Sheet"
                onClick={handleImageClick}
                className={`max-h-[550px] w-auto object-contain rounded-xl block ${
                  isEyedropperActive ? "cursor-crosshair ring-2 ring-pink-500" : ""
                }`}
              />

              {/* Overlaid bounding box rectangles */}
              {!isEyedropperActive &&
                imgDimensions.w > 0 &&
                boxes.map((box) => {
                  const leftPct = (box.x / imgDimensions.w) * 100;
                  const topPct = (box.y / imgDimensions.h) * 100;
                  const widthPct = (box.w / imgDimensions.w) * 100;
                  const heightPct = (box.h / imgDimensions.h) * 100;

                  return (
                    <div
                      key={box.id}
                      onClick={() => toggleBox(box.id)}
                      className={`absolute cursor-pointer transition-all duration-150 border-2 rounded-lg flex items-start justify-start p-1 select-none ${
                        box.selected
                          ? "border-pink-500 bg-pink-500/20 hover:bg-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                          : "border-slate-600/40 bg-slate-950/60 opacity-30 hover:opacity-70"
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      title={`Stiker #${box.id} (${box.w}×${box.h}px) - Klik untuk ${box.selected ? "nonaktifkan" : "aktifkan"}`}
                    >
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-md ${
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
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
            <p className="text-xs">Tidak ada stiker yang terdeteksi. Silakan coba mode Celah / Gutters atau sesuaikan preset Grid Slicer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
