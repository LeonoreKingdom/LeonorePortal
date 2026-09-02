"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/20 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300 border border-slate-800 break-words">
                &ldquo;{itemName}&rdquo;
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-600/25 transition-all active:scale-95"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}