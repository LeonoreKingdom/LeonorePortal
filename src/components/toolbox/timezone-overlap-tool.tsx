"use client";

import { useState } from "react";
import { 
  Globe, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Users 
} from "lucide-react";

interface CityTimezone {
  id: string;
  name: string;
  tz: string;
  offsetHours: number; // relative to UTC
}

const DEFAULT_CITIES: CityTimezone[] = [
  { id: "jkt", name: "Jakarta (WIB)", tz: "Asia/Jakarta", offsetHours: 7 },
  { id: "tyo", name: "Tokyo (JST)", tz: "Asia/Tokyo", offsetHours: 9 },
  { id: "lon", name: "London (GMT/BST)", tz: "Europe/London", offsetHours: 1 },
  { id: "nyc", name: "New York (EDT)", tz: "America/New_York", offsetHours: -4 },
  { id: "sfo", name: "San Francisco (PDT)", tz: "America/Los_Angeles", offsetHours: -7 },
];

export function TimezoneOverlapTool() {
  const [selectedCities, setSelectedCities] = useState<CityTimezone[]>(DEFAULT_CITIES);
  const [activeHourUtc, setActiveHourUtc] = useState<number>(7); // 7 UTC = 14:00 WIB

  // Available to add
  const availableToAdd: CityTimezone[] = [
    { id: "syd", name: "Sydney (AEST)", tz: "Australia/Sydney", offsetHours: 10 },
    { id: "sin", name: "Singapura (SGT)", tz: "Asia/Singapore", offsetHours: 8 },
    { id: "dxb", name: "Dubai (GST)", tz: "Asia/Dubai", offsetHours: 4 },
    { id: "ber", name: "Berlin (CEST)", tz: "Europe/Berlin", offsetHours: 2 },
  ].filter((c) => !selectedCities.some((sc) => sc.id === c.id));

  const addCity = (c: CityTimezone) => {
    setSelectedCities([...selectedCities, c]);
  };

  const removeCity = (id: string) => {
    if (selectedCities.length > 1) {
      setSelectedCities(selectedCities.filter((c) => c.id !== id));
    }
  };

  const getLocalHour = (utcHour: number, offset: number) => {
    return (utcHour + offset + 24) % 24;
  };

  // Check if a given UTC hour is within working hours (09:00 - 18:00) for ALL selected cities
  const isOverlapHour = (utcHour: number) => {
    return selectedCities.every((city) => {
      const local = getLocalHour(utcHour, city.offsetHours);
      return local >= 9 && local <= 18;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Timezone Overlap Finder</h2>
            <p className="text-xs text-slate-400">Temukan jam kerja dan slot meeting ideal lintas zona waktu dunia</p>
          </div>
        </div>

        {availableToAdd.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tambah Kota:</span>
            {availableToAdd.slice(0, 2).map((c) => (
              <button
                key={c.id}
                onClick={() => addCity(c)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" /> {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Time Snapshot Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-400" />
            Waktu Terpilih (Klik kolom jam di tabel bawah):
          </span>
          <span className="font-mono text-white font-semibold">UTC: {activeHourUtc.toString().padStart(2, "0")}:00</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {selectedCities.map((c) => {
            const h = getLocalHour(activeHourUtc, c.offsetHours);
            const isWork = h >= 9 && h <= 18;
            return (
              <div
                key={c.id}
                className={`p-3 rounded-2xl border transition-colors ${
                  isWork
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-950/60 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[11px] font-semibold truncate">{c.name}</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {h.toString().padStart(2, "0")}:00
                </div>
                <div className="text-[10px] mt-0.5">
                  {isWork ? "🟢 Jam Kerja" : "⚪ Di Luar Jam Kerja"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour Timeline Grid */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Garis Waktu 24 Jam (Hijau = Jam Kerja 09:00 - 18:00)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/30 border border-emerald-500" /> Jam Kerja</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-950 border border-slate-800" /> Istirahat / Malam</span>
          </div>
        </div>

        <div className="min-w-[700px] space-y-3">
          {/* UTC Header */}
          <div className="flex items-center">
            <div className="w-44 text-xs font-mono font-bold text-slate-400">UTC / GMT</div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }).map((_, h) => (
                <button
                  key={h}
                  onClick={() => setActiveHourUtc(h)}
                  className={`h-7 text-[10px] font-mono rounded flex items-center justify-center transition-colors ${
                    activeHourUtc === h
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="w-8" />
          </div>

          {/* City Rows */}
          {selectedCities.map((city) => (
            <div key={city.id} className="flex items-center group">
              <div className="w-44 text-xs font-medium text-slate-200 truncate pr-2">
                {city.name}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }).map((_, h) => {
                  const localH = getLocalHour(h, city.offsetHours);
                  const isWork = localH >= 9 && localH <= 18;
                  const isSelected = activeHourUtc === h;

                  return (
                    <button
                      key={h}
                      onClick={() => setActiveHourUtc(h)}
                      className={`h-7 text-[9px] font-mono rounded flex items-center justify-center transition-all ${
                        isSelected
                          ? "ring-2 ring-indigo-400 z-10"
                          : ""
                      } ${
                        isWork
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                          : "bg-slate-950/60 text-slate-600 border border-slate-900"
                      }`}
                      title={`${city.name}: ${localH}:00`}
                    >
                      {localH}
                    </button>
                  );
                })}
              </div>
              <div className="w-8 text-right">
                <button
                  onClick={() => removeCity(city.id)}
                  disabled={selectedCities.length <= 1}
                  className="text-slate-600 hover:text-rose-400 p-1 rounded disabled:opacity-20"
                  title="Hapus baris kota"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
