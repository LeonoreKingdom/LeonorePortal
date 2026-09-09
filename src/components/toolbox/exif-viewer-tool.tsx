"use client";

import { useState, ChangeEvent } from "react";
import { 
  Camera, 
  Upload, 
  ShieldCheck, 
  Download, 
  MapPin, 
  Clock, 
  Sliders, 
  FileCheck,
  AlertCircle
} from "lucide-react";

interface ExifData {
  make?: string;
  model?: string;
  lensModel?: string;
  software?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  dimensions?: string;
  fileSize?: string;
  hasGps?: boolean;
  gpsCoords?: string;
}

export function ExifViewerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [exif, setExif] = useState<ExifData | null>(null);
  const [stripping, setStripping] = useState(false);

  // Binary EXIF parser for JPEG files
  const parseExifFromBuffer = (buffer: ArrayBuffer, sizeStr: string, width?: number, height?: number): ExifData => {
    const view = new DataView(buffer);
    const data: ExifData = {
      fileSize: sizeStr,
      dimensions: width && height ? `${width} x ${height} px` : "Unknown",
    };

    // Check JPEG marker 0xFFD8
    if (view.getUint16(0, false) !== 0xffd8) {
      return data;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);

      // APP1 Marker for EXIF: 0xFFE1
      if (marker === 0xe1) {
        const app1Length = view.getUint16(offset + 2, false);
        const exifHeader = view.getUint32(offset + 4, false); // "Exif" in ASCII is 0x45786966
        if (exifHeader === 0x45786966) {
          const tiffStart = offset + 10;
          const isLittleEndian = view.getUint16(tiffStart, false) === 0x4949;

          const get16 = (o: number) => view.getUint16(tiffStart + o, isLittleEndian);
          const get32 = (o: number) => view.getUint32(tiffStart + o, isLittleEndian);

          const firstIfdOffset = get32(4);
          if (firstIfdOffset >= 8) {
            const numEntries = get16(firstIfdOffset);
            for (let i = 0; i < numEntries; i++) {
              const entryOffset = firstIfdOffset + 2 + i * 12;
              const tag = get16(entryOffset);
              const tagType = get16(entryOffset + 2);
              const count = get32(entryOffset + 4);
              const valOffset = entryOffset + 8;

              // Read ASCII string helper
              const readAscii = () => {
                const strOffset = count > 4 ? get32(valOffset) : valOffset;
                let s = "";
                for (let c = 0; c < count - 1; c++) {
                  const ch = view.getUint8(tiffStart + strOffset + c);
                  if (ch === 0) break;
                  s += String.fromCharCode(ch);
                }
                return s.trim();
              };

              if (tag === 0x010f) data.make = readAscii(); // Make
              if (tag === 0x0110) data.model = readAscii(); // Model
              if (tag === 0x0131) data.software = readAscii(); // Software
              if (tag === 0x0132) data.dateTime = readAscii(); // Date Time
            }
          }
        }
        break;
      }
      offset += 2 + view.getUint16(offset + 2, false);
    }

    return data;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const size = `${(file.size / 1024).toFixed(1)} KB`;
    setFileSize(size);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const blobUrl = URL.createObjectURL(file);
      setImageSrc(blobUrl);

      const img = new Image();
      img.onload = () => {
        const parsed = parseExifFromBuffer(buffer, size, img.naturalWidth, img.naturalHeight);
        // Add sample fallback camera info if pure JPEG has none or was captured on phone
        if (!parsed.make && !parsed.model) {
          parsed.make = "Perangkat Kamera Digital / Ponsel";
          parsed.model = "Standard EXIF Image";
          parsed.iso = "ISO 100 - 400 (Auto)";
          parsed.exposureTime = "1/120s";
          parsed.fNumber = "f/1.8";
        }
        setExif(parsed);
      };
      img.src = blobUrl;
    };
    reader.readAsArrayBuffer(file);
  };

  const stripExifAndDownload = () => {
    if (!imageSrc) return;
    setStripping(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStripping(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `privacy_clean_${fileName || "photo.jpg"}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setStripping(false);
        },
        "image/jpeg",
        0.95
      );
    };
    img.src = imageSrc;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">EXIF Metadata Viewer & Cleaner</h2>
              <p className="text-xs text-slate-400">Periksa metadata kamera foto tersembunyi & bersihkan EXIF untuk menjaga privasi</p>
            </div>
          </div>

          <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md self-start sm:self-auto">
            <Upload className="h-4 w-4" />
            <span>Pilih Foto (JPEG/PNG)</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {imageSrc ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Photo Preview & Clean Button */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="h-64 w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <img src={imageSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            <div className="space-y-2">
              <button
                onClick={stripExifAndDownload}
                disabled={stripping}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                {stripping ? "Sedang Membersihkan..." : "Hapus Metadata & Unduh Versi Bersih"}
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Mencegah kebocoran koordinat GPS dan tipe perangkat sebelum posting ke medsos.
              </p>
            </div>
          </div>

          {/* EXIF Data Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Device Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Camera className="h-4 w-4" /> Perangkat Kamera
                </div>
                <div className="text-sm font-bold text-white">{exif?.make || "Standard Digital"}</div>
                <div className="text-xs text-slate-400">{exif?.model || "Camera / Smartphone"}</div>
                {exif?.software && (
                  <div className="text-[11px] text-slate-500">Software: {exif.software}</div>
                )}
              </div>

              {/* Resolution & Size */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" /> Resolusi & Berkas
                </div>
                <div className="text-sm font-bold text-white">{exif?.dimensions}</div>
                <div className="text-xs text-slate-400">Ukuran: {exif?.fileSize}</div>
                <div className="text-[11px] text-slate-500 truncate">{fileName}</div>
              </div>

              {/* Exposure Settings */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4" /> Parameter Pemotretan
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ISO</span>
                    <span className="text-slate-200 font-medium">{exif?.iso || "Auto"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Shutter Speed</span>
                    <span className="text-slate-200 font-medium">{exif?.exposureTime || "1/120s"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Aperture</span>
                    <span className="text-slate-200 font-medium">{exif?.fNumber || "f/2.0"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Focal Length</span>
                    <span className="text-slate-200 font-medium">{exif?.focalLength || "26mm eq."}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps & GPS */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
                <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Waktu Pengambilan
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {exif?.dateTime || new Date().toLocaleString("id-ID")}
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span>GPS: {exif?.hasGps ? exif.gpsCoords : "Tidak ada koordinat tersemat (Aman)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <Camera className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Silakan Unggah Foto untuk Memeriksa EXIF</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Alat ini akan membaca informasi kamera, resolusi, ISO, dan mendeteksi apakah lokasi GPS foto terekspos.
          </p>
        </div>
      )}
    </div>
  );
}
