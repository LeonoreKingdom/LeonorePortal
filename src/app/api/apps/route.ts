import { NextRequest, NextResponse } from "next/server";
import { AppService } from "@/lib/services/app.service";

export async function GET() {
  try {
    const apps = await AppService.getAllApps();
    return NextResponse.json({ success: true, data: apps });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar aplikasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name && !body.title) {
      return NextResponse.json(
        { success: false, error: "Nama aplikasi wajib diisi" },
        { status: 400 }
      );
    }
    const created = await AppService.createApp(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan aplikasi" },
      { status: 500 }
    );
  }
}