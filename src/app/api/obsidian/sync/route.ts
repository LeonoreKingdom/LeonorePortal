import { NextRequest, NextResponse } from "next/server";
import { ObsidianSyncEngine } from "@/lib/services/obsidian-sync.service";
import { ObsidianService } from "@/lib/services/obsidian.service";

export async function GET() {
  try {
    const logs = await ObsidianService.getSyncLogs();
    const config = await ObsidianService.getVaultConfig();
    const items = await ObsidianService.getSyncedItems();

    return NextResponse.json({
      success: true,
      data: {
        config,
        items,
        logs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil status sinkronisasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let projectIds: string[] | undefined;
    let wikiSlugs: string[] | undefined;

    try {
      const body = await req.json();
      if (body) {
        projectIds = body.projectIds;
        wikiSlugs = body.wikiSlugs;
      }
    } catch {
      // Optional body
    }

    const result = await ObsidianSyncEngine.runBidirectionalSync(projectIds, wikiSlugs);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menjalankan sinkronisasi dua arah" },
      { status: 500 }
    );
  }
}