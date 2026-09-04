"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Calendar, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Pencil, 
  Trash2,
  GripVertical
} from "lucide-react";
import { TaskItem } from "@/data/mock-projects";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: TaskItem;
  onMoveStatus?: (taskId: string, newStatus: "todo" | "doing" | "done") => void;
  onEditTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  onViewNotes?: (task: TaskItem) => void;
  onDragStart?: (e: React.DragEvent, task: TaskItem) => void;
}

const PRIORITY_BADGES: Record<string, string> = {
  critical: "bg-rose-600/20 text-rose-300 border-rose-500/50 font-bold",
  high: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-slate-800 text-slate-400 border-slate-700/60",
};

export function KanbanCard({
  task,
  onMoveStatus,
  onEditTask,
  onDeleteTask,
  onViewNotes,
  onDragStart,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative rounded-xl border border-slate-800/90 bg-slate-900/90 p-4 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-md",
        isDragging && "opacity-40 border-dashed border-indigo-400 scale-[0.98]"
      )}
    >
      {/* Top Header: Drag Handle & Priority & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold border uppercase tracking-wider",
              task.priority ? PRIORITY_BADGES[task.priority] : PRIORITY_BADGES.medium
            )}
          >
            {task.priority || "medium"}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onEditTask && (
            <button
              type="button"
              onClick={() => onEditTask(task)}
              title="Ubah Tugas"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {onDeleteTask && (
            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              title="Hapus Tugas"
              className="rounded p-1 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <div className="mt-2.5">
        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
          {task.title}
        </h4>
      </div>

      {/* Task Metadata: Markdown preview & Due Date */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
        {formattedDueDate && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" />
            {formattedDueDate}
          </span>
        )}

        {task.notesMarkdown && (
          <button
            type="button"
            onClick={() => onViewNotes?.(task)}
            title="Lihat Catatan Detail"
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            <FileText className="h-3 w-3" />
            Catatan
          </button>
        )}
      </div>

      {/* Move Buttons between Columns (Fallback for touch / click) */}
      {onMoveStatus && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            {task.status === "doing" && (
              <button
                type="button"
                onClick={() => onMoveStatus(task.id, "todo")}
                className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-1 text-[10px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              >
                <ChevronLeft className="h-3 w-3" />
                Ke Todo
              </button>
            )}
            {task.status === "done" && (
              <button
                type="button"
                onClick={() => onMoveStatus(task.id, "doing")}
                className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-1 text-[10px] font-medium text-amber-400 hover:bg-slate-800 border border-slate-800"
              >
                <ChevronLeft className="h-3 w-3" />
                Ke Doing
              </button>
            )}
          </div>

          <div>
            {task.status === "todo" && (
              <button
                type="button"
                onClick={() => onMoveStatus(task.id, "doing")}
                className="inline-flex items-center gap-1 rounded bg-indigo-600/20 px-2 py-1 text-[10px] font-medium text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-colors"
              >
                Ke Doing
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            {task.status === "doing" && (
              <button
                type="button"
                onClick={() => onMoveStatus(task.id, "done")}
                className="inline-flex items-center gap-1 rounded bg-emerald-600/20 px-2 py-1 text-[10px] font-medium text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-colors"
              >
                Selesai
                <CheckCircle2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}