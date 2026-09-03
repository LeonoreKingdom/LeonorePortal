import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await UserService.authenticate(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${user.displayName}!`,
      user,
    });

    // Set auth cookie
    response.cookies.set("leonore_session", JSON.stringify(user), {
      httpOnly: false, // readable by client-side auth context
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan proses login." },
      { status: 500 }
    );
  }
}