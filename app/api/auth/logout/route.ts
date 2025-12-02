import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Delete session cookie
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return NextResponse.json(
      {
        success: true,
        message: "Logout berhasil",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}


