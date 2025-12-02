import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    try {
      let fetchUrl: string;
      if (slug) {
        // Query by slug - use POST method to send slug in body
        fetchUrl = apiUrl;
      } else if (id) {
        fetchUrl = `${apiUrl}?action=getProject&id=${id}`;
      } else {
        fetchUrl = `${apiUrl}?action=getAllProjects`;
      }

      const response = await fetch(
        slug
          ? fetchUrl
          : fetchUrl,
        slug
          ? {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "getProject",
                slug: slug,
              }),
              redirect: "follow",
            }
          : {
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
        return NextResponse.json(data, { status: 200 });
      } else {
        return NextResponse.json(
          { error: data.error || "Gagal mengambil data project" },
          { status: response.status || 500 }
        );
      }
    } catch (error) {
      console.error("Error fetching projects from Apps Script:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan saat mengambil data project" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in projects GET route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data project" },
      { status: 500 }
    );
  }
}

