import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/lib/services/task.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { notesMarkdown } = body;

    const updated = await TaskService.updateTask(id, { notesMarkdown });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Catatan tugas berhasil disimpan",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan catatan tugas" },
      { status: 500 }
    );
  }
}