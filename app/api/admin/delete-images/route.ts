import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteMultipleFromR2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required" },
        { status: 400 }
      );
    }

    try {
      console.log("Deleting images from R2:", urls);
      const deleteResults = await deleteMultipleFromR2(urls);
      const successCount = deleteResults.filter((r) => r).length;
      const failCount = urls.length - successCount;

      console.log(`Deleted ${successCount}/${urls.length} images from R2`);

      return NextResponse.json(
        {
          success: true,
          message: `Berhasil menghapus ${successCount} dari ${urls.length} gambar`,
          deleted: successCount,
          failed: failCount,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting images from R2:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat menghapus gambar" },
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

    console.error("Error in delete-images route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus gambar" },
      { status: 500 }
    );
  }
}



