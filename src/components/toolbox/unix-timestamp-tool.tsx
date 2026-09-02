"use client";

import { useState, useEffect } from "react";
import { 
  CalendarClock, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Globe, 
  Calendar, 
  Clock, 
  ArrowDownUp,
  Sparkles
} from "lucide-react";

export function UnixTimestampTool() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState<boolean>(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Epoch to Human Date Input
  const [inputEpoch, setInputEpoch] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");

  // Human Date to Epoch Input
  const [inputDate, setInputDate] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Compute Human representations from inputEpoch
  const parsedEpochDate = (() => {
    try {
      const num = Number(inputEpoch.trim());
      if (isNaN(num) || num <= 0) return null;

      const ms = unit === "seconds" ? num * 1000 : num;
      const d = new Date(ms);
      if (isNaN(d.getTime())) return null;

      const nowMs = Date.now();
      const diffSec = Math.round((nowMs - ms) / 1000);

      let relativeStr = "";
      if (Math.abs(diffSec) < 60) relativeStr = "Baru saja";
      else if (diffSec > 0 && diffSec < 3600) relativeStr = `${Math.floor(diffSec / 60)} menit yang lalu`;
      else if (diffSec > 0 && diffSec < 86400) relativeStr = `${Math.floor(diffSec / 3600)} jam yang lalu`;
      else if (diffSec > 0) relativeStr = `${Math.floor(diffSec / 86400)} hari yang lalu`;
      else if (diffSec < 0 && Math.abs(diffSec) < 3600) relativeStr = `Dalam ${Math.floor(Math.abs(diffSec) / 60)} menit`;
      else if (diffSec < 0 && Math.abs(diffSec) < 86400) relativeStr = `Dalam ${Math.floor(Math.abs(diffSec) / 3600)} jam`;
      else relativeStr = `Dalam ${Math.floor(Math.abs(diffSec) / 86400)} hari`;

      return {
        iso: d.toISOString(),
        utc: d.toUTCString(),
        wib: d.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB (UTC+7)",
        wita: d.toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) + " WITA (UTC+8)",
        wit: d.toLocaleString("id-ID", { timeZone: "Asia/Jayapura" }) + " WIT (UTC+9)",
        local: d.toLocaleString("id-ID"),
        relative: relativeStr,
      };
    } catch {
      return null;
    }
  })();

  // Compute Epoch from Date Picker
  const targetEpoch = (() => {
    try {
      const d = new Date(inputDate);
      if (isNaN(d.getTime())) return null;
      return {
        seconds: Math.floor(d.getTime() / 1000),
        milliseconds: d.getTime(),
      };
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Live Current Timestamp Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <h3 className="text-sm font-bold text-white">Unix Epoch Timestamp Real-Time</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              {isLive ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isLive ? "Jeda" : "Lanjutkan"}</span>
            </button>
            <button
              onClick={() => setInputEpoch(String(currentEpoch))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-bold transition-colors"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              <span>Gunakan Waktu Ini</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-mono">Detik (Seconds)</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{currentEpoch}</div>
            </div>
            <button
              onClick={() => copyToClipboard(String(currentEpoch), "cur-sec")}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copiedSection === "cur-sec" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-mono">Milidetik (Milliseconds)</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-indigo-400">{currentEpoch * 1000}</div>
            </div>
            <button
              onClick={() => copyToClipboard(String(currentEpoch * 1000), "cur-ms")}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copiedSection === "cur-ms" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Way Converter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Converter 1: Epoch to Human Date */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Konversi Timestamp ke Tanggal
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputEpoch}
                onChange={(e) => setInputEpoch(e.target.value)}
                placeholder="Contoh: 1788353337"
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-300"
              >
                <option value="seconds">Detik (s)</option>
                <option value="milliseconds">Milidetik (ms)</option>
              </select>
            </div>

            {parsedEpochDate ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Waktu Indonesia Barat (WIB / UTC+7)</div>
                    <div className="text-emerald-400 font-bold">{parsedEpochDate.wib}</div>
                  </div>
                  <button onClick={() => copyToClipboard(parsedEpochDate.wib, "wib")} className="text-slate-500 hover:text-slate-300">
                    {copiedSection === "wib" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Waktu Relatif</div>
                    <div className="text-indigo-300 font-bold">{parsedEpochDate.relative}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Format Standar ISO 8601 (UTC)</div>
                    <div className="text-slate-300">{parsedEpochDate.iso}</div>
                  </div>
                  <button onClick={() => copyToClipboard(parsedEpochDate.iso, "iso")} className="text-slate-500 hover:text-slate-300">
                    {copiedSection === "iso" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Format RFC 2822 (GMT)</div>
                    <div className="text-slate-400">{parsedEpochDate.utc}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                Masukkan nilai epoch yang valid di atas
              </div>
            )}
          </div>
        </div>

        {/* Converter 2: Human Date to Epoch */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Konversi Tanggal ke Unix Timestamp
            </h4>
          </div>

          <div className="space-y-3">
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            {targetEpoch ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Timestamp (Detik)</div>
                    <div className="text-emerald-400 font-bold text-base">{targetEpoch.seconds}</div>
                  </div>
                  <button onClick={() => copyToClipboard(String(targetEpoch.seconds), "to-sec")} className="text-slate-500 hover:text-slate-300">
                    {copiedSection === "to-sec" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Timestamp (Milidetik)</div>
                    <div className="text-indigo-400 font-bold text-base">{targetEpoch.milliseconds}</div>
                  </div>
                  <button onClick={() => copyToClipboard(String(targetEpoch.milliseconds), "to-ms")} className="text-slate-500 hover:text-slate-300">
                    {copiedSection === "to-ms" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}