import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

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

    // Get old profile photo URL before uploading new one
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    let oldProfilePhotoUrl: string | null = null;
    try {
      // Get current profile photo
      const getPhotoResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getUserProfilePhoto",
          username: username.trim(),
        }),
        redirect: "follow",
      });

      if (getPhotoResponse.ok) {
        const getPhotoText = await getPhotoResponse.text();
        try {
          const getPhotoData = JSON.parse(getPhotoText);
          if (getPhotoData.success !== false && getPhotoData.profilePhoto) {
            oldProfilePhotoUrl = getPhotoData.profilePhoto;
            console.log("Found old profile photo URL:", oldProfilePhotoUrl);
          }
        } catch (e) {
          console.log("No old profile photo found or failed to parse response");
        }
      }
    } catch (error) {
      console.log("Error fetching old profile photo (continuing anyway):", error);
    }

    // Upload new photo to R2 in profile-photos folder
    const { url } = await uploadToR2(file, "profile-photos");

    // Update user profile photo in Apps Script
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
        // Delete old profile photo from R2 after successful update
        if (oldProfilePhotoUrl && oldProfilePhotoUrl.trim() && oldProfilePhotoUrl !== url) {
          try {
            console.log("Deleting old profile photo from R2:", oldProfilePhotoUrl);
            const deleteResult = await deleteFromR2(oldProfilePhotoUrl);
            if (deleteResult) {
              console.log("Successfully deleted old profile photo from R2");
            } else {
              console.warn("Failed to delete old profile photo from R2 (non-critical)");
            }
          } catch (deleteError) {
            console.error("Error deleting old profile photo (non-critical):", deleteError);
            // Don't fail the request if deletion fails
          }
        }

        return NextResponse.json(
          {
            success: true,
            message: "Profile photo berhasil diupdate",
            url: url,
          },
          { status: 200 }
        );
      } else {
        // If update failed, try to delete the newly uploaded file to avoid orphaned files
        try {
          console.log("Update failed, cleaning up newly uploaded file:", url);
          await deleteFromR2(url);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded file:", cleanupError);
        }

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

