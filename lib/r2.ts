import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  file: File,
  folder: string = "uploads"
): Promise<{ url: string; key: string }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const key = `${folder}/${fileName}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Return public URL - ensure no double slashes
    let baseUrl = R2_PUBLIC_URL;
    if (!baseUrl) {
      throw new Error("R2_PUBLIC_URL is not configured");
    }
    
    // Remove trailing slash if exists
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Ensure key doesn't start with slash
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    
    // Construct URL - ensure proper format
    const url = `${baseUrl}/${cleanKey}`;

    console.log(`Uploaded to R2 - Bucket: ${R2_BUCKET_NAME}, Key: ${cleanKey}, Base URL: ${baseUrl}, Final URL: ${url}`);

    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error(`Invalid URL protocol: ${urlObj.protocol}`);
      }
    } catch (urlError) {
      console.error("Invalid URL format generated:", url, urlError);
      throw new Error(`Invalid URL format: ${url}`);
    }

    return { url, key: cleanKey };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to R2");
  }
}

/**
 * Upload multiple files to R2
 */
export async function uploadMultipleToR2(
  files: File[],
  folder: string = "uploads"
): Promise<{ url: string; key: string }[]> {
  const uploadPromises = files.map((file) => uploadToR2(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete file from Cloudflare R2
 * @param url - Public URL of the file to delete
 * @returns true if successful, false otherwise
 */
export async function deleteFromR2(url: string): Promise<boolean> {
  try {
    if (!url || !url.trim()) {
      console.error("Empty URL provided");
      return false;
    }

    // Extract key from URL
    // URL format examples:
    // - https://domain.com/projects/images/filename.jpg
    // - https://bucket.r2.dev/projects/images/filename.jpg
    // - https://custom-domain.com/projects/images/filename.jpg
    
    let key: string;
    
    try {
      const urlObj = new URL(url);
      // Remove leading slash from pathname
      key = urlObj.pathname.startsWith('/') 
        ? urlObj.pathname.substring(1) 
        : urlObj.pathname;
    } catch (urlError) {
      // If URL parsing fails, try to extract key directly
      // Check if it's already a key (no http/https)
      if (!url.includes('://')) {
        key = url;
      } else {
        console.error("Invalid URL format:", url);
        return false;
      }
    }

    if (!key || !key.trim()) {
      console.error("Invalid URL, cannot extract key:", url);
      return false;
    }

    console.log(`Attempting to delete from R2 - URL: ${url}, Key: ${key}, Bucket: ${R2_BUCKET_NAME}`);

    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    console.log(`Successfully deleted file from R2: ${key}`);
    return true;
  } catch (error: any) {
    console.error(`Error deleting file from R2 (URL: ${url}):`, error);
    // Log more details about the error
    if (error.name === 'NoSuchKey') {
      console.error(`File not found in R2: ${url}`);
    } else if (error.name === 'AccessDenied') {
      console.error(`Access denied when deleting from R2: ${url}`);
    }
    return false;
  }
}

/**
 * Delete multiple files from Cloudflare R2
 * @param urls - Array of public URLs to delete
 * @returns Array of results (true for success, false for failure)
 */
export async function deleteMultipleFromR2(urls: string[]): Promise<boolean[]> {
  const deletePromises = urls.map((url) => deleteFromR2(url));
  return Promise.all(deletePromises);
}


