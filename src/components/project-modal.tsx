"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, FileText, Check } from "lucide-react";
import { ProjectItem } from "@/data/mock-projects";
import { MarkdownEditor } from "@/components/markdown-editor";

const COLOR_OPTIONS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Sky", value: "#38bdf8" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Purple", value: "#a855f7" },
  { label: "Rose", value: "#f43f5e" },
];

const CATEGORY_OPTIONS = [
  "Web Development",
  "Documentation",
  "Research",
  "Design",
  "Utilities",
  "Personal",
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<ProjectItem>) => void;
  projectToEdit?: ProjectItem | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
}: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [color, setColor] = useState("#6366f1");
  const [status, setStatus] = useState<"active" | "completed" | "on-hold">("active");
  const [notesMarkdown, setNotesMarkdown] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category || "Web Development");
      setColor(projectToEdit.color || "#6366f1");
      setStatus(projectToEdit.status || "active");
      setNotesMarkdown(projectToEdit.notesMarkdown || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Web Development");
      setColor("#6366f1");
      setStatus("active");
      setNotesMarkdown("");
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      status,
      notesMarkdown,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {projectToEdit ? "Ubah Proyek" : "Buat Proyek Baru"}
              </h2>
              <p className="text-xs text-slate-400">
                {projectToEdit ? "Perbarui informasi dan catatan proyek" : "Tambahkan proyek baru ke daftar kerja Anda"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
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
            Detail Proyek
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {activeTab === "details" ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Judul Proyek <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Pengembangan Sistem Baru"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan dan ruang lingkup proyek..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-slate-100">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="active" className="bg-slate-900 text-slate-100">Aktif</option>
                    <option value="completed" className="bg-slate-900 text-slate-100">Selesai</option>
                    <option value="on-hold" className="bg-slate-900 text-slate-100">Ditunda</option>
                  </select>
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Warna Tema Proyek
                </label>
                <div className="flex items-center gap-3">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                        color === opt.value
                          ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-110"
                          : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: opt.value, borderColor: "rgba(255,255,255,0.2)" }}
                    >
                      {color === opt.value && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Editor Catatan Markdown
              </label>
              <MarkdownEditor
                value={notesMarkdown}
                onChange={setNotesMarkdown}
                placeholder="# Roadmap Proyek&#10;&#10;Tulis catatan terstruktur di sini..."
                minHeight="min-h-[260px]"
              />
            </div>
          )}

          {/* Actions */}
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
              {projectToEdit ? "Simpan Perubahan" : "Buat Proyek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}