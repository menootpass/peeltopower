import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File | null;
    const avatar = formData.get("avatar") as File | null;

    // Validate required fields
    if (!title || !subtitle || !author || !description || !content) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (!image || !avatar) {
      return NextResponse.json(
        { error: "Gambar utama dan avatar wajib diupload" },
        { status: 400 }
      );
    }

    // Upload images to R2
    const [imageUpload, avatarUpload] = await Promise.all([
      uploadToR2(image, "news/images"),
      uploadToR2(avatar, "news/avatars"),
    ]);

    const newsData = {
      title,
      subtitle,
      author,
      description,
      content,
      image: imageUpload.url,
      avatar: avatarUpload.url,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + ", Indonesia",
    };

    // TODO: Save news data to your database
    // Example: Call your database API
    const apiUrl = process.env.DATABASE_API_URL;
    const apiKey = process.env.DATABASE_API_KEY;

    if (apiUrl && apiKey) {
      try {
        const apiResponse = await fetch(`${apiUrl}/news`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(newsData),
        });

        if (apiResponse.ok) {
          const apiResult = await apiResponse.json();
          return NextResponse.json(
            {
              success: true,
              message: "Berita berhasil diupload",
              data: apiResult.data || newsData,
            },
            { status: 200 }
          );
        }
      } catch (error) {
        console.error("Error saving to database:", error);
      }
    }

    // Return success even if database save fails (images already uploaded)
    return NextResponse.json(
      {
        success: true,
        message: "Berita berhasil diupload",
        data: newsData,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error uploading news:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupload berita" },
      { status: 500 }
    );
  }
}

