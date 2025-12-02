import { cookies } from "next/headers";

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return null;
    }

    // Decode session token
    const decoded = JSON.parse(
      Buffer.from(session.value, "base64").toString()
    );

    // Check if session is expired
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || "",
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}


