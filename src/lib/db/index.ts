import { createClient, Client } from "@libsql/client";
import { MOCK_PROJECTS } from "@/data/mock-projects";
import { MOCK_CATEGORIES, MOCK_WIKI_PAGES } from "@/data/mock-wiki";
import { MOCK_APPS } from "@/data/mock-apps";
import { INITIAL_VAULT_CONFIG, MOCK_SYNCED_FILES, MOCK_SYNC_LOGS } from "@/data/mock-obsidian";

let clientInstance: Client | null = null;
let initialized = false;

export function getDb(): Client {
  if (clientInstance) return clientInstance;

  const url = process.env.TURSO_DATABASE_URL || "file:data/leonore.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  clientInstance = createClient({
    url,
    authToken,
  });

  return clientInstance;
}

export async function ensureDbInitialized(): Promise<Client> {
  const db = getDb();
  if (initialized) return db;

  try {
    // Create Tables if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        category TEXT DEFAULT 'Development',
        status TEXT DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        column_id TEXT NOT NULL DEFAULT 'todo',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        notes TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wiki_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#6366f1',
        icon TEXT DEFAULT 'BookOpen',
        description TEXT,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wiki_articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id TEXT NOT NULL,
        tags TEXT,
        read_time TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES wiki_categories(id) ON DELETE CASCADE
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS portal_apps (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        category TEXT DEFAULT 'Productivity',
        icon TEXT DEFAULT 'Globe',
        color TEXT DEFAULT '#6366f1',
        status TEXT DEFAULT 'online',
        is_internal INTEGER DEFAULT 1,
        is_favorite INTEGER DEFAULT 0,
        tags TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS obsidian_vault_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        vault_path TEXT NOT NULL,
        auto_sync INTEGER DEFAULT 1,
        sync_interval_minutes INTEGER DEFAULT 5,
        conflict_resolution TEXT DEFAULT 'prefer_portal',
        include_frontmatter INTEGER DEFAULT 1,
        last_synced_at TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS obsidian_synced_items (
        id TEXT PRIMARY KEY,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        title TEXT NOT NULL,
        vault_relative_path TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        last_synced_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'synced',
        direction TEXT DEFAULT 'bidirectional'
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS obsidian_sync_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        summary TEXT NOT NULL,
        files_affected INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        details TEXT
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        display_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Ensure default master admin exists
    const userCheck = await db.execute({
      sql: "SELECT count(*) as count FROM users WHERE username = ?",
      args: ["leonorexyz"],
    });
    if (Number(userCheck.rows[0]?.count || 0) === 0) {
      await db.execute({
        sql: `INSERT INTO users (id, username, password, role, display_name, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          "usr-admin-default",
          "leonorexyz",
          "leonorekingdom",
          "admin",
          "Leonore Administrator",
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      });
    }

    // Check if seeded
    const projectRes = await db.execute("SELECT count(*) as count FROM projects");
    const count = Number(projectRes.rows[0]?.count || 0);

    if (count === 0) {
      await seedDatabase(db);
    }

    initialized = true;
  } catch (err) {
    console.error("Database initialization error:", err);
  }

  return db;
}

async function seedDatabase(db: Client) {
  // Seed Projects & Tasks
  for (const p of MOCK_PROJECTS) {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.status === "done").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await db.execute({
      sql: `INSERT INTO projects (id, title, description, notes, category, status, progress, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.title, p.description, p.notesMarkdown, p.category, p.status, progress, "medium", p.createdAt, p.updatedAt],
    });

    for (let idx = 0; idx < p.tasks.length; idx++) {
      const t = p.tasks[idx];
      await db.execute({
        sql: `INSERT INTO tasks (id, project_id, title, description, column_id, priority, due_date, notes, sort_order, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [t.id, p.id, t.title, t.notesMarkdown || "", t.status, t.priority || "medium", t.dueDate || null, t.notesMarkdown || null, t.sortOrder || idx, t.createdAt, t.updatedAt],
      });
    }
  }

  // Seed Wiki Categories & Articles
  for (const cat of MOCK_CATEGORIES) {
    await db.execute({
      sql: `INSERT INTO wiki_categories (id, name, slug, color, icon, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [cat.id, cat.name, cat.name.toLowerCase().replace(/\s+/g, "-"), cat.color, cat.icon, cat.description, new Date().toISOString()],
    });
  }

  for (const art of MOCK_WIKI_PAGES) {
    await db.execute({
      sql: `INSERT INTO wiki_articles (id, slug, title, content, category_id, tags, read_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [art.id, art.slug, art.title, art.contentMarkdown, art.categoryId, JSON.stringify(art.tags), "3 mnt", art.createdAt, art.updatedAt],
    });
  }

  // Seed Apps
  for (let idx = 0; idx < MOCK_APPS.length; idx++) {
    const app = MOCK_APPS[idx];
    await db.execute({
      sql: `INSERT INTO portal_apps (id, title, description, url, category, icon, color, status, is_internal, is_favorite, tags, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [app.id, app.name, app.description, app.url, app.category, app.icon, "#6366f1", app.status, 1, app.isPinned ? 1 : 0, JSON.stringify(app.tags), app.sortOrder || idx, new Date().toISOString()],
    });
  }

  // Seed Obsidian Config & items
  await db.execute({
    sql: `INSERT INTO obsidian_vault_config (id, vault_path, auto_sync, sync_interval_minutes, conflict_resolution, include_frontmatter, last_synced_at, updated_at)
          VALUES ('default', ?, ?, ?, ?, ?, ?, ?)`,
    args: [INITIAL_VAULT_CONFIG.vaultPath, INITIAL_VAULT_CONFIG.autoSync ? 1 : 0, INITIAL_VAULT_CONFIG.syncIntervalMinutes, INITIAL_VAULT_CONFIG.conflictResolution, INITIAL_VAULT_CONFIG.includeFrontmatter ? 1 : 0, INITIAL_VAULT_CONFIG.lastSuccessfulSync, new Date().toISOString()],
  });

  for (const item of MOCK_SYNCED_FILES) {
    await db.execute({
      sql: `INSERT INTO obsidian_synced_items (id, source_type, source_id, title, vault_relative_path, file_size, last_synced_at, sync_status, direction)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [item.id, item.sourceType, item.sourceId, item.title, item.vaultRelativePath, item.fileSize, item.lastSyncedAt, item.syncStatus, item.direction],
    });
  }

  for (const log of MOCK_SYNC_LOGS) {
    await db.execute({
      sql: `INSERT INTO obsidian_sync_logs (id, timestamp, action, summary, files_affected, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [log.id, log.timestamp, log.action, log.summary, log.filesAffected, log.status, null],
    });
  }
}