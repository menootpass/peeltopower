import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { email, username, password, profilePhoto } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, Username, dan Password wajib diisi" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      const requestBody = {
        action: "addAdmin",
        email: email.trim(),
        username: username.trim(),
        password: password,
        profilePhoto: profilePhoto || "/img/defaultProfile.png",
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
            message: "Admin berhasil ditambahkan",
            user: data.user,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal menambahkan admin" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error adding admin in Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat menambahkan admin" },
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

    console.error("Error in add-admin route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan admin" },
      { status: 500 }
    );
  }
}

