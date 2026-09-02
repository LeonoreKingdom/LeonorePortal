import { ensureDbInitialized } from "@/lib/db";
import { 
  ObsidianVaultConfig, 
  SyncedFileItem, 
  SyncLogItem, 
  INITIAL_VAULT_CONFIG 
} from "@/data/mock-obsidian";

export class ObsidianService {
  static async getVaultConfig(): Promise<ObsidianVaultConfig> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT * FROM obsidian_vault_config WHERE id = 'default'");
    const row = res.rows[0];
    if (!row) return INITIAL_VAULT_CONFIG;

    return {
      vaultPath: String(row.vault_path),
      autoSync: Boolean(row.auto_sync),
      syncIntervalMinutes: Number(row.sync_interval_minutes),
      conflictResolution: String(row.conflict_resolution) as any,
      syncProjects: true,
      syncWiki: true,
      includeFrontmatter: Boolean(row.include_frontmatter),
      lastSuccessfulSync: row.last_synced_at ? String(row.last_synced_at) : new Date().toISOString(),
    };
  }

  static async updateVaultConfig(data: Partial<ObsidianVaultConfig>): Promise<ObsidianVaultConfig> {
    const db = await ensureDbInitialized();
    const current = await this.getVaultConfig();
    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE obsidian_vault_config
            SET vault_path = ?, auto_sync = ?, sync_interval_minutes = ?,
                conflict_resolution = ?, include_frontmatter = ?,
                last_synced_at = ?, updated_at = ?
            WHERE id = 'default'`,
      args: [
        data.vaultPath !== undefined ? data.vaultPath : current.vaultPath,
        (data.autoSync !== undefined ? data.autoSync : current.autoSync) ? 1 : 0,
        data.syncIntervalMinutes !== undefined ? data.syncIntervalMinutes : current.syncIntervalMinutes,
        data.conflictResolution !== undefined ? data.conflictResolution : current.conflictResolution,
        (data.includeFrontmatter !== undefined ? data.includeFrontmatter : current.includeFrontmatter) ? 1 : 0,
        data.lastSuccessfulSync !== undefined ? data.lastSuccessfulSync : current.lastSuccessfulSync,
        now,
      ],
    });

    return this.getVaultConfig();
  }

  static async getSyncedItems(): Promise<SyncedFileItem[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT * FROM obsidian_synced_items ORDER BY last_synced_at DESC");

    return res.rows.map((r) => ({
      id: String(r.id),
      sourceType: (r.source_type as any) || "project",
      sourceId: String(r.source_id),
      title: String(r.title),
      vaultRelativePath: String(r.vault_relative_path),
      fileSize: Number(r.file_size || 0),
      lastSyncedAt: String(r.last_synced_at),
      syncStatus: (r.sync_status as any) || "synced",
      direction: (r.direction as any) || "bidirectional",
    }));
  }

  static async updateItemDirection(id: string, direction: "bidirectional" | "export_only" | "import_only"): Promise<boolean> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "UPDATE obsidian_synced_items SET direction = ? WHERE id = ?",
      args: [direction, id],
    });
    return res.rowsAffected > 0;
  }

  static async batchUpdateItems(items: { id: string; direction?: string; syncStatus?: string }[]): Promise<boolean> {
    const db = await ensureDbInitialized();
    for (const item of items) {
      await db.execute({
        sql: `UPDATE obsidian_synced_items
              SET direction = COALESCE(?, direction),
                  sync_status = COALESCE(?, sync_status)
              WHERE id = ?`,
        args: [item.direction || null, item.syncStatus || null, item.id],
      });
    }
    return true;
  }

  static async getSyncLogs(): Promise<SyncLogItem[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT * FROM obsidian_sync_logs ORDER BY timestamp DESC LIMIT 30");

    return res.rows.map((r) => ({
      id: String(r.id),
      timestamp: String(r.timestamp),
      action: (r.action as any) || "full_sync",
      summary: String(r.summary),
      filesAffected: Number(r.files_affected || 0),
      status: (r.status as any) || "success",
    }));
  }

  static async addSyncLog(log: Omit<SyncLogItem, "id">): Promise<SyncLogItem> {
    const db = await ensureDbInitialized();
    const id = `log-${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO obsidian_sync_logs (id, timestamp, action, summary, files_affected, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, log.timestamp, log.action, log.summary, log.filesAffected, log.status],
    });

    return { id, ...log };
  }
}