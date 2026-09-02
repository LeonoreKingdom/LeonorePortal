import { ensureDbInitialized } from "@/lib/db";
import { AppItem, MOCK_APPS } from "@/data/mock-apps";

export class AppService {
  static async getAllApps(): Promise<AppItem[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT * FROM portal_apps ORDER BY sort_order ASC, created_at ASC");

    if (res.rows.length === 0) {
      return MOCK_APPS;
    }

    return res.rows.map((r: any) => {
      let parsedTags: string[] = [];
      if (r.tags) {
        try {
          parsedTags = typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags;
        } catch {
          parsedTags = String(r.tags).split(",").map((s) => s.trim());
        }
      }

      let status: AppItem["status"] = "active";
      if (r.status === "beta" || r.status === "maintenance" || r.status === "active") {
        status = r.status;
      } else if (r.status === "online") {
        status = "active";
      }

      return {
        id: String(r.id),
        name: String(r.title || r.name || "Aplikasi"),
        description: String(r.description || ""),
        url: String(r.url || "#"),
        icon: String(r.icon || "Globe"),
        category: (r.category as any) || "Utilities",
        status,
        sortOrder: Number(r.sort_order || 0),
        tags: Array.isArray(parsedTags) ? parsedTags : [],
        isPinned: Boolean(r.is_favorite || r.is_pinned || r.isPinned),
      };
    });
  }

  static async getAppById(id: string): Promise<AppItem | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM portal_apps WHERE id = ?",
      args: [id],
    });
    const r = res.rows[0];
    if (!r) return null;

    let parsedTags: string[] = [];
    if (r.tags) {
      try {
        parsedTags = typeof r.tags === "string" ? JSON.parse(String(r.tags)) : (r.tags as any);
      } catch {
        parsedTags = String(r.tags).split(",").map((s) => s.trim());
      }
    }

    let status: AppItem["status"] = "active";
    if (r.status === "beta" || r.status === "maintenance" || r.status === "active") {
      status = r.status as any;
    } else if (r.status === "online") {
      status = "active";
    }

    return {
      id: String(r.id),
      name: String(r.title || r.name || "Aplikasi"),
      description: String(r.description || ""),
      url: String(r.url || "#"),
      icon: String(r.icon || "Globe"),
      category: (r.category as any) || "Utilities",
      status,
      sortOrder: Number(r.sort_order || 0),
      tags: Array.isArray(parsedTags) ? parsedTags : [],
      isPinned: Boolean(r.is_favorite || r.is_pinned || (r as any).isPinned),
    };
  }

  static async createApp(data: Partial<AppItem>): Promise<AppItem> {
    const db = await ensureDbInitialized();
    const id = data.id || `app-${Date.now()}`;
    const name = data.name || "Aplikasi Baru";
    const tags = JSON.stringify(data.tags || ["App"]);

    await db.execute({
      sql: `INSERT INTO portal_apps (id, title, description, url, category, icon, color, status, is_internal, is_favorite, tags, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        data.description || "",
        data.url || "/",
        data.category || "Utilities",
        data.icon || "Globe",
        "#6366f1",
        data.status || "active",
        1,
        data.isPinned ? 1 : 0,
        tags,
        data.sortOrder || 0,
        new Date().toISOString(),
      ],
    });

    return (await this.getAppById(id))!;
  }

  static async updateApp(id: string, data: Partial<AppItem>): Promise<AppItem | null> {
    const db = await ensureDbInitialized();
    const current = await this.getAppById(id);
    if (!current) return null;

    const name = data.name !== undefined ? data.name : current.name;
    const description = data.description !== undefined ? data.description : current.description;
    const url = data.url !== undefined ? data.url : current.url;
    const category = data.category !== undefined ? data.category : current.category;
    const icon = data.icon !== undefined ? data.icon : current.icon;
    const status = data.status !== undefined ? data.status : current.status;
    const isPinned = data.isPinned !== undefined ? data.isPinned : current.isPinned;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : current.sortOrder;
    const tags = data.tags !== undefined ? JSON.stringify(data.tags) : JSON.stringify(current.tags);

    await db.execute({
      sql: `UPDATE portal_apps
            SET title = ?, description = ?, url = ?, category = ?, icon = ?,
                status = ?, is_favorite = ?, tags = ?, sort_order = ?
            WHERE id = ?`,
      args: [name, description, url, category, icon, status, isPinned ? 1 : 0, tags, sortOrder, id],
    });

    return this.getAppById(id);
  }

  static async deleteApp(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "DELETE FROM portal_apps WHERE id = ?",
      args: [id],
    });
    return res.rowsAffected > 0;
  }
}