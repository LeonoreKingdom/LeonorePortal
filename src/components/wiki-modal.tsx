"use client";

import { useState, useEffect, useMemo } from "react";
import { X, BookOpen, AlertCircle, Check, FileText, Plus, FolderPlus } from "lucide-react";
import { WikiPageItem, WikiCategory } from "@/data/mock-wiki";
import { MarkdownEditor } from "@/components/markdown-editor";

interface WikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: Partial<WikiPageItem>) => void;
  existingPages: WikiPageItem[];
  categories: WikiCategory[];
  pageToEdit?: WikiPageItem | null;
  onAddCategory?: (category: WikiCategory) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function WikiModal({
  isOpen,
  onClose,
  onSave,
  existingPages,
  categories: initialCategories,
  pageToEdit,
  onAddCategory,
}: WikiModalProps) {
  const [categories, setCategories] = useState<WikiCategory[]>(initialCategories);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "content">("details");

  // Quick category creator state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (pageToEdit) {
      setTitle(pageToEdit.title);
      setSlug(pageToEdit.slug);
      setCategoryId(pageToEdit.categoryId);
      setTagsInput(pageToEdit.tags?.join(", ") || "");
      setContentMarkdown(pageToEdit.contentMarkdown);
      setIsManualSlug(true);
    } else {
      setTitle("");
      setSlug("");
      setCategoryId(categories[0]?.id || "cat-1");
      setTagsInput("");
      setContentMarkdown("# Judul Halaman\n\nTulis isi dokumentasi...");
      setIsManualSlug(false);
    }
    setIsCreatingCategory(false);
  }, [pageToEdit, categories, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isManualSlug) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManualSlug(true);
    setSlug(slugify(e.target.value));
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: WikiCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      description: "Kategori buatan pengguna",
      icon: "BookOpen",
      color: newCategoryColor,
    };
    setCategories((prev) => [...prev, newCat]);
    setCategoryId(newCat.id);
    onAddCategory?.(newCat);
    setNewCategoryName("");
    setIsCreatingCategory(false);
  };

  // Validation: Unique Title and Unique Slug check
  const isDuplicateTitle = useMemo(() => {
    const trimmed = title.trim().toLowerCase();
    if (!trimmed) return false;
    return existingPages.some(
      (p) => p.title.toLowerCase() === trimmed && (!pageToEdit || p.id !== pageToEdit.id)
    );
  }, [title, existingPages, pageToEdit]);

  const isDuplicateSlug = useMemo(() => {
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) return false;
    return existingPages.some(
      (p) => p.slug.toLowerCase() === trimmed && (!pageToEdit || p.id !== pageToEdit.id)
    );
  }, [slug, existingPages, pageToEdit]);

  const isValid = title.trim() !== "" && slug.trim() !== "" && !isDuplicateTitle && !isDuplicateSlug;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      id: pageToEdit ? pageToEdit.id : `wiki-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim(),
      categoryId: categoryId || categories[0]?.id || "cat-1",
      tags,
      contentMarkdown,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {pageToEdit ? "Ubah Halaman Wiki" : "Buat Halaman Wiki Baru"}
              </h2>
              <p className="text-xs text-slate-400">
                {pageToEdit ? "Perbarui informasi dan isi dokumen wiki" : "Buat dokumen pengetahuan baru dengan judul unik dan kategori terorganisir"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
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
                ? "bg-sky-600/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Informasi Halaman
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "content"
                ? "bg-sky-600/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Isi Markdown
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {activeTab === "details" ? (
            <>
              {/* Title & Unique Check */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Judul Halaman <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Misal: Panduan Deployment Server"
                  className={`w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${
                    isDuplicateTitle
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-800 focus:border-sky-500"
                  }`}
                />
                {isDuplicateTitle && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Judul halaman ini sudah digunakan. Harap gunakan judul unik.
                  </p>
                )}
              </div>

              {/* Slug & Unique Check */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Slug URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-mono text-slate-500">
                    /knowledge-base/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="panduan-deployment-server"
                    className={`w-full rounded-xl border bg-slate-950 pl-36 pr-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none ${
                      isDuplicateSlug
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-slate-800 focus:border-sky-500"
                    }`}
                  />
                </div>
                {isDuplicateSlug && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Slug URL ini sudah digunakan oleh halaman lain.
                  </p>
                )}
              </div>

              {/* Category Selector with Enhanced Badges & Add Category Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Kategori Wiki <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300"
                  >
                    <FolderPlus className="h-3 w-3" />
                    {isCreatingCategory ? "Batal Tambah" : "+ Kategori Baru"}
                  </button>
                </div>

                {isCreatingCategory && (
                  <div className="mb-3 rounded-xl border border-sky-500/30 bg-slate-950 p-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nama kategori baru..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      {["#6366f1", "#38bdf8", "#10b981", "#a855f7", "#f59e0b"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCategoryColor(c)}
                          className={`h-5 w-5 rounded-full border ${
                            newCategoryColor === c ? "ring-2 ring-white" : "opacity-70"
                          }`}
                          style={{ backgroundColor: c, borderColor: "rgba(255,255,255,0.3)" }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                    >
                      Tambah
                    </button>
                  </div>
                )}

                {/* Grid of category chips */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-left border transition-all ${
                        categoryId === c.id
                          ? "border-sky-500 bg-sky-950/30 text-white ring-1 ring-sky-500"
                          : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-xs font-semibold truncate">{c.name}</span>
                      </div>
                      {categoryId === c.id && <Check className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tag (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Misal: Panduan, Next.js, Setup"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Editor Isi Halaman (Markdown)
              </label>
              <MarkdownEditor
                value={contentMarkdown}
                onChange={setContentMarkdown}
                placeholder="# Judul Dokumentasi..."
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
              disabled={!isValid}
              className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all shadow-md ${
                isValid
                  ? "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
              }`}
            >
              {pageToEdit ? "Simpan Perubahan" : "Buat Halaman"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}