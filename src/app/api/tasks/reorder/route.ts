import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/lib/services/task.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { success: false, error: "Format payload tasks harus berupa array" },
        { status: 400 }
      );
    }

    await TaskService.batchReorderTasks(tasks);
    return NextResponse.json({ success: true, message: "Urutan tugas berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui urutan tugas" },
      { status: 500 }
    );
  }
}