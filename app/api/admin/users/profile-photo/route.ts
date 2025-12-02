import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const username = formData.get("username") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: "Username tidak ditemukan" },
        { status: 400 }
      );
    }

    // Upload to R2 in profile-photos folder
    const { url } = await uploadToR2(file, "profile-photos");

    // Update user profile photo in Apps Script
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      const requestBody = {
        action: "updateUserProfilePhoto",
        username: username.trim(),
        profilePhoto: url,
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
            message: "Profile photo berhasil diupdate",
            url: url,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal mengupdate profile photo" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error updating profile photo in Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengupdate profile photo" },
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

    console.error("Error in profile-photo route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload profile photo" },
      { status: 500 }
    );
  }
}

