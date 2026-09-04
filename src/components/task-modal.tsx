"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, FileText } from "lucide-react";
import { TaskItem } from "@/data/mock-projects";
import { MarkdownEditor } from "@/components/markdown-editor";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => void;
  taskToEdit?: TaskItem | null;
  defaultStatus?: "todo" | "doing" | "done";
  projectId: string;
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultStatus = "todo",
  projectId,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"todo" | "doing" | "done">(defaultStatus);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [dueDate, setDueDate] = useState("");
  const [notesMarkdown, setNotesMarkdown] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority || "medium");
      setDueDate(taskToEdit.dueDate || "");
      setNotesMarkdown(taskToEdit.notesMarkdown || "");
    } else {
      setTitle("");
      setStatus(defaultStatus);
      setPriority("medium");
      setDueDate("");
      setNotesMarkdown("");
    }
  }, [taskToEdit, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      projectId,
      title: title.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      notesMarkdown: notesMarkdown.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {taskToEdit ? "Ubah Kartu Tugas" : "Tambah Kartu Tugas"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "details"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Informasi Tugas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "notes"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Catatan Markdown
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {activeTab === "details" ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Judul Tugas <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Buat integrasi API endpoint"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kolom Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="todo" className="bg-slate-900">Todo (Rencana)</option>
                    <option value="doing" className="bg-slate-900">Sedang Dikerjakan</option>
                    <option value="done" className="bg-slate-900">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="critical" className="bg-slate-900">Kritis (Critical)</option>
                    <option value="high" className="bg-slate-900">Tinggi (High)</option>
                    <option value="medium" className="bg-slate-900">Sedang (Medium)</option>
                    <option value="low" className="bg-slate-900">Rendah (Low)</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tenggat Waktu (Due Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Editor Catatan Markdown Tugas
              </label>
              <MarkdownEditor
                value={notesMarkdown}
                onChange={setNotesMarkdown}
                placeholder="Tulis checklist, instruksi tugas, atau referensi..."
                minHeight="min-h-[220px]"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              {taskToEdit ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}