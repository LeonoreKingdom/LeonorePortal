import { ensureDbInitialized } from "@/lib/db";
import { TaskItem } from "@/data/mock-projects";

export class TaskService {
  static async getTasksByProjectId(projectId: string): Promise<TaskItem[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM tasks WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC",
      args: [projectId],
    });

    return res.rows.map((r) => ({
      id: String(r.id),
      projectId: String(r.project_id || projectId),
      title: String(r.title),
      status: (r.column_id as any) || "todo",
      priority: (r.priority as any) || "medium",
      dueDate: r.due_date ? String(r.due_date) : undefined,
      notesMarkdown: r.notes ? String(r.notes) : "",
      sortOrder: Number(r.sort_order || 0),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    }));
  }

  static async getTaskById(id: string): Promise<TaskItem | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM tasks WHERE id = ?",
      args: [id],
    });
    const r = res.rows[0];
    if (!r) return null;

    return {
      id: String(r.id),
      projectId: String(r.project_id),
      title: String(r.title),
      status: (r.column_id as any) || "todo",
      priority: (r.priority as any) || "medium",
      dueDate: r.due_date ? String(r.due_date) : undefined,
      notesMarkdown: r.notes ? String(r.notes) : "",
      sortOrder: Number(r.sort_order || 0),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  }

  static async createTask(projectId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    const db = await ensureDbInitialized();
    const id = data.id || `task-${Date.now()}`;
    const now = new Date().toISOString();

    const maxSortRes = await db.execute({
      sql: "SELECT max(sort_order) as max_order FROM tasks WHERE project_id = ? AND column_id = ?",
      args: [projectId, data.status || "todo"],
    });
    const nextSort = Number(maxSortRes.rows[0]?.max_order || 0) + 1;

    await db.execute({
      sql: `INSERT INTO tasks (id, project_id, title, description, column_id, priority, due_date, notes, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        projectId,
        data.title || "Tugas Baru",
        data.notesMarkdown || "",
        data.status || "todo",
        data.priority || "medium",
        data.dueDate || null,
        data.notesMarkdown || null,
        nextSort,
        now,
        now,
      ],
    });

    await this.syncProjectProgressAndStatus(projectId);
    return (await this.getTaskById(id))!;
  }

  static async updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem | null> {
    const db = await ensureDbInitialized();
    const current = await this.getTaskById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : current.title;
    const columnId = data.status !== undefined ? data.status : current.status;
    const priority = data.priority !== undefined ? data.priority : current.priority || "medium";
    const dueDate = data.dueDate !== undefined ? data.dueDate : current.dueDate || null;
    const notes = data.notesMarkdown !== undefined ? data.notesMarkdown : current.notesMarkdown || null;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : current.sortOrder;

    await db.execute({
      sql: `UPDATE tasks
            SET title = ?, column_id = ?, priority = ?, due_date = ?, notes = ?, sort_order = ?, updated_at = ?
            WHERE id = ?`,
      args: [title, columnId, priority, dueDate, notes, sortOrder, now, id],
    });

    await this.syncProjectProgressAndStatus(current.projectId);

    return this.getTaskById(id);
  }

  static async deleteTask(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const current = await this.getTaskById(id);
    if (!current) return false;

    const res = await db.execute({
      sql: "DELETE FROM tasks WHERE id = ?",
      args: [id],
    });

    if (res.rowsAffected > 0) {
      await this.syncProjectProgressAndStatus(current.projectId);
      return true;
    }
    return false;
  }

  static async batchReorderTasks(tasks: { id: string; status: "todo" | "doing" | "done"; sortOrder: number }[]): Promise<boolean> {
    const db = await ensureDbInitialized();
    const now = new Date().toISOString();

    let projectId: string | null = null;
    for (const t of tasks) {
      if (!projectId) {
        const item = await this.getTaskById(t.id);
        if (item) projectId = item.projectId;
      }
      await db.execute({
        sql: "UPDATE tasks SET column_id = ?, sort_order = ?, updated_at = ? WHERE id = ?",
        args: [t.status, t.sortOrder, now, t.id],
      });
    }

    if (projectId) {
      await this.syncProjectProgressAndStatus(projectId);
    }

    return true;
  }

  static async syncProjectProgressAndStatus(projectId: string): Promise<void> {
    try {
      const db = await ensureDbInitialized();
      const tasksRes = await db.execute({
        sql: "SELECT column_id FROM tasks WHERE project_id = ?",
        args: [projectId],
      });

      const total = tasksRes.rows.length;
      const doneCount = tasksRes.rows.filter((r) => r.column_id === "done").length;
      const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

      const projRes = await db.execute({
        sql: "SELECT status FROM projects WHERE id = ?",
        args: [projectId],
      });
      if (projRes.rows.length === 0) return;

      const currentStatus = String(projRes.rows[0].status || "active");
      let newStatus = currentStatus;
      if (total > 0 && doneCount === total) {
        newStatus = "completed";
      } else if (currentStatus === "completed" && doneCount < total) {
        newStatus = "active";
      }

      const now = new Date().toISOString();
      await db.execute({
        sql: "UPDATE projects SET progress = ?, status = ?, updated_at = ? WHERE id = ?",
        args: [progress, newStatus, now, projectId],
      });
    } catch (err) {
      console.error(`Gagal sinkronisasi status proyek ${projectId}:`, err);
    }
  }
}