import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getCurrentUser } from "@/lib/auth";

/**
 * GET - Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Get user details from Apps Script
    const apiUrl = process.env.DATABASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "DATABASE_API_URL tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    try {
      // Get user by email from Apps Script
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getUserByEmail",
          email: user.email,
        }),
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
            user: {
              id: data.user.id,
              email: data.user.email,
              username: data.user.username || "",
              name: data.user.name || data.user.username || "",
              profilePhoto: data.user.profilePhoto || "",
            },
          },
          { status: 200 }
        );
      } else {
        // Fallback to session data if Apps Script fails
        return NextResponse.json(
          {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.name || "",
              name: user.name || "",
              profilePhoto: "",
            },
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Error fetching user from Apps Script:", error);
      // Fallback to session data
      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.name || "",
            name: user.name || "",
            profilePhoto: "",
          },
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

    console.error("Error in profile route:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil profil" },
      { status: 500 }
    );
  }
}

