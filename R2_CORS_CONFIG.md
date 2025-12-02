# R2 CORS Configuration - Format yang Benar

## Format yang Benar

CORS configuration di R2 **harus berupa array**, bukan single object.

### ✅ Format yang BENAR:
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

### ❌ Format yang SALAH:
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": [],
  "MaxAgeSeconds": 3600
}
```

## Cara Edit CORS di R2

1. **Buka Cloudflare Dashboard**
   - Login ke https://dash.cloudflare.com
   - Pilih **R2** → **Bucket Anda**

2. **Buka CORS Settings**
   - Klik **Settings** → **CORS**

3. **Edit CORS Configuration**
   - Paste format yang benar (dalam array):
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

4. **Save Changes**
   - Klik **Save** atau **Update**

## Penjelasan Setiap Field

- **AllowedOrigins**: `["*"]` berarti semua origin diperbolehkan (untuk development). Untuk production, bisa spesifik: `["https://yourdomain.com", "https://www.yourdomain.com"]`
- **AllowedMethods**: `["GET", "HEAD"]` - method yang diperbolehkan untuk akses gambar
- **AllowedHeaders**: `["*"]` - semua headers diperbolehkan
- **ExposeHeaders**: `[]` - headers yang diexpose ke client (kosong karena tidak perlu)
- **MaxAgeSeconds**: `3600` - cache preflight request selama 1 jam

## Test CORS Configuration

Setelah update CORS, test dengan:

1. **Upload gambar baru** di aplikasi
2. **Cek Network tab** di browser DevTools
3. **Lihat response headers** - harus ada:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, HEAD`
   - `Access-Control-Allow-Headers: *`

## Troubleshooting

### Jika Masih Ada CORS Error

1. **Pastikan format array sudah benar** - harus `[{...}]` bukan `{...}`
2. **Clear browser cache** - CORS settings mungkin di-cache
3. **Tunggu beberapa menit** - perubahan CORS mungkin perlu waktu untuk propagate
4. **Test dengan gambar baru** - gambar yang sudah di-cache mungkin masih menggunakan CORS lama

### Untuk Production

Jika ingin lebih secure untuk production, gunakan:

```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

**Catatan:** Tambahkan `http://localhost:3000` untuk development, dan hapus untuk production.



