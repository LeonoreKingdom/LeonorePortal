"use client";

import { useState, useMemo } from "react";
import { 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  Plus 
} from "lucide-react";
import { TaskItem } from "@/data/mock-projects";
import { KanbanCard } from "@/components/kanban-card";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: TaskItem[];
  onMoveStatus: (taskId: string, newStatus: "todo" | "doing" | "done") => void;
  onAddTask: (status: "todo" | "doing" | "done") => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onViewNotes: (task: TaskItem) => void;
}

export function KanbanBoard({
  tasks,
  onMoveStatus,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewNotes,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const todoTasks = useMemo(
    () => tasks.filter((t) => t.status === "todo").sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks]
  );
  const doingTasks = useMemo(
    () => tasks.filter((t) => t.status === "doing").sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === "done").sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks]
  );

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnStatus: string) => {
    // Only clear if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === columnStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: "todo" | "doing" | "done") => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* TODO COLUMN */}
      <div
        onDragOver={(e) => handleDragOver(e, "todo")}
        onDragLeave={(e) => handleDragLeave(e, "todo")}
        onDrop={(e) => handleDrop(e, "todo")}
        className={cn(
          "flex flex-col rounded-2xl border bg-slate-950/60 p-4 shadow-sm transition-all duration-200",
          dragOverColumn === "todo"
            ? "border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/30"
            : "border-slate-800"
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <ListTodo className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Todo (Rencana)</h3>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono font-semibold text-slate-400">
              {todoTasks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddTask("todo")}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Tambah tugas ke Todo"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 min-h-[240px]">
          {todoTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 py-12 text-center text-xs text-slate-500">
              Tarik kartu ke sini atau klik + untuk menambah
            </div>
          ) : (
            todoTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onMoveStatus={onMoveStatus}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onViewNotes={onViewNotes}
              />
            ))
          )}
        </div>
      </div>

      {/* DOING COLUMN */}
      <div
        onDragOver={(e) => handleDragOver(e, "doing")}
        onDragLeave={(e) => handleDragLeave(e, "doing")}
        onDrop={(e) => handleDrop(e, "doing")}
        className={cn(
          "flex flex-col rounded-2xl border bg-slate-950/60 p-4 shadow-sm transition-all duration-200",
          dragOverColumn === "doing"
            ? "border-amber-500 bg-amber-950/20 ring-2 ring-amber-500/30"
            : "border-amber-500/20"
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-amber-300">Sedang Dikerjakan</h3>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-amber-400 border border-amber-500/20">
              {doingTasks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddTask("doing")}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 transition-colors"
            title="Tambah tugas ke Doing"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 min-h-[240px]">
          {doingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 py-12 text-center text-xs text-slate-500">
              Tarik kartu ke sini untuk memulai pengerjaan
            </div>
          ) : (
            doingTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onMoveStatus={onMoveStatus}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onViewNotes={onViewNotes}
              />
            ))
          )}
        </div>
      </div>

      {/* DONE COLUMN */}
      <div
        onDragOver={(e) => handleDragOver(e, "done")}
        onDragLeave={(e) => handleDragLeave(e, "done")}
        onDrop={(e) => handleDrop(e, "done")}
        className={cn(
          "flex flex-col rounded-2xl border bg-slate-950/60 p-4 shadow-sm transition-all duration-200",
          dragOverColumn === "done"
            ? "border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/30"
            : "border-emerald-500/20"
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-emerald-300">Selesai</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              {doneTasks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddTask("done")}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
            title="Tambah tugas ke Selesai"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 min-h-[240px]">
          {doneTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 py-12 text-center text-xs text-slate-500">
              Tarik kartu ke sini saat tugas selesai
            </div>
          ) : (
            doneTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onMoveStatus={onMoveStatus}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onViewNotes={onViewNotes}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}