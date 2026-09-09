"use client";

import { useState } from "react";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  ExternalLink, 
  ZoomIn, 
  Maximize2,
  RefreshCw,
  Sliders
} from "lucide-react";

interface DevicePreset {
  id: string;
  name: string;
  type: "mobile" | "tablet" | "desktop";
  width: number;
  height: number;
}

const PRESETS: DevicePreset[] = [
  { id: "iphone-15", name: "iPhone 15 Pro", type: "mobile", width: 393, height: 852 },
  { id: "pixel-7", name: "Pixel 7 Pro", type: "mobile", width: 412, height: 915 },
  { id: "ipad-air", name: "iPad Air", type: "tablet", width: 820, height: 1180 },
  { id: "macbook-air", name: "MacBook Air 13\"", type: "desktop", width: 1280, height: 800 },
];

export function ResponsiveViewerTool() {
  const [url, setUrl] = useState("https://example.com");
  const [currentUrl, setCurrentUrl] = useState("https://example.com");
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(PRESETS[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [reloadKey, setReloadKey] = useState(1);

  const activeWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const activeHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = url.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "https://" + formatted;
    }
    setCurrentUrl(formatted);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Responsive Website Viewer</h2>
              <p className="text-xs text-slate-400">Simulasikan dan uji tata letak website di berbagai resolusi layar perangkat</p>
            </div>
          </div>

          {/* Device Presets Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedDevice(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  selectedDevice.id === p.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                {p.type === "mobile" && <Smartphone className="h-3.5 w-3.5" />}
                {p.type === "tablet" && <Tablet className="h-3.5 w-3.5" />}
                {p.type === "desktop" && <Monitor className="h-3.5 w-3.5" />}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* URL Input Bar & Tool Buttons */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <form onSubmit={handleNavigate} className="flex-1 w-full flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Masukkan URL (misal: https://example.com atau http://localhost:3000)..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors shrink-0 shadow-md"
            >
              Muat URL
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Putar Orientasi"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {isLandscape ? "Landscape" : "Portrait"}
            </button>

            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Muat Ulang"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="bg-transparent text-xs focus:outline-none cursor-pointer"
              >
                <option value={0.65} className="bg-slate-900">Skala 65%</option>
                <option value={0.75} className="bg-slate-900">Skala 75%</option>
                <option value={0.85} className="bg-slate-900">Skala 85%</option>
                <option value={1.0} className="bg-slate-900">Skala 100%</option>
              </select>
            </div>

            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Buka di Tab Baru"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Resolusi Aktif: <strong className="text-white">{activeWidth} × {activeHeight} px</strong></span>
          <span className="italic">Catatan: Beberapa website eksternal mungkin membatasi pemuatan iframe via header X-Frame-Options.</span>
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex items-center justify-center overflow-auto min-h-[600px]">
        <div
          className="transition-all duration-300 rounded-[36px] p-3.5 bg-slate-900 border-4 border-slate-800 shadow-2xl shadow-black/80 flex flex-col items-center"
          style={{
            width: activeWidth * scale + 28,
            height: activeHeight * scale + 48,
          }}
        >
          {/* Mock Camera Notch / Pill */}
          <div className="w-20 h-4 bg-slate-950 rounded-full mb-2 shrink-0 border border-slate-800" />

          {/* Iframe Viewport */}
          <div
            className="rounded-2xl overflow-hidden bg-white w-full flex-1 relative border border-slate-800"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <iframe
              key={reloadKey}
              src={currentUrl}
              title="Responsive Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
