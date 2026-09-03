import { ensureDbInitialized } from "@/lib/db";
import { WikiCategory, WikiPageItem } from "@/data/mock-wiki";

export interface WikiSearchResult extends WikiPageItem {
  snippet: string;
  matchedField: "title" | "content" | "tags";
}

export class WikiService {
  static async getAllCategories(): Promise<(WikiCategory & { articleCount: number })[]> {
    const db = await ensureDbInitialized();
    const categories = await db.execute("SELECT * FROM wiki_categories ORDER BY name ASC");

    const result: (WikiCategory & { articleCount: number })[] = [];
    for (const cat of categories.rows) {
      const countRes = await db.execute({
        sql: "SELECT count(*) as count FROM wiki_articles WHERE category_id = ?",
        args: [String(cat.id)],
      });
      const count = Number(countRes.rows[0]?.count || 0);

      result.push({
        id: String(cat.id),
        name: String(cat.name),
        description: String(cat.description || ""),
        icon: String(cat.icon || "BookOpen"),
        color: String(cat.color || "#6366f1"),
        articleCount: count,
      });
    }

    return result;
  }

  static async getCategoryById(id: string): Promise<WikiCategory | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM wiki_categories WHERE id = ?",
      args: [id],
    });
    const cat = res.rows[0];
    if (!cat) return null;

    return {
      id: String(cat.id),
      name: String(cat.name),
      description: String(cat.description || ""),
      icon: String(cat.icon || "BookOpen"),
      color: String(cat.color || "#6366f1"),
    };
  }

  static async createCategory(data: Partial<WikiCategory>): Promise<WikiCategory> {
    const db = await ensureDbInitialized();
    const id = data.id || `cat-${Date.now()}`;
    const name = data.name || "Kategori Baru";
    const slug = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id;

    await db.execute({
      sql: `INSERT INTO wiki_categories (id, name, slug, color, icon, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        slug,
        data.color || "#6366f1",
        data.icon || "BookOpen",
        data.description || "",
        new Date().toISOString(),
      ],
    });

    return (await this.getCategoryById(id))!;
  }

  static async updateCategory(id: string, data: Partial<WikiCategory>): Promise<WikiCategory | null> {
    const db = await ensureDbInitialized();
    const current = await this.getCategoryById(id);
    if (!current) return null;

    const name = data.name !== undefined ? data.name : current.name;
    const description = data.description !== undefined ? data.description : current.description;
    const color = data.color !== undefined ? data.color : current.color;
    const icon = data.icon !== undefined ? data.icon : current.icon;
    const slug = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id;

    await db.execute({
      sql: `UPDATE wiki_categories
            SET name = ?, slug = ?, color = ?, icon = ?, description = ?
            WHERE id = ?`,
      args: [name, slug, color, icon, description, id],
    });

    return this.getCategoryById(id);
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "DELETE FROM wiki_categories WHERE id = ?",
      args: [id],
    });
    return res.rowsAffected > 0;
  }

  static async getAllArticles(categoryId?: string, search?: string): Promise<WikiPageItem[]> {
    const db = await ensureDbInitialized();
    let query = "SELECT * FROM wiki_articles WHERE 1=1";
    const params: any[] = [];

    if (categoryId && categoryId !== "all") {
      query += " AND category_id = ?";
      params.push(categoryId);
    }

    if (search) {
      query += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)";
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    query += " ORDER BY updated_at DESC";

    const rows = await db.execute({
      sql: query,
      args: params,
    });

    return rows.rows.map((r) => ({
      id: String(r.id),
      categoryId: String(r.category_id),
      title: String(r.title),
      slug: String(r.slug),
      contentMarkdown: String(r.content),
      tags: r.tags ? JSON.parse(String(r.tags)) : [],
      lastEditedBy: "Leonore User",
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    }));
  }

  static async searchArticles(queryStr: string, categoryId?: string, limit: number = 20): Promise<WikiSearchResult[]> {
    const db = await ensureDbInitialized();
    if (!queryStr.trim()) return [];

    let sql = `
      SELECT * FROM wiki_articles
      WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?)
    `;
    const pattern = `%${queryStr}%`;
    const params: any[] = [pattern, pattern, pattern];

    if (categoryId && categoryId !== "all") {
      sql += " AND category_id = ?";
      params.push(categoryId);
    }

    sql += " ORDER BY updated_at DESC LIMIT ?";
    params.push(limit);

    const rows = await db.execute({
      sql,
      args: params,
    });

    return rows.rows.map((r) => {
      const title = String(r.title);
      const content = String(r.content);
      const tags = r.tags ? JSON.parse(String(r.tags)) : [];

      const titleLower = title.toLowerCase();
      const contentLower = content.toLowerCase();
      const qLower = queryStr.toLowerCase();

      let matchedField: "title" | "content" | "tags" = "title";
      let snippet = "";

      if (titleLower.includes(qLower)) {
        matchedField = "title";
        snippet = content.slice(0, 160) + "...";
      } else if (contentLower.includes(qLower)) {
        matchedField = "content";
        const idx = contentLower.indexOf(qLower);
        const start = Math.max(0, idx - 60);
        const end = Math.min(content.length, idx + 100);
        snippet = (start > 0 ? "..." : "") + content.slice(start, end).replace(/\n/g, " ") + "...";
      } else {
        matchedField = "tags";
        snippet = `Cocok dengan tag artikel: ${JSON.stringify(tags)}`;
      }

      return {
        id: String(r.id),
        categoryId: String(r.category_id),
        title,
        slug: String(r.slug),
        contentMarkdown: content,
        tags,
        lastEditedBy: "Leonore User",
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
        snippet,
        matchedField,
      };
    });
  }

  static async getArticleBySlug(slug: string): Promise<WikiPageItem | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM wiki_articles WHERE slug = ?",
      args: [slug],
    });
    const r = res.rows[0];
    if (!r) return null;

    return {
      id: String(r.id),
      categoryId: String(r.category_id),
      title: String(r.title),
      slug: String(r.slug),
      contentMarkdown: String(r.content),
      tags: r.tags ? JSON.parse(String(r.tags)) : [],
      lastEditedBy: "Leonore User",
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  }

  static async generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
    const db = await ensureDbInitialized();
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug || `article-${Date.now()}`;
    let counter = 1;

    while (true) {
      const res = await db.execute({
        sql: "SELECT slug FROM wiki_articles WHERE slug = ?",
        args: [slug],
      });
      const existing = res.rows[0];
      if (!existing || existing.slug === currentSlug) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async createArticle(data: Partial<WikiPageItem>): Promise<WikiPageItem> {
    const db = await ensureDbInitialized();
    const id = data.id || `wiki-${Date.now()}`;
    const now = new Date().toISOString();
    const title = data.title || "Artikel Baru";
    const slug = data.slug || (await this.generateUniqueSlug(title));
    const categoryId = data.categoryId || "cat-1";
    const content = data.contentMarkdown || `# ${title}\n\nTulis isi dokumentasi artikel di sini...`;
    const tags = JSON.stringify(data.tags || ["General"]);

    await db.execute({
      sql: `INSERT INTO wiki_articles (id, slug, title, content, category_id, tags, read_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, slug, title, content, categoryId, tags, "3 mnt", now, now],
    });

    return (await this.getArticleBySlug(slug))!;
  }

  static async updateArticle(slug: string, data: Partial<WikiPageItem>): Promise<WikiPageItem | null> {
    const db = await ensureDbInitialized();
    const current = await this.getArticleBySlug(slug);
    if (!current) return null;

    const now = new Date().toISOString();
    const title = data.title !== undefined ? data.title : current.title;
    const content = data.contentMarkdown !== undefined ? data.contentMarkdown : current.contentMarkdown;
    const categoryId = data.categoryId !== undefined ? data.categoryId : current.categoryId;
    const tags = data.tags !== undefined ? JSON.stringify(data.tags) : JSON.stringify(current.tags);

    let targetSlug = current.slug;
    if (data.slug && data.slug !== current.slug) {
      targetSlug = await this.generateUniqueSlug(data.slug, current.slug);
    }

    await db.execute({
      sql: `UPDATE wiki_articles
            SET slug = ?, title = ?, content = ?, category_id = ?, tags = ?, updated_at = ?
            WHERE slug = ?`,
      args: [targetSlug, title, content, categoryId, tags, now, slug],
    });

    return this.getArticleBySlug(targetSlug);
  }

  static async deleteArticle(slug: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "DELETE FROM wiki_articles WHERE slug = ?",
      args: [slug],
    });
    return res.rowsAffected > 0;
  }
}