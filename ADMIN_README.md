# Admin Panel Documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env.local` di root project dengan isi:
```env
# API Configuration
API_TOKEN=your_api_token_here

# Database API Configuration (Optional - if using external database)
DATABASE_API_URL=https://your-api-endpoint.com/api
DATABASE_API_KEY=your_database_api_key_here

# Admin Credentials (Fallback - for development only)
# In production, remove these and use DATABASE_API_URL instead
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password

# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-domain.com
```

3. Setup Cloudflare R2 Storage (see `SETUP_R2.md` for detailed guide)

4. Akses halaman login di: `http://localhost:3000/login`
5. Login dengan credentials yang sudah dikonfigurasi
6. Akses halaman admin di: `http://localhost:3000/admin`

## Fitur

Halaman admin memungkinkan Anda untuk:
- Upload berita/artikel baru
- Input data lengkap: title, subtitle, author, description, content
- Upload gambar utama dan avatar author
- Validasi form sebelum submit

## API Route

API route tersedia di: `/api/admin/news`

### Request Format
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `title` (string, required)
  - `subtitle` (string, required)
  - `author` (string, required)
  - `description` (string, required)
  - `content` (string, required)
  - `image` (File, required)
  - `avatar` (File, required)

### Response Format
```json
{
  "success": true,
  "message": "Berita berhasil diupload",
  "data": {
    "title": "...",
    "subtitle": "...",
    "author": "...",
    "description": "...",
    "content": "...",
    "date": "Dec 25, 2024, Indonesia",
    "imageName": "image.jpg",
    "avatarName": "avatar.jpg"
  }
}
```

## Integrasi dengan Backend API

Untuk mengintegrasikan dengan backend API Anda:

1. Buka file `app/api/admin/news/route.ts`
2. Uncomment bagian yang sudah disediakan
3. Sesuaikan `API_URL` di `.env.local`
4. Sesuaikan format request sesuai dengan API backend Anda
5. Pastikan `API_TOKEN` sudah diatur dengan benar

## Catatan

- API token diambil dari environment variable `API_TOKEN`
- File upload saat ini hanya mencatat nama file, belum diupload ke storage
- Untuk production, implementasikan:
  - Upload file ke cloud storage (Cloudinary, AWS S3, dll)
  - Simpan data ke database
  - Validasi dan sanitasi input
  - Authentication & authorization untuk admin panel

