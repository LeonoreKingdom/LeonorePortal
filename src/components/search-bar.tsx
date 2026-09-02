"use client";

import { useEffect, useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
  totalItems?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Cari aplikasi, utilitas, atau tag... (tekan / untuk fokus)",
  totalResults,
  totalItems,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) && document.activeElement !== inputRef.current) {
        // Prevent default if not typing in another input/textarea
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        if (value) {
          onChange("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, onChange]);

  return (
    <div className="relative flex-1">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-20 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm transition-all focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              title="Hapus pencarian (Esc)"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              <span className="text-xs">/</span>
            </kbd>
          )}
        </div>
      </div>

      {value && totalResults !== undefined && (
        <div className="mt-1.5 flex items-center justify-between px-1 text-xs text-slate-400">
          <span>
            Menampilkan <strong className="text-indigo-300 font-semibold">{totalResults}</strong> dari {totalItems} aplikasi
          </span>
          <span className="text-[11px] text-slate-500">Tekan Esc untuk batal</span>
        </div>
      )}
    </div>
  );
}