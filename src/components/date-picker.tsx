"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const padZero = (num: number) => num.toString().padStart(2, "0");

const formatDateKey = (year: number, month: number, day: number) => {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
};

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Pilih tenggat waktu...",
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date from value or fallback to today
  const getInitialDate = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(getInitialDate);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      setCurrentMonthDate(new Date(y, m - 1, d));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    onChange(dateKey);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Quick preset shortcuts
  const applyPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(dateKey);
    setCurrentMonthDate(d);
    setIsOpen(false);
  };

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Formatted display text
  const displayLabel = (() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    return parsed.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-left transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
          isOpen && "border-indigo-500 ring-1 ring-indigo-500/30"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          {displayLabel ? (
            <span className="text-slate-100 font-medium">{displayLabel}</span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {value && (
            <span
              onClick={handleClear}
              title="Hapus tanggal"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">📅</span>
        </div>
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header: Month & Year Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-100">
              {MONTH_NAMES[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Bulan selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1.5 py-2.5 border-b border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => applyPreset(0)}
              className="rounded-lg bg-slate-950 py-1 text-[11px] font-medium text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1)}
              className="rounded-lg bg-slate-950 py-1 text-[11px] font-medium text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors"
            >
              Besok
            </button>
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="rounded-lg bg-slate-950 py-1 text-[11px] font-medium text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors"
            >
              +1 Minggu
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
            {DAY_NAMES.map((d, i) => (
              <span key={i} className="text-[11px] font-semibold text-slate-500">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for days before the first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(year, month, day);
              const isSelected = value === dateKey;
              const isToday = todayKey === dateKey;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                      : isToday
                      ? "border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-semibold hover:bg-indigo-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom Clear Option */}
          {value && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">Terpilih: {displayLabel}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
