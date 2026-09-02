import { NextRequest, NextResponse } from "next/server";
import { ObsidianExportService } from "@/lib/services/obsidian-export.service";

export async function POST(req: NextRequest) {
  try {
    let selectedProjectIds: string[] | undefined;
    let selectedWikiSlugs: string[] | undefined;

    try {
      const body = await req.json();
      if (body) {
        selectedProjectIds = body.projectIds;
        selectedWikiSlugs = body.wikiSlugs;
      }
    } catch {
      // Body is optional
    }

    const result = await ObsidianExportService.exportAllToVault(selectedProjectIds, selectedWikiSlugs);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `Berhasil mengekspor ${result.filesExported} berkas Markdown ke Vault Obsidian`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan ekspor ke Vault" },
      { status: 500 }
    );
  }
}