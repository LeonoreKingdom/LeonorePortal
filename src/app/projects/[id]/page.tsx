"use client";

import { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FolderKanban, 
  Search, 
  Plus, 
  FileText, 
  X, 
  Edit3
} from "lucide-react";
import { MOCK_PROJECTS, ProjectItem, TaskItem } from "@/data/mock-projects";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskModal } from "@/components/task-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MarkdownEditor } from "@/components/markdown-editor";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectKanbanPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const initialProject = useMemo(() => {
    return (
      MOCK_PROJECTS.find((p) => p.id === projectId) || {
        id: projectId,
        title: "Proyek Kustom",
        description: "Papan Kanban untuk mengelola alur kerja tugas.",
        category: "General",
        color: "#6366f1",
        status: "active" as const,
        notesMarkdown: "# Catatan Proyek\n\n- Tulis catatan detail di sini...",
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }, [projectId]);

  const [project, setProject] = useState<ProjectItem>(initialProject);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [taskSearch, setTaskSearch] = useState("");
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isEditingProjectNotes, setIsEditingProjectNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(project.notesMarkdown || "");
  const [activeTaskNotes, setActiveTaskNotes] = useState<TaskItem | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProject(data.data);
          setNotesDraft(data.data.notesMarkdown || "");
        }
      })
      .catch((err) => console.error("Gagal memuat detail proyek:", err))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<"todo" | "doing" | "done">("todo");
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Filter tasks in board
  const filteredTasks = useMemo(() => {
    const q = taskSearch.toLowerCase().trim();
    if (!q) return project.tasks;
    return project.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.notesMarkdown && t.notesMarkdown.toLowerCase().includes(q))
    );
  }, [project.tasks, taskSearch]);

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  function computeProjectStatus(
    tasks: TaskItem[],
    currentStatus: "active" | "completed" | "on-hold"
  ): "active" | "completed" | "on-hold" {
    if (tasks.length === 0) return currentStatus;
    const doneCount = tasks.filter((t) => t.status === "done").length;
    if (doneCount === tasks.length) return "completed";
    if (currentStatus === "completed" && doneCount < tasks.length) return "active";
    return currentStatus;
  }

  // Move task status handler
  const handleMoveStatus = async (taskId: string, newStatus: "todo" | "doing" | "done") => {
    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    const newStatusProject = computeProjectStatus(updatedTasks, project.status);

    setProject((prev) => ({
      ...prev,
      status: newStatusProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (newStatusProject !== project.status) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatusProject }),
        });
      }
    } catch (err) {
      console.error("Gagal memperbarui status tugas:", err);
    }
  };

  const handleOpenAddTask = (status: "todo" | "doing" | "done" = "todo") => {
    setTaskToEdit(null);
    setTaskModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleRequestDeleteTask = (taskId: string) => {
    const task = project.tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDelete) {
      const taskId = taskToDelete.id;
      const updatedTasks = project.tasks.filter((t) => t.id !== taskId);
      const newStatusProject = computeProjectStatus(updatedTasks, project.status);

      setProject((prev) => ({
        ...prev,
        status: newStatusProject,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }));
      setTaskToDelete(null);

      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });
        if (newStatusProject !== project.status) {
          await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatusProject }),
          });
        }
      } catch (err) {
        console.error("Gagal menghapus tugas:", err);
      }
    }
  };

  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    if (taskToEdit) {
      const updatedTasks = project.tasks.map((t) =>
        t.id === taskToEdit.id
          ? ({
              ...t,
              ...taskData,
              updatedAt: new Date().toISOString(),
            } as TaskItem)
          : t
      );
      const newStatusProject = computeProjectStatus(updatedTasks, project.status);

      setProject((prev) => ({
        ...prev,
        status: newStatusProject,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }));
      setIsTaskModalOpen(false);

      try {
        await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (newStatusProject !== project.status) {
          await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatusProject }),
          });
        }
      } catch (err) {
        console.error("Gagal memperbarui tugas:", err);
      }
    } else {
      const tempId = taskData.id || `task-${Date.now()}`;
      const newTask: TaskItem = {
        id: tempId,
        projectId: project.id,
        title: taskData.title || "Tugas Baru",
        status: taskData.status || taskModalDefaultStatus,
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate,
        notesMarkdown: taskData.notesMarkdown || "",
        sortOrder: project.tasks.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = [...project.tasks, newTask];
      const newStatusProject = computeProjectStatus(updatedTasks, project.status);

      setProject((prev) => ({
        ...prev,
        status: newStatusProject,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }));
      setIsTaskModalOpen(false);

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newTask,
            projectId: project.id,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === tempId ? json.data : t)),
          }));
        }
        if (newStatusProject !== project.status) {
          await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatusProject }),
          });
        }
      } catch (err) {
        console.error("Gagal membuat tugas:", err);
      }
    }
  };

  const handleSaveProjectNotes = async () => {
    setProject((prev) => ({
      ...prev,
      notesMarkdown: notesDraft,
      updatedAt: new Date().toISOString(),
    }));
    setIsEditingProjectNotes(false);

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesMarkdown: notesDraft }),
      });
    } catch (err) {
      console.error("Gagal menyimpan catatan proyek:", err);
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
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-sky-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Projects
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{project.title}</span>
        </div>

        {/* Project Header Banner */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg"
              style={{
                backgroundColor: `${project.color}20`,
                borderColor: `${project.color}50`,
                color: project.color,
              }}
            >
              <FolderKanban className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700/60">
                  {project.category}
                </span>
                {isLoading ? (
                  <div className="h-5 w-16 rounded-full bg-slate-800 animate-pulse" />
                ) : (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize",
                      project.status === "active"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : project.status === "completed"
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    )}
                  >
                    {project.status === "active" ? "Aktif" : project.status === "completed" ? "Selesai" : "Ditunda"}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {project.title}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => {
                setShowNotesPanel(!showNotesPanel);
                setNotesDraft(project.notesMarkdown || "");
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all",
                showNotesPanel
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              )}
            >
              <FileText className="h-4 w-4" />
              {showNotesPanel ? "Tutup Catatan" : "Catatan Proyek"}
            </button>

            <button
              onClick={() => handleOpenAddTask("todo")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              Tambah Tugas
            </button>
          </div>
        </div>

        {/* Collapsible Project Markdown Notes Panel */}
        {showNotesPanel && (
          <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <FileText className="h-4 w-4" />
                Catatan Markdown Proyek
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProjectNotes(!isEditingProjectNotes)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingProjectNotes ? "Batal Edit" : "Edit Catatan"}
                </button>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isEditingProjectNotes ? (
              <div className="mt-4 space-y-3">
                <MarkdownEditor
                  value={notesDraft}
                  onChange={setNotesDraft}
                  placeholder="# Catatan Proyek..."
                  minHeight="min-h-[220px]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingProjectNotes(false)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveProjectNotes}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-slate-950 p-4 border border-slate-800/80">
                <MarkdownRenderer content={project.notesMarkdown} />
              </div>
            )}
          </div>
        )}

        {/* Board Controls: Search & Progress bar */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tugas di papan Kanban..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {taskSearch && (
              <button
                onClick={() => setTaskSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            {isLoading ? (
              <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
            ) : (
              <span>Selesai: <strong className="text-emerald-400">{doneTasks}</strong> / {totalTasks} ({progressPercent}%)</span>
            )}
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* The Kanban Board */}
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {[
                { title: "Todo (Rencana)" },
                { title: "Sedang Dikerjakan" },
                { title: "Selesai" },
              ].map((col, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-sm animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-800" />
                      <div className="h-4 w-28 rounded bg-slate-800" />
                      <div className="h-4 w-6 rounded-full bg-slate-800" />
                    </div>
                  </div>
                  <div className="space-y-3 min-h-[220px]">
                    {[1, 2].map((cardIdx) => (
                      <div
                        key={cardIdx}
                        className="rounded-xl border border-slate-800/90 bg-slate-900/90 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-3.5 w-14 rounded bg-slate-800" />
                          <div className="h-3.5 w-12 rounded bg-slate-800" />
                        </div>
                        <div className="h-4 w-3/4 rounded bg-slate-800" />
                        <div className="h-3 w-full rounded bg-slate-800/60" />
                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                          <div className="h-3 w-16 rounded bg-slate-800" />
                          <div className="h-5 w-14 rounded bg-slate-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              onMoveStatus={handleMoveStatus}
              onAddTask={handleOpenAddTask}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleRequestDeleteTask}
              onViewNotes={(task) => setActiveTaskNotes(task)}
            />
          )}
        </div>
      </div>

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultStatus={taskModalDefaultStatus}
        projectId={project.id}
      />

      {/* Task Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="Hapus Kartu Tugas"
        message="Apakah Anda yakin ingin menghapus kartu tugas ini dari papan Kanban?"
        itemName={taskToDelete?.title}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Task Notes Modal with rich MarkdownRenderer */}
      {activeTaskNotes && (
        <div 
          onClick={() => setActiveTaskNotes(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                {activeTaskNotes.title}
              </h3>
              <button
                onClick={() => setActiveTaskNotes(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-xl bg-slate-950 p-4 border border-slate-800">
              <MarkdownRenderer content={activeTaskNotes.notesMarkdown || "Tidak ada catatan Markdown untuk tugas ini."} />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveTaskNotes(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}