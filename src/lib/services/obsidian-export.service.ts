import fs from "fs";
import path from "path";
import { ProjectService } from "@/lib/services/project.service";
import { WikiService } from "@/lib/services/wiki.service";
import { ObsidianService } from "@/lib/services/obsidian.service";
import { ProjectItem } from "@/data/mock-projects";
import { WikiPageItem } from "@/data/mock-wiki";

export interface ExportResult {
  success: boolean;
  filesExported: number;
  vaultPath: string;
  exportedItems: { title: string; relativePath: string; size: number }[];
  errors: string[];
}

export class ObsidianExportService {
  static formatProjectMarkdown(project: ProjectItem, includeFrontmatter: boolean = true): string {
    let md = "";

    if (includeFrontmatter) {
      const createdDate = project.createdAt ? project.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      md += `---
type: project
status: ${project.status || "active"}
category: ${project.category || "Development"}
priority: ${project.priority || "medium"}
created: ${createdDate}
tags:
  - project
  - ${(project.category || "development").toLowerCase().replace(/\s+/g, "-")}
---\n\n`;
    }

    md += `# ${project.title}\n\n`;

    if (project.description) {
      md += `> ${project.description}\n\n`;
    }

    if (project.tasks && project.tasks.length > 0) {
      md += `## Papan Tugas (Kanban)\n\n`;

      const todoTasks = project.tasks.filter((t) => t.status === "todo");
      const doingTasks = project.tasks.filter((t) => t.status === "doing");
      const doneTasks = project.tasks.filter((t) => t.status === "done");

      if (todoTasks.length > 0) {
        md += `### ⏳ Todo (${todoTasks.length})\n`;
        todoTasks.forEach((t) => {
          md += `- [ ] **${t.title}**${t.priority ? ` [priority:: ${t.priority}]` : ""}${t.dueDate ? ` [due:: ${t.dueDate}]` : ""}\n`;
          if (t.notesMarkdown) {
            md += `  - ${t.notesMarkdown.replace(/\n/g, "\n  - ")}\n`;
          }
        });
        md += "\n";
      }

      if (doingTasks.length > 0) {
        md += `### 🚀 Sedang Dikerjakan (${doingTasks.length})\n`;
        doingTasks.forEach((t) => {
          md += `- [/] **${t.title}**${t.priority ? ` [priority:: ${t.priority}]` : ""}${t.dueDate ? ` [due:: ${t.dueDate}]` : ""}\n`;
          if (t.notesMarkdown) {
            md += `  - ${t.notesMarkdown.replace(/\n/g, "\n  - ")}\n`;
          }
        });
        md += "\n";
      }

      if (doneTasks.length > 0) {
        md += `### ✅ Selesai (${doneTasks.length})\n`;
        doneTasks.forEach((t) => {
          md += `- [x] **${t.title}**${t.priority ? ` [priority:: ${t.priority}]` : ""}\n`;
          if (t.notesMarkdown) {
            md += `  - ${t.notesMarkdown.replace(/\n/g, "\n  - ")}\n`;
          }
        });
        md += "\n";
      }
    }

    if (project.notesMarkdown) {
      md += `## Catatan & Ringkasan Proyek\n\n${project.notesMarkdown.trim()}\n\n`;
    }

    return md;
  }

  static formatWikiMarkdown(
    article: WikiPageItem,
    categoryName: string = "General",
    includeFrontmatter: boolean = true
  ): string {
    let md = "";

    if (includeFrontmatter) {
      const createdDate = article.createdAt ? article.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      md += `---
type: resource
category: ${categoryName}
created: ${createdDate}
tags:
  - knowledge
  - ${categoryName.toLowerCase().replace(/\s+/g, "-")}
---\n\n`;
    }

    md += article.contentMarkdown || `# ${article.title}\n\n`;
    return md;
  }

  static async exportAllToVault(selectedProjectIds?: string[], selectedWikiSlugs?: string[]): Promise<ExportResult> {
    const config = await ObsidianService.getVaultConfig();
    const vaultPath = path.normalize(config.vaultPath);
    const errors: string[] = [];
    const exportedItems: { title: string; relativePath: string; size: number }[] = [];

    try {
      if (!fs.existsSync(vaultPath)) {
        fs.mkdirSync(vaultPath, { recursive: true });
      }
    } catch (err: any) {
      return {
        success: false,
        filesExported: 0,
        vaultPath,
        exportedItems: [],
        errors: [`Gagal membuat atau mengakses direktori Vault: ${err.message}`],
      };
    }

    const projectsDir = path.join(vaultPath, "1_Projects");
    const wikiDir = path.join(vaultPath, "3_Resources");

    if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });
    if (!fs.existsSync(wikiDir)) fs.mkdirSync(wikiDir, { recursive: true });

    const allProjects = await ProjectService.getAllProjects();
    const projectsToExport = selectedProjectIds
      ? allProjects.filter((p) => selectedProjectIds.includes(p.id))
      : allProjects;

    for (const proj of projectsToExport) {
      try {
        const content = this.formatProjectMarkdown(proj, config.includeFrontmatter);
        const fileName = `${proj.title.replace(/[\\/:*?"<>|]/g, "_").trim()}.md`;
        const filePath = path.join(projectsDir, fileName);
        const relPath = path.join("1_Projects", fileName);

        fs.writeFileSync(filePath, content, "utf-8");
        exportedItems.push({
          title: proj.title,
          relativePath: relPath.replace(/\\/g, "/"),
          size: Buffer.byteLength(content, "utf-8"),
        });
      } catch (err: any) {
        errors.push(`Gagal mengekspor proyek '${proj.title}': ${err.message}`);
      }
    }

    const categories = await WikiService.getAllCategories();
    const allArticles = await WikiService.getAllArticles();
    const articlesToExport = selectedWikiSlugs
      ? allArticles.filter((a) => selectedWikiSlugs.includes(a.slug))
      : allArticles;

    for (const art of articlesToExport) {
      try {
        const cat = categories.find((c) => c.id === art.categoryId);
        const catName = cat ? cat.name.replace(/[\\/:*?"<>|]/g, "_").trim() : "General";
        const catDir = path.join(wikiDir, catName);

        if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

        const content = this.formatWikiMarkdown(art, catName, config.includeFrontmatter);
        const fileName = `${art.title.replace(/[\\/:*?"<>|]/g, "_").trim()}.md`;
        const filePath = path.join(catDir, fileName);
        const relPath = path.join("3_Resources", catName, fileName);

        fs.writeFileSync(filePath, content, "utf-8");
        exportedItems.push({
          title: art.title,
          relativePath: relPath.replace(/\\/g, "/"),
          size: Buffer.byteLength(content, "utf-8"),
        });
      } catch (err: any) {
        errors.push(`Gagal mengekspor artikel '${art.title}': ${err.message}`);
      }
    }

    await ObsidianService.addSyncLog({
      timestamp: new Date().toISOString(),
      action: "push_to_vault",
      summary: `Ekspor ${exportedItems.length} berkas markdown ke Vault Obsidian selesai.`,
      filesAffected: exportedItems.length,
      status: errors.length === 0 ? "success" : "warning",
    });

    await ObsidianService.updateVaultConfig({ lastSuccessfulSync: new Date().toISOString() });

    return {
      success: errors.length === 0,
      filesExported: exportedItems.length,
      vaultPath,
      exportedItems,
      errors,
    };
  }
}