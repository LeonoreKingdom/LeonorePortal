import { NextRequest, NextResponse } from "next/server";
import { ObsidianService } from "@/lib/services/obsidian.service";

export async function GET() {
  try {
    const items = await ObsidianService.getSyncedItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar berkas sinkron" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, id, direction } = body;

    if (id && direction) {
      const ok = await ObsidianService.updateItemDirection(id, direction);
      return NextResponse.json({ success: ok, message: "Arah sinkronisasi berkas berhasil diperbarui" });
    }

    if (Array.isArray(items)) {
      const ok = await ObsidianService.batchUpdateItems(items);
      return NextResponse.json({ success: ok, message: "Preferensi sinkronisasi berhasil disimpan" });
    }

    return NextResponse.json(
      { success: false, error: "Format request tidak sesuai" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui preferensi sinkronisasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}