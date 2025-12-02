import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // Upload to R2
    const { url, key } = await uploadToR2(file, folder);

    return NextResponse.json(
      {
        success: true,
        url,
        key,
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

    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload file" },
      { status: 500 }
    );
  }
}


