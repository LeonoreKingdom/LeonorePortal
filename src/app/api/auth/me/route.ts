import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("leonore_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    try {
      const parsed = JSON.parse(sessionCookie);
      const freshUser = await UserService.getUserById(parsed.id);
      if (!freshUser) {
        return NextResponse.json({ success: false, user: null }, { status: 401 });
      }
      return NextResponse.json({ success: true, user: freshUser });
    } catch {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}