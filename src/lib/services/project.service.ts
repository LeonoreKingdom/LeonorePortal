import { ensureDbInitialized } from "@/lib/db";
import { ProjectItem } from "@/data/mock-projects";
import { TaskService } from "@/lib/services/task.service";

const CATEGORY_COLORS: Record<string, string> = {
  Portal: "#70db86",
  Store: "#edb007",
  Agency: "#e70d2e",
  Utilities: "#f59e0b",
  Bots: "#808080",
  Community: "#ffbc05",
  Romansa: "#f264e1",
  Portfolio: "#ec4899",
  Productivity: "#6366f1",
  Development: "#0ea5e9",
};

export class ProjectService {
  static async getAllProjects(): Promise<ProjectItem[]> {
    const db = await ensureDbInitialized();
    const rows = await db.execute("SELECT * FROM projects ORDER BY updated_at DESC");

    const projects: ProjectItem[] = [];
    for (const r of rows.rows) {
      const pId = String(r.id);
      const tasks = await TaskService.getTasksByProjectId(pId);
      const category = String(r.category || "Development");

      projects.push({
        id: pId,
        title: String(r.title),
        description: String(r.description || ""),
        notesMarkdown: String(r.notes || ""),
        category,
        color: CATEGORY_COLORS[category] || "#6366f1",
        status: (r.status as any) || "active",
        tasks,
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      });
    }

    return projects;
  }

  static async getProjectById(id: string): Promise<ProjectItem | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM projects WHERE id = ?",
      args: [id],
    });
    const r = res.rows[0];
    if (!r) return null;

    const tasks = await TaskService.getTasksByProjectId(id);
    const category = String(r.category || "Development");

    return {
      id: String(r.id),
      title: String(r.title),
      description: String(r.description || ""),
      notesMarkdown: String(r.notes || ""),
      category,
      color: CATEGORY_COLORS[category] || "#6366f1",
      status: (r.status as any) || "active",
      tasks,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  }

  static async createProject(data: Partial<ProjectItem>): Promise<ProjectItem> {
    const db = await ensureDbInitialized();
    const id = data.id || `proj-${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO projects (id, title, description, notes, category, status, progress, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.title || "Proyek Baru",
        data.description || "",
        data.notesMarkdown || `# Catatan Proyek: ${data.title || "Proyek Baru"}\n\nTulis ringkasan dan roadmap proyek di sini...`,
        data.category || "Development",
        data.status || "active",
        0,
        "medium",
        now,
        now,
      ],
    });

    return (await this.getProjectById(id))!;
  }

  static async updateProject(id: string, data: Partial<ProjectItem>): Promise<ProjectItem | null> {
    const db = await ensureDbInitialized();
    const current = await this.getProjectById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : current.title;
    const description = data.description !== undefined ? data.description : current.description;
    const notes = data.notesMarkdown !== undefined ? data.notesMarkdown : current.notesMarkdown;
    const category = data.category !== undefined ? data.category : current.category;
    const status = data.status !== undefined ? data.status : current.status;

    await db.execute({
      sql: `UPDATE projects
            SET title = ?, description = ?, notes = ?, category = ?, status = ?, updated_at = ?
            WHERE id = ?`,
      args: [title, description, notes, category, status, now, id],
    });

    return this.getProjectById(id);
  }

  static async deleteProject(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "DELETE FROM projects WHERE id = ?",
      args: [id],
    });
    return res.rowsAffected > 0;
  }
}