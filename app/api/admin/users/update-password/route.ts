import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan password baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Verify current password first
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      // First verify current password
      const verifyResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email: user.email,
          password: currentPassword,
        }),
        redirect: "follow",
      });

      const verifyResponseText = await verifyResponse.text();
      let verifyData;

      try {
        verifyData = JSON.parse(verifyResponseText);
      } catch (parseError) {
        console.error("Failed to parse verify response:", verifyResponseText);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 }
        );
      }

      if (!verifyResponse.ok || !verifyData.valid) {
        return NextResponse.json(
          { error: "Password lama salah" },
          { status: 401 }
        );
      }

      // Update password
      const updateResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updatePassword",
          email: user.email,
          newPassword: newPassword,
        }),
        redirect: "follow",
      });

      const updateResponseText = await updateResponse.text();
      let updateData;

      try {
        updateData = JSON.parse(updateResponseText);
      } catch (parseError) {
        console.error("Failed to parse update response:", updateResponseText);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 }
        );
      }

      if (updateResponse.ok && updateData.success) {
        return NextResponse.json(
          {
            success: true,
            message: "Password berhasil diupdate",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: updateData.error || "Gagal mengupdate password" },
          { status: updateResponse.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error updating password in Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengupdate password" },
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

    console.error("Error in update-password route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate password" },
      { status: 500 }
    );
  }
}

