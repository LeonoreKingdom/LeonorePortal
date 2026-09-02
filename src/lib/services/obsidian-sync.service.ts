import { ObsidianExportService } from "@/lib/services/obsidian-export.service";
import { ObsidianImportService } from "@/lib/services/obsidian-import.service";
import { ObsidianService } from "@/lib/services/obsidian.service";

export interface FullSyncResult {
  success: boolean;
  durationMs: number;
  pushedCount: number;
  pulledCount: number;
  unchangedCount: number;
  timestamp: string;
  errors: string[];
  summary: string;
}

export class ObsidianSyncEngine {
  static async runBidirectionalSync(
    selectedProjectIds?: string[],
    selectedWikiSlugs?: string[]
  ): Promise<FullSyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    // Step 1: Export to Vault
    const exportRes = await ObsidianExportService.exportAllToVault(selectedProjectIds, selectedWikiSlugs);
    if (!exportRes.success) {
      errors.push(...exportRes.errors);
    }

    // Step 2: Import from Vault
    const importRes = await ObsidianImportService.importFromVault();
    if (!importRes.success) {
      errors.push(...importRes.errors);
    }

    const durationMs = Date.now() - startTime;
    const now = new Date().toISOString();
    const pushedCount = exportRes.filesExported;
    const pulledCount = importRes.projectsImported + importRes.wikiImported;
    const success = errors.length === 0;

    const summary = `Sinkronisasi dua arah selesai dalam ${durationMs}ms. Ekspor: ${pushedCount} file, Impor: ${pulledCount} entitas.`;

    await ObsidianService.addSyncLog({
      timestamp: now,
      action: "full_sync",
      summary,
      filesAffected: pushedCount + pulledCount,
      status: success ? "success" : "warning",
    });

    await ObsidianService.updateVaultConfig({ lastSuccessfulSync: now });

    return {
      success,
      durationMs,
      pushedCount,
      pulledCount,
      unchangedCount: Math.max(0, importRes.filesScanned - pulledCount),
      timestamp: now,
      errors,
      summary,
    };
  }
}