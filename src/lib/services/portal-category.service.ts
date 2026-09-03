import { ensureDbInitialized } from "@/lib/db";

export interface PortalCategoryItem {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export class PortalCategoryService {
  static async getAllCategories(): Promise<PortalCategoryItem[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT * FROM portal_categories ORDER BY sort_order ASC, name ASC");

    return res.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      color: String(r.color || "#6366f1"),
      sortOrder: Number(r.sort_order || 0),
      createdAt: String(r.created_at || new Date().toISOString()),
    }));
  }

  static async getCategoryById(id: string): Promise<PortalCategoryItem | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM portal_categories WHERE id = ?",
      args: [id],
    });
    const r = res.rows[0];
    if (!r) return null;

    return {
      id: String(r.id),
      name: String(r.name),
      color: String(r.color || "#6366f1"),
      sortOrder: Number(r.sort_order || 0),
      createdAt: String(r.created_at),
    };
  }

  static async createCategory(data: { name: string; color?: string; sortOrder?: number }): Promise<PortalCategoryItem> {
    const db = await ensureDbInitialized();
    const name = data.name.trim();

    // Check duplicate
    const existing = await db.execute({
      sql: "SELECT id FROM portal_categories WHERE LOWER(name) = LOWER(?)",
      args: [name],
    });
    if (existing.rows.length > 0) {
      throw new Error(`Kategori '${name}' sudah ada.`);
    }

    const id = `cat-${Date.now()}`;
    const color = data.color || "#6366f1";
    const sortOrder = data.sortOrder || 0;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO portal_categories (id, name, color, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, name, color, sortOrder, now],
    });

    return (await this.getCategoryById(id))!;
  }

  static async updateCategory(
    id: string,
    data: { name?: string; color?: string; sortOrder?: number }
  ): Promise<PortalCategoryItem | null> {
    const db = await ensureDbInitialized();
    const current = await this.getCategoryById(id);
    if (!current) return null;

    const name = data.name !== undefined ? data.name.trim() : current.name;
    const color = data.color !== undefined ? data.color : current.color;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : current.sortOrder;

    await db.execute({
      sql: "UPDATE portal_categories SET name = ?, color = ?, sort_order = ? WHERE id = ?",
      args: [name, color, sortOrder, id],
    });

    return this.getCategoryById(id);
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "DELETE FROM portal_categories WHERE id = ?",
      args: [id],
    });
    return res.rowsAffected > 0;
  }
}