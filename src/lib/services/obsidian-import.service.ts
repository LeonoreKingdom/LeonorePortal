import fs from "fs";
import path from "path";
import { ProjectService } from "@/lib/services/project.service";
import { WikiService } from "@/lib/services/wiki.service";
import { TaskService } from "@/lib/services/task.service";
import { ObsidianService } from "@/lib/services/obsidian.service";
import { TaskItem } from "@/data/mock-projects";

export interface ImportResult {
  success: boolean;
  filesScanned: number;
  projectsImported: number;
  wikiImported: number;
  errors: string[];
}

export class ObsidianImportService {
  static parseMarkdownFile(content: string): { metadata: Record<string, any>; body: string } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { metadata: {}, body: content };
    }

    const yamlBlock = match[1];
    const body = content.slice(match[0].length);
    const metadata: Record<string, any> = {};

    yamlBlock.split("\n").forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const rawVal = parts.slice(1).join(":").trim().replace(/^["']|["']$/g, "");
        let parsedVal: any = rawVal;

        if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
          try {
            parsedVal = JSON.parse(rawVal.replace(/'/g, '"'));
          } catch {
            parsedVal = rawVal
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""));
          }
        }
        metadata[key] = parsedVal;
      }
    });

    return { metadata, body };
  }

  static extractTasksFromProjectMarkdown(body: string, projectId: string): Partial<TaskItem>[] {
    const tasks: Partial<TaskItem>[] = [];
    const lines = body.split("\n");

    let currentColumn: "todo" | "doing" | "done" = "todo";

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.toLowerCase().includes("todo") || trimmed.toLowerCase().includes("⏳")) {
        currentColumn = "todo";
      } else if (trimmed.toLowerCase().includes("sedang") || trimmed.toLowerCase().includes("doing") || trimmed.toLowerCase().includes("🚀")) {
        currentColumn = "doing";
      } else if (trimmed.toLowerCase().includes("selesai") || trimmed.toLowerCase().includes("done") || trimmed.toLowerCase().includes("✅")) {
        currentColumn = "done";
      }

      const checkMatch = trimmed.match(/^-\s*\[([ xX/])\]\s+(.*)/);
      if (checkMatch) {
        const mark = checkMatch[1].toLowerCase();
        let titleAndMeta = checkMatch[2];

        const status: "todo" | "doing" | "done" =
          mark === "x" ? "done" : mark === "/" ? "doing" : currentColumn;

        let priority: "low" | "medium" | "high" = "medium";
        const priorityMatch = titleAndMeta.match(/\[priority::\s*(\w+)\]/i);
        if (priorityMatch) {
          priority = (priorityMatch[1].toLowerCase() as any) || "medium";
          titleAndMeta = titleAndMeta.replace(priorityMatch[0], "").trim();
        }

        let dueDate: string | undefined;
        const dueMatch = titleAndMeta.match(/\[due::\s*([\d-]+)\]/i);
        if (dueMatch) {
          dueDate = dueMatch[1];
          titleAndMeta = titleAndMeta.replace(dueMatch[0], "").trim();
        }

        const title = titleAndMeta.replace(/^\*\*|\*\*$/g, "").trim();

        tasks.push({
          projectId,
          title: title || "Tugas Tanpa Judul",
          status,
          priority,
          dueDate,
        });
      }
    }

    return tasks;
  }

  static getMarkdownFilesRecursive(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file.startsWith(".")) continue;
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getMarkdownFilesRecursive(filePath));
      } else if (file.endsWith(".md")) {
        results.push(filePath);
      }
    }
    return results;
  }

  static async importFromVault(): Promise<ImportResult> {
    const config = await ObsidianService.getVaultConfig();
    const vaultPath = path.normalize(config.vaultPath);
    const errors: string[] = [];

    if (!fs.existsSync(vaultPath)) {
      // Cloud environment / serverless container without local drive D:\
      return {
        success: true,
        filesScanned: 0,
        projectsImported: 0,
        wikiImported: 0,
        errors: [],
      };
    }

    const mdFiles = this.getMarkdownFilesRecursive(vaultPath);
    let projectsCount = 0;
    let wikiCount = 0;

    for (const file of mdFiles) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const { metadata, body } = this.parseMarkdownFile(content);
        const fileName = path.basename(file, ".md");
        const relPath = path.relative(vaultPath, file);

        const normalizedRel = relPath.replace(/\\/g, "/");

        const isProject =
          normalizedRel.startsWith("1_Projects/") ||
          metadata.type === "project";

        const isResource =
          normalizedRel.startsWith("3_Resources/") ||
          metadata.type === "resource" ||
          metadata.type === "wiki";

        // Ignore 00_Inbox, 2_Areas, 4_Archives, root files, .obsidian, etc.
        if (!isProject && !isResource) {
          continue;
        }

        if (isProject) {
          const title = metadata.title || fileName;
          const allProjects = await ProjectService.getAllProjects();
          const existingProject = allProjects.find(
            (p) => p.title.toLowerCase() === title.toLowerCase()
          );

          let projectId = existingProject?.id;
          if (existingProject) {
            await ProjectService.updateProject(existingProject.id, {
              description: metadata.description || existingProject.description,
              notesMarkdown: body,
              category: metadata.category || existingProject.category,
              status: metadata.status || existingProject.status,
            });
          } else {
            const newProj = await ProjectService.createProject({
              title,
              description: metadata.description || `Diimpor dari Vault: ${relPath}`,
              notesMarkdown: body,
              category: metadata.category || "Development",
              status: metadata.status || "active",
            });
            projectId = newProj.id;
          }

          if (projectId) {
            const tasks = this.extractTasksFromProjectMarkdown(body, projectId);
            for (const t of tasks) {
              await TaskService.createTask(projectId, t);
            }
          }

          projectsCount++;
        } else if (isResource) {
          const title = metadata.title || fileName;
          const categoryName = metadata.category || path.basename(path.dirname(file)) || "General";
          
          const categories = await WikiService.getAllCategories();
          let targetCategoryId = "cat-1";

          const found = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
          if (found) {
            targetCategoryId = found.id;
          } else if (categoryName !== "Wiki" && categoryName !== "3_Resources") {
            const createdCat = await WikiService.createCategory({ name: categoryName });
            targetCategoryId = createdCat.id;
          }

          const allArticles = await WikiService.getAllArticles();
          const existingArticle = allArticles.find(
            (a) => a.title.toLowerCase() === title.toLowerCase()
          );

          if (existingArticle) {
            await WikiService.updateArticle(existingArticle.id, {
              contentMarkdown: body,
              tags: Array.isArray(metadata.tags) ? metadata.tags : existingArticle.tags,
            });
          } else {
            await WikiService.createArticle({
              title,
              categoryId: targetCategoryId,
              contentMarkdown: body,
              tags: Array.isArray(metadata.tags) ? metadata.tags : ["Imported", "Obsidian"],
            });
          }

          wikiCount++;
        }
      } catch (err: any) {
        errors.push(`Gagal membaca ${path.basename(file)}: ${err.message}`);
      }
    }

    await ObsidianService.addSyncLog({
      timestamp: new Date().toISOString(),
      action: "pull_from_vault",
      summary: `Impor berhasil: ${projectsCount} proyek & ${wikiCount} artikel wiki dari Vault.`,
      filesAffected: projectsCount + wikiCount,
      status: errors.length === 0 ? "success" : "warning",
    });

    await ObsidianService.updateVaultConfig({ lastSuccessfulSync: new Date().toISOString() });

    return {
      success: errors.length === 0,
      filesScanned: mdFiles.length,
      projectsImported: projectsCount,
      wikiImported: wikiCount,
      errors,
    };
  }
}