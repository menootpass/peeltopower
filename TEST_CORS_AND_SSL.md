# Test CORS dan SSL untuk R2

## Masalah yang Terjadi

Meskipun CORS sudah dikonfigurasi dengan benar, masih ada error:
```
Failed to load profile photo (SSL/CORS error), using default: 
https://pub-a7751a64faf741dca34547496be45bdd.r2.dev/profile-photos/xxx.JPG
```

## Penyebab

1. **SSL Certificate Error**: R2.dev subdomain memiliki masalah SSL certificate (`ERR_CERT_COMMON_NAME_INVALID`)
2. **CORS mungkin belum ter-apply**: Perubahan CORS membutuhkan waktu untuk propagate

## Langkah Troubleshooting

### 1. Test CORS Configuration

1. **Buka URL gambar langsung di browser**:
   ```
   https://pub-a7751a64faf741dca34547496be45bdd.r2.dev/profile-photos/1764636999762-2twjejyf0a2.JPG
   ```

2. **Cek Response Headers**:
   - Buka DevTools → Network tab
   - Klik pada request gambar
   - Lihat Response Headers, harus ada:
     ```
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, HEAD
     Access-Control-Allow-Headers: *
     ```

3. **Jika tidak ada CORS headers**:
   - CORS belum ter-apply dengan benar
   - Tunggu beberapa menit dan coba lagi
   - Atau cek kembali format CORS di R2 dashboard

### 2. Test SSL Certificate

1. **Buka URL di browser baru** (incognito mode)
2. **Lihat apakah ada SSL warning**
3. **Jika ada SSL warning**:
   - Klik "Advanced" → "Proceed to site" (untuk test)
   - Tapi ini hanya untuk test, tidak untuk production

### 3. Solusi Sementara: Gunakan Custom Domain

Jika SSL error masih terjadi, gunakan custom domain:

1. **Setup Custom Domain di R2** (lihat `SETUP_CUSTOM_DOMAIN_LOCALHOST.md`)
2. **Update `.env.local`**:
   ```env
   R2_PUBLIC_URL=https://cdn.yourdomain.com
   ```
3. **Restart server**

### 4. Solusi Alternatif: Terima Fallback ke Default Image

Jika tidak bisa menggunakan custom domain sekarang:
- Aplikasi sudah di-setup untuk fallback ke default image jika ada error
- Foto profil akan tetap berfungsi, hanya menampilkan default image
- Untuk production, pastikan menggunakan custom domain

## Test CORS dengan cURL

Test apakah CORS sudah benar dengan cURL:

```bash
curl -I -H "Origin: http://localhost:3000" \
  https://pub-a7751a64faf741dca34547496be45bdd.r2.dev/profile-photos/1764636999762-2twjejyf0a2.JPG
```

Response harus mengandung:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Allow-Headers: *
```

## Checklist

- [ ] CORS configuration sudah dalam format array `[{...}]`
- [ ] CORS sudah di-save di R2 dashboard
- [ ] Sudah menunggu beberapa menit untuk propagate
- [ ] Test URL langsung di browser - cek response headers
- [ ] Test dengan cURL untuk memastikan CORS headers ada
- [ ] Jika masih error SSL, pertimbangkan custom domain
- [ ] Atau terima fallback ke default image untuk sementara

## Catatan Penting

1. **CORS vs SSL Error**: 
   - CORS error: Gambar tidak bisa diakses dari browser karena CORS policy
   - SSL error: Browser menolak koneksi karena certificate tidak valid
   - Keduanya bisa terjadi bersamaan

2. **R2.dev Subdomain**:
   - Memiliki masalah SSL certificate yang dikenal
   - Solusi terbaik: Gunakan custom domain
   - Atau terima fallback ke default image

3. **Untuk Production**:
   - **WAJIB** menggunakan custom domain
   - Jangan gunakan R2.dev subdomain untuk production
   - Pastikan SSL certificate valid



