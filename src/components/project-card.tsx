"use client";

import Link from "next/link";
import { 
  FolderKanban, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  ArrowRight,
  FileText,
  Pencil,
  Trash2
} from "lucide-react";
import { ProjectItem } from "@/data/mock-projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectItem;
  onOpenNotes?: (project: ProjectItem) => void;
  onEditProject?: (project: ProjectItem) => void;
  onDeleteProject?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  onOpenNotes,
  onEditProject,
  onDeleteProject,
}: ProjectCardProps) {
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const doingTasks = project.tasks.filter((t) => t.status === "doing").length;
  const todoTasks = project.tasks.filter((t) => t.status === "todo").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const formattedDate = new Date(project.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) {
      return;
    }
    window.location.href = `/projects/${project.id}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border transition-transform group-hover:scale-105"
              style={{ borderColor: `${project.color}50`, backgroundColor: `${project.color}15`, color: project.color }}
            >
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700/60">
                {project.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onEditProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                title="Ubah Proyek"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDeleteProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                title="Hapus Proyek"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium border capitalize",
                project.status === "active"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : project.status === "completed"
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              )}
            >
              {project.status === "active" ? "Aktif" : project.status === "completed" ? "Selesai" : "Ditunda"}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              {project.title}
            </h3>
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Progres Tugas</span>
            <span className="text-white font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks Breakdown Pills */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
              <ListTodo className="h-3 w-3 text-slate-400" />
              <span>Todo</span>
            </div>
            <div className="mt-0.5 font-bold text-slate-200">{todoTasks}</div>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[11px]">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Doing</span>
            </div>
            <div className="mt-0.5 font-bold text-amber-300">{doingTasks}</div>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-[11px]">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Done</span>
            </div>
            <div className="mt-0.5 font-bold text-emerald-300">{doneTasks}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
        </span>

        <div className="flex items-center gap-2">
          {project.notesMarkdown && onOpenNotes && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenNotes(project);
              }}
              title="Lihat Catatan Markdown"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors border border-transparent hover:border-slate-700"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Buka Kanban</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}