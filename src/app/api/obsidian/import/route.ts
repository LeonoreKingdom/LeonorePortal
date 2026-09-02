import { NextRequest, NextResponse } from "next/server";
import { ObsidianImportService } from "@/lib/services/obsidian-import.service";

export async function POST() {
  try {
    const result = await ObsidianImportService.importFromVault();
    return NextResponse.json({
      success: result.success,
      data: result,
      message: `Berhasil mengimpor ${result.projectsImported} proyek dan ${result.wikiImported} artikel dari Vault Obsidian`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan impor dari Vault" },
      { status: 500 }
    );
  }
}