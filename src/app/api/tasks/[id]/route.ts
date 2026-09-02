import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/lib/services/task.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const task = await TaskService.getTaskById(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil detail tugas" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await TaskService.updateTask(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui tugas" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await TaskService.deleteTask(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Tugas berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus tugas" },
      { status: 500 }
    );
  }
}