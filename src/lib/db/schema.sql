-- Schema Migrations for LeonorePortal Database

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

CREATE TABLE IF NOT EXISTS wiki_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'BookOpen',
  description TEXT,
  created_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS obsidian_synced_items (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL, -- 'project' | 'wiki'
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  vault_relative_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  last_synced_at TEXT NOT NULL,
  sync_status TEXT DEFAULT 'synced',
  direction TEXT DEFAULT 'bidirectional'
);

CREATE TABLE IF NOT EXISTS obsidian_sync_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  files_affected INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON wiki_articles(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_obsidian_items ON obsidian_synced_items(source_type, source_id);