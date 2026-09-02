import { NextRequest, NextResponse } from "next/server";
import { ObsidianService } from "@/lib/services/obsidian.service";

export async function GET() {
  try {
    const config = await ObsidianService.getVaultConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil konfigurasi vault" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await ObsidianService.updateVaultConfig(body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Konfigurasi Vault Obsidian berhasil diperbarui",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui konfigurasi vault" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}