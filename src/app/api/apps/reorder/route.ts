import { NextRequest, NextResponse } from "next/server";
import { AppService } from "@/lib/services/app.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apps } = body;

    if (!Array.isArray(apps)) {
      return NextResponse.json(
        { success: false, error: "Format payload apps harus berupa array" },
        { status: 400 }
      );
    }

    await AppService.batchReorderApps(apps);
    return NextResponse.json({ success: true, message: "Urutan aplikasi berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui urutan aplikasi" },
      { status: 500 }
    );
  }
}
