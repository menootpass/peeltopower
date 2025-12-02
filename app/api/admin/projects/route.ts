import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteMultipleFromR2, deleteFromR2 } from "@/lib/r2";

// Helper function to clean HTML by removing data-* attributes
function cleanHtmlAttributes(html: string): string {
  if (!html || typeof html !== 'string') return html;
  
  // Remove all data-* attributes using regex
  // This regex matches: data-anything="anything" or data-anything='anything'
  let cleaned = html.replace(/\s+data-[^=]*=(["'])[^"']*\1/gi, '');
  // Also handle unquoted attributes
  cleaned = cleaned.replace(/\s+data-[^=]*=[^\s>]*/gi, '');
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const body = await request.json();
    const { judul, penulis, konten, gambar } = body;

    // Validate required fields
    if (!judul || !penulis || !konten) {
      return NextResponse.json(
        { error: "Judul, Penulis, dan Konten wajib diisi" },
        { status: 400 }
      );
    }

    // Call Google Apps Script to save project
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      // Clean HTML content to remove unwanted attributes like data-path-to-node
      const cleanedKonten = cleanHtmlAttributes(konten);
      
      const requestBody = {
        action: "addProject",
        judul: judul.trim(),
        penulis: penulis.trim(),
        konten: cleanedKonten.trim(),
        gambar: gambar || [], // Array of image URLs
      };

      console.log("Sending request to Apps Script:", {
        url: apiUrl,
        body: { ...requestBody, konten: konten.substring(0, 50) + "..." }, // Log only first 50 chars of content
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        redirect: "follow",
      });

      console.log("Apps Script Response Status:", response.status);
      console.log("Apps Script Response Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Apps Script Response Text (first 500 chars):", responseText.substring(0, 500));

      let data;
      
      try {
        data = JSON.parse(responseText);
        console.log("Apps Script Response (parsed):", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("Failed to parse Apps Script response:", responseText);
        return NextResponse.json(
          { error: "Invalid response from server. Check console for details." },
          { status: 500 }
        );
      }

      if (response.ok && data.success) {
        console.log("Project saved successfully:", data.data);
        return NextResponse.json(
          {
            success: true,
            message: "Project berhasil disimpan",
            data: data.data,
          },
          { status: 200 }
        );
      } else {
        console.error("Apps Script returned error:", data.error);
        return NextResponse.json(
          { error: data.error || "Gagal menyimpan project" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error saving project to Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat menyimpan project" },
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

    console.error("Error in projects route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan project" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    try {
      const response = await fetch(
        id
          ? `${apiUrl}?action=getProject&id=${id}`
          : `${apiUrl}?action=getAllProjects`,
        {
          method: "GET",
          redirect: "follow",
        }
      );

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

      if (response.ok) {
        // Validate response structure
        if (data.projects && Array.isArray(data.projects)) {
          return NextResponse.json(data, { status: 200 });
        } else if (data.error) {
          console.error("Apps Script returned error:", data.error);
          return NextResponse.json(
            { error: data.error },
            { status: 500 }
          );
        } else {
          console.error("Invalid response structure from Apps Script:", data);
          return NextResponse.json(
            { error: "Invalid response structure from server" },
            { status: 500 }
          );
        }
      } else {
        console.error("Apps Script response not OK:", response.status, data);
        return NextResponse.json(
          { error: data.error || "Gagal mengambil data project" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error fetching projects from Apps Script:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengambil data project: " + (error instanceof Error ? error.message : String(error)) },
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

    console.error("Error in projects GET route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const body = await request.json();
    const { id, judul, penulis, konten, gambar } = body;

    // Validate required fields
    if (!id || !judul || !penulis || !konten) {
      return NextResponse.json(
        { error: "ID, Judul, Penulis, dan Konten wajib diisi" },
        { status: 400 }
      );
    }

    // Call Google Apps Script to update project
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Get existing project data to compare old images with new ones
      let oldImageUrls: string[] = [];
      try {
        const getRequestBody = {
          action: "getProject",
          id: id.toString(),
        };

        const getResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getRequestBody),
          redirect: "follow",
        });

        if (getResponse.ok) {
          const getResponseText = await getResponse.text();
          try {
            const getData = JSON.parse(getResponseText);
            if (getData.success && getData.data && getData.data.gambar) {
              // Parse old images
              if (Array.isArray(getData.data.gambar)) {
                oldImageUrls = getData.data.gambar.filter((url: string) => url && url.trim());
              } else if (typeof getData.data.gambar === 'string') {
                try {
                  const parsed = JSON.parse(getData.data.gambar);
                  oldImageUrls = Array.isArray(parsed) 
                    ? parsed.filter((url: string) => url && url.trim())
                    : [];
                } catch (e) {
                  oldImageUrls = getData.data.gambar.trim() ? [getData.data.gambar.trim()] : [];
                }
              }
              console.log("Found old images:", oldImageUrls);
            }
          } catch (e) {
            console.log("Failed to parse existing project data (continuing anyway)");
          }
        }
      } catch (error) {
        console.log("Error fetching existing project data (continuing anyway):", error);
      }

      // Step 2: Clean HTML content to remove unwanted attributes like data-path-to-node
      const cleanedKonten = cleanHtmlAttributes(konten);
      
      // Normalize new images array
      const newImageUrls = Array.isArray(gambar) 
        ? gambar.filter((url: string) => url && url.trim())
        : [];
      
      const requestBody = {
        action: "updateProject",
        id: id.toString(),
        judul: judul.trim(),
        penulis: penulis.trim(),
        konten: cleanedKonten.trim(),
        gambar: newImageUrls,
      };

      console.log("Updating project:", {
        url: apiUrl,
        body: { ...requestBody, konten: konten.substring(0, 50) + "..." },
      });

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
        console.log("Apps Script Update Response:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("Failed to parse Apps Script response:", responseText);
        return NextResponse.json(
          { error: "Invalid response from server" },
          { status: 500 }
        );
      }

      if (response.ok && data.success) {
        // Step 3: Delete old images that are no longer in the new images list
        if (oldImageUrls.length > 0) {
          // Find images that were removed (in old but not in new)
          const removedImageUrls = oldImageUrls.filter(
            (oldUrl: string) => !newImageUrls.includes(oldUrl)
          );

          if (removedImageUrls.length > 0) {
            console.log(`Deleting ${removedImageUrls.length} removed images from R2:`, removedImageUrls);
            const deleteResults = await deleteMultipleFromR2(removedImageUrls);
            const successCount = deleteResults.filter((r) => r).length;
            const failCount = removedImageUrls.length - successCount;
            console.log(`Deleted ${successCount}/${removedImageUrls.length} removed images from R2 (${failCount} failed)`);
            
            if (failCount > 0) {
              console.warn("Some removed images failed to delete. Check logs above for details.");
            }
          } else {
            console.log("No images were removed, skipping deletion");
          }
        }

        return NextResponse.json(
          {
            success: true,
            message: "Project berhasil diupdate",
            data: data.data,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal mengupdate project" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengupdate project" },
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

    console.error("Error in projects PUT route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID wajib diisi" },
        { status: 400 }
      );
    }

    // Call Google Apps Script to get project data first (to get image URLs)
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Get project data to retrieve image URLs
      console.log("Fetching project data before delete:", { id });
      const getRequestBody = {
        action: "getProject",
        id: id.toString(),
      };

      const getResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getRequestBody),
        redirect: "follow",
      });

      let projectData: any = null;
      if (getResponse.ok) {
        const getResponseText = await getResponse.text();
        try {
          const getData = JSON.parse(getResponseText);
          if (getData.success && getData.data) {
            projectData = getData.data;
          }
        } catch (e) {
          console.error("Failed to parse project data:", e);
        }
      }

      // Step 2: Delete images from R2 if project has images
      if (projectData && projectData.gambar) {
        let imageUrls: string[] = [];
        if (Array.isArray(projectData.gambar)) {
          imageUrls = projectData.gambar.filter((url: string) => url && url.trim());
        } else if (typeof projectData.gambar === 'string') {
          try {
            const parsed = JSON.parse(projectData.gambar);
            imageUrls = Array.isArray(parsed) 
              ? parsed.filter((url: string) => url && url.trim())
              : [];
          } catch (e) {
            // If not JSON, treat as single URL
            imageUrls = projectData.gambar.trim() ? [projectData.gambar.trim()] : [];
          }
        }

        if (imageUrls.length > 0) {
          console.log(`Deleting ${imageUrls.length} images from R2:`, imageUrls);
          const deleteResults = await deleteMultipleFromR2(imageUrls);
          const successCount = deleteResults.filter((r) => r).length;
          const failCount = imageUrls.length - successCount;
          console.log(`Deleted ${successCount}/${imageUrls.length} images from R2 (${failCount} failed)`);
          
          if (failCount > 0) {
            console.warn("Some images failed to delete. Check logs above for details.");
          }
        } else {
          console.log("No images to delete from R2");
        }
      } else {
        console.log("Project has no images to delete");
      }

      // Step 3: Delete project from database
      const requestBody = {
        action: "deleteProject",
        id: id.toString(),
      };

      console.log("Deleting project from database:", { url: apiUrl, id });

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
        console.log("Apps Script Delete Response:", JSON.stringify(data, null, 2));
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
            message: "Project dan gambar berhasil dihapus",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal menghapus project" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat menghapus project" },
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

    console.error("Error in projects DELETE route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus project" },
      { status: 500 }
    );
  }
}

