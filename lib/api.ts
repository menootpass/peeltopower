/**
 * Helper functions for API calls
 */

export interface UploadNewsResponse {
  success: boolean;
  message: string;
  data?: {
    id?: number;
    title: string;
    subtitle: string;
    author: string;
    description: string;
    content: string;
    date: string;
    imageUrl?: string;
    avatarUrl?: string;
  };
  error?: string;
}

/**
 * Upload news/article to the API
 */
export async function uploadNews(formData: FormData): Promise<UploadNewsResponse> {
  try {
    const response = await fetch("/api/admin/news", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Gagal mengupload berita",
        error: result.error,
      };
    }

    return {
      success: true,
      message: result.message || "Berita berhasil diupload",
      data: result.data,
    };
  } catch (error) {
    console.error("Error uploading news:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengupload berita",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get API token from environment
 */
export function getApiToken(): string | null {
  if (typeof window !== "undefined") {
    // Client-side: token should be passed from server or stored securely
    return null;
  }
  return process.env.API_TOKEN || null;
}


