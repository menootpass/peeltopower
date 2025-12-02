import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// This should be replaced with actual database query
// For now, using hardcoded credentials or API call to your database
async function verifyCredentials(
  email: string,
  password: string
): Promise<{ valid: boolean; user?: { id: string; email: string; name: string }; error?: string }> {
  // TODO: Replace with actual database query
  // Example: Check against your database API
  
  const apiUrl = process.env.DATABASE_API_URL || "";
  const apiKey = process.env.DATABASE_API_KEY || "";

  if (apiUrl) {
    try {
      // Call Google Apps Script Web App to verify credentials
      // Note: Google Apps Script Web Apps may require redirect handling
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email,
          password,
          ...(apiKey && { apiKey }), // Include API key if provided
        }),
        redirect: "follow", // Follow redirects (Apps Script may redirect)
      });

      console.log("Apps Script Response Status:", response.status);
      console.log("Apps Script Response Headers:", Object.fromEntries(response.headers.entries()));

      // Get response text first to check if it's JSON
      const responseText = await response.text();
      console.log("Apps Script Response Text (first 500 chars):", responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Apps Script Response (parsed):", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("Failed to parse JSON response. Response is:", responseText.substring(0, 1000));
        return { 
          valid: false, 
          error: "Invalid response from server. Please check DATABASE_API_URL and ensure Apps Script is deployed correctly." 
        };
      }

      if (response.ok) {
        if (data.valid && data.user) {
          return {
            valid: true,
            user: {
              id: data.user.id || "",
              email: data.user.email || email,
              name: data.user.name || data.user.username || "",
            },
          };
        } else {
          // Log error from Apps Script if available
          if (data.error) {
            console.error("Apps Script Error:", data.error);
          }
          return { valid: false, error: data.error || "Invalid credentials" };
        }
      } else {
        console.error("Apps Script returned non-OK status:", response.status);
        console.error("Response data:", data);
        return { valid: false, error: data.error || "API request failed" };
      }
    } catch (error) {
      console.error("Error verifying credentials:", error);
      return { valid: false, error: error instanceof Error ? error.message : "Network error" };
    }
  }

  // Fallback: Hardcoded credentials for development
  // REMOVE THIS IN PRODUCTION - Replace with actual database check
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return {
      valid: true,
      user: {
        id: "1",
        email: email,
        name: "Admin",
      },
    };
  }

  return { valid: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Verify credentials
    const verification = await verifyCredentials(email, password);

    if (!verification.valid || !verification.user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Create session token (simple JWT-like token)
    // In production, use proper JWT library like jsonwebtoken
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: verification.user.id,
        email: verification.user.email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    ).toString("base64");

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        user: verification.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}

