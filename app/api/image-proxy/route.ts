import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route untuk proxy gambar dari R2
 * Mengatasi masalah SSL/CORS dengan mem-fetch gambar di server side
 * 
 * Usage: /api/image-proxy?url=https://r2.dev/path/to/image.jpg
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow R2 URLs for security
    const allowedHosts = [
      'r2.dev',
      'r2.cloudflarestorage.com',
      process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null,
    ].filter(Boolean);

    const isAllowed = allowedHosts.some(host => 
      url.hostname === host || url.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'URL not allowed' },
        { status: 403 }
      );
    }

    // Fetch image from R2
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
      // Don't follow redirects to avoid issues
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: any) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



