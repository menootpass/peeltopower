# Troubleshooting: Gambar Tidak Tampil dari R2

## Masalah yang Sering Terjadi

### 1. Gambar Berhasil Upload tapi Tidak Tampil

**Kemungkinan Penyebab:**
- CORS tidak dikonfigurasi di R2 bucket
- `R2_PUBLIC_URL` tidak dikonfigurasi dengan benar
- URL format salah

**Solusi:**

1. **Cek CORS Configuration di R2:**
   - Buka Cloudflare Dashboard → R2 → Bucket Anda → Settings → CORS
   - Tambahkan CORS rule:
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

2. **Cek R2_PUBLIC_URL di .env.local:**
   ```env
   R2_PUBLIC_URL=https://your-bucket-name.r2.dev
   # atau jika menggunakan custom domain:
   R2_PUBLIC_URL=https://cdn.yourdomain.com
   ```
   - Pastikan URL tidak ada trailing slash (`/`)
   - Pastikan URL bisa diakses di browser

3. **Test URL Langsung:**
   - Buka URL gambar langsung di browser
   - Jika muncul error CORS atau 403, berarti ada masalah dengan CORS atau public access

### 2. Gambar Tampil Tapi Broken/Error

**Kemungkinan Penyebab:**
- Next.js Image optimization issue dengan R2
- URL format tidak benar

**Solusi:**
- Kode sudah diperbaiki untuk menggunakan `<img>` tag biasa untuk gambar dari R2
- Gambar dari R2 (yang dimulai dengan `http`) akan menggunakan `<img>` tag
- Gambar lokal akan menggunakan Next.js `<Image>` component

### 3. Multiple Images Tidak Tampil

**Kemungkinan Penyebab:**
- Array gambar tidak disimpan dengan benar di database
- Format JSON tidak benar

**Solusi:**
- Pastikan gambar disimpan sebagai array JSON di kolom "Gambar"
- Format: `["https://...", "https://..."]`
- Semua gambar akan ditampilkan di detail project

## Cara Test

1. Upload gambar melalui `/admin/new`
2. Cek console browser untuk melihat URL yang di-generate
3. Buka URL langsung di browser untuk memastikan gambar bisa diakses
4. Cek Network tab di browser DevTools untuk melihat error yang terjadi

## Format URL yang Benar

URL dari R2 harus dalam format:
```
https://your-bucket.r2.dev/projects/images/timestamp-randomstring.jpg
```

atau jika menggunakan custom domain:
```
https://cdn.yourdomain.com/projects/images/timestamp-randomstring.jpg
```

