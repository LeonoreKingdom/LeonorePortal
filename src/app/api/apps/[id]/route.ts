import { NextRequest, NextResponse } from "next/server";
import { AppService } from "@/lib/services/app.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const app = await AppService.getAppById(id);
    if (!app) {
      return NextResponse.json({ success: false, error: "Aplikasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: app });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal mengambil aplikasi" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await AppService.updateApp(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Aplikasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui aplikasi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await AppService.deleteApp(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Aplikasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Aplikasi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menghapus aplikasi" }, { status: 500 });
  }
}