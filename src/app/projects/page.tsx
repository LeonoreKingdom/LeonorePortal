"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Sparkles,
  X,
  FileText
} from "lucide-react";
import { MOCK_PROJECTS, ProjectItem } from "@/data/mock-projects";
import { ProjectCard } from "@/components/project-card";
import { ProjectModal } from "@/components/project-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Link from "next/link";

const STATUS_FILTERS = ["Semua", "active", "completed", "on-hold"];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [projects, setProjects] = useState<ProjectItem[]>(MOCK_PROJECTS);
  const [activeNotesProject, setActiveNotesProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectItem | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch((err) => console.error("Gagal memuat proyek dari API:", err));
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "Semua" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Overall statistics
  const totalTasks = useMemo(
    () => projects.reduce((acc, p) => acc + p.tasks.length, 0),
    [projects]
  );
  const doneTasks = useMemo(
    () =>
      projects.reduce(
        (acc, p) => acc + p.tasks.filter((t) => t.status === "done").length,
        0
      ),
    [projects]
  );
  const doingTasks = useMemo(
    () =>
      projects.reduce(
        (acc, p) => acc + p.tasks.filter((t) => t.status === "doing").length,
        0
      ),
    [projects]
  );

  const handleCreateProject = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: ProjectItem) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setProjectToDelete(proj);
    }
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    }
  };

  const handleSaveProject = (projectData: Partial<ProjectItem>) => {
    if (projectToEdit) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectToEdit.id
            ? {
                ...p,
                ...projectData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const newProj: ProjectItem = {
        id: projectData.id || `proj-${Date.now()}`,
        title: projectData.title || "Proyek Baru",
        description: projectData.description || "",
        category: projectData.category || "Web Development",
        color: projectData.color || "#6366f1",
        status: projectData.status || "active",
        notesMarkdown: projectData.notesMarkdown || "",
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProj, ...prev]);
    }
  };

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Background Glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-emerald-400 opacity-20 sm:left-[calc(50%+30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Manajemen Proyek & Kanban
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Projects
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
              Tempat untuk mengelola manajemen proyek.
            </p>
          </div>

          {/* Quick Actions & Metrics */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-center">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Total Proyek</div>
                <div className="text-base sm:text-lg font-bold text-white">{projects.length}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-center">
                <div className="text-[10px] sm:text-[11px] text-amber-400">Sedang Kerja</div>
                <div className="text-base sm:text-lg font-bold text-amber-300">{doingTasks}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-center">
                <div className="text-[10px] sm:text-[11px] text-emerald-400">Selesai</div>
                <div className="text-base sm:text-lg font-bold text-emerald-300">{doneTasks}</div>
              </div>
            </div>

            <button
              onClick={handleCreateProject}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              Tambah Proyek
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari proyek, kategori, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {status === "Semua"
                  ? "Semua"
                  : status === "active"
                  ? "Aktif"
                  : status === "completed"
                  ? "Selesai"
                  : "Ditunda"}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <FolderKanban className="h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Tidak ada proyek ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Coba sesuaikan kata kunci pencarian atau buat proyek baru.
            </p>
            <button
              onClick={handleCreateProject}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Buat Proyek Baru
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenNotes={(p) => setActiveNotesProject(p)}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!projectToDelete}
        title="Hapus Proyek"
        message="Tindakan ini akan menghapus proyek beserta semua kartu tugas dan catatan di dalamnya. Anda yakin ingin melanjutkan?"
        itemName={projectToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Markdown Notes Preview Modal with MarkdownRenderer */}
      {activeNotesProject && (
        <div 
          onClick={() => setActiveNotesProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">{activeNotesProject.title} — Catatan</h3>
              </div>
              <button
                onClick={() => setActiveNotesProject(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl bg-slate-950 p-4 border border-slate-800">
              <MarkdownRenderer content={activeNotesProject.notesMarkdown} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveNotesProject(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Tutup
              </button>
              <Link
                href={`/projects/${activeNotesProject.id}`}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Buka Papan Kanban
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}