# Fix SSL Certificate Error untuk R2 Images

## Masalah
Error `ERR_CERT_COMMON_NAME_INVALID` saat memuat gambar dari R2 bucket.

**Error yang muncul:**
```
GET https://pub-a7751a64faf741dca34547496be45bdd.r2.dev/profile-photos/xxx.JPG
net::ERR_CERT_COMMON_NAME_INVALID
```

## Penyebab
1. **R2_PUBLIC_URL tidak dikonfigurasi dengan benar**
   - URL harus menggunakan format yang benar
   - Harus menggunakan HTTPS
   - Domain harus sesuai dengan certificate

2. **SSL Certificate tidak valid untuk domain**
   - R2.dev subdomain mungkin memiliki masalah certificate
   - Perlu menggunakan custom domain atau memperbaiki URL

## Solusi

### 1. Cek R2_PUBLIC_URL di .env.local
Pastikan format URL benar:
```env
# Format yang benar:
R2_PUBLIC_URL=https://pub-a7751a64faf741dca34547496be45bdd.r2.dev

# ATAU jika menggunakan custom domain:
R2_PUBLIC_URL=https://cdn.yourdomain.com
```

**PENTING:**
- Jangan ada trailing slash (`/`)
- Harus menggunakan HTTPS
- Pastikan domain bisa diakses di browser

### 2. Cek R2 Bucket Settings
1. Buka Cloudflare Dashboard → R2
2. Pilih bucket Anda
3. Pastikan **Public Access** sudah di-enable
4. Cek **Custom Domain** jika menggunakan custom domain

### 3. Test URL Langsung
Buka URL gambar langsung di browser:
```
https://pub-a7751a64faf741dca34547496be45bdd.r2.dev/profile-photos/1764636999762-2twjejyf0a2.JPG
```

Jika muncul error SSL, berarti ada masalah dengan certificate R2.dev subdomain.

### 4. Solusi Alternatif: Gunakan Custom Domain
Jika R2.dev subdomain memiliki masalah SSL, gunakan custom domain:

1. Setup custom domain di R2 bucket settings
2. Update `R2_PUBLIC_URL` di `.env.local`:
   ```env
   R2_PUBLIC_URL=https://cdn.yourdomain.com
   ```
3. Restart development server

### 5. Cek CORS Configuration
Pastikan CORS sudah dikonfigurasi dengan benar di R2 bucket:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

## Debugging

### 1. Cek Console Log
Setelah upload, cek console untuk melihat URL yang di-generate:
```
Uploaded to R2 - Bucket: your-bucket, Key: profile-photos/xxx.jpg, Base URL: https://..., Final URL: https://...
```

### 2. Test URL di Browser
Copy URL dari console dan buka langsung di browser untuk melihat error yang terjadi.

### 3. Cek Network Tab
Buka browser DevTools → Network tab, lihat request yang gagal dan error message-nya.

## Jika Masih Error

1. **Gunakan Custom Domain**: Setup custom domain untuk R2 bucket
2. **Cek Certificate**: Pastikan certificate valid untuk domain yang digunakan
3. **Contact Support**: Jika menggunakan R2.dev subdomain dan masih error, mungkin perlu contact Cloudflare support

