/**
 * Helper function untuk mengkonversi URL R2 ke proxy URL
 * Mengatasi masalah SSL/CORS dengan menggunakan API proxy
 */
export function getProxyImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl || !imageUrl.trim()) {
    return '';
  }

  const trimmedUrl = imageUrl.trim();

  // Jika sudah menggunakan proxy URL, return as is
  if (trimmedUrl.includes('/api/image-proxy')) {
    return trimmedUrl;
  }

  // Jika URL lokal (dimulai dengan /), return as is
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // Jika URL R2 (r2.dev atau r2.cloudflarestorage.com), gunakan proxy
  try {
    const url = new URL(trimmedUrl);
    const isR2Url = 
      url.hostname.includes('r2.dev') || 
      url.hostname.includes('r2.cloudflarestorage.com') ||
      (process.env.R2_PUBLIC_URL && url.hostname === new URL(process.env.R2_PUBLIC_URL).hostname);

    if (isR2Url) {
      // Encode URL untuk query parameter
      const encodedUrl = encodeURIComponent(trimmedUrl);
      return `/api/image-proxy?url=${encodedUrl}`;
    }
  } catch (e) {
    // Jika URL tidak valid, return original
    console.warn('Invalid URL format:', trimmedUrl);
  }

  // Return original URL jika bukan R2 URL
  return trimmedUrl;
}



