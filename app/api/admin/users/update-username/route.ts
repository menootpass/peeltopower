import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { username } = body;

    if (!username || username.trim() === "") {
      return NextResponse.json(
        { error: "Username wajib diisi" },
        { status: 400 }
      );
    }

    // Update username in Apps Script
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      const requestBody = {
        action: "updateUsername",
        email: user.email,
        username: username.trim(),
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        redirect: "follow",
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Apps Script response:", responseText);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 }
        );
      }

      if (response.ok && data.success) {
        return NextResponse.json(
          {
            success: true,
            message: "Username berhasil diupdate",
            username: username.trim(),
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal mengupdate username" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error updating username in Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengupdate username" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error in update-username route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate username" },
      { status: 500 }
    );
  }
}

