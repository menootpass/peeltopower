import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username wajib diisi" },
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
        action: "getUserProfilePhoto",
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

      if (response.ok && data.success !== false) {
        return NextResponse.json(
          {
            success: true,
            profilePhoto: data.profilePhoto || "",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: true,
            profilePhoto: "",
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
      return NextResponse.json(
        {
          success: true,
          profilePhoto: "",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error in profile-photo-by-username route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil foto profil" },
      { status: 500 }
    );
  }
}

