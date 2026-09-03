import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil logout.",
  });

  response.cookies.set("leonore_session", "", {
    httpOnly: false,
    maxAge: 0,
    path: "/",
  });

  return response;
}