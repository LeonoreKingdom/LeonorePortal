import { NextRequest, NextResponse } from "next/server";
import { AppService } from "@/lib/services/app.service";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("leonore_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "401 Unauthorized: Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    try {
      const session = JSON.parse(sessionCookie);
      if (session.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "403 Forbidden: Hanya admin yang dapat mengubah urutan aplikasi" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "401 Unauthorized: Sesi tidak valid" },
        { status: 401 }
      );
    }

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
