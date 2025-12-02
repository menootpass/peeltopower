# Quick Fix: SSL Certificate Error untuk R2

## Masalah yang Terkonfirmasi

Dari test di Postman, muncul warning:
```
Warning: Hostname/IP does not match certificate's altnames
```

Ini mengkonfirmasi bahwa **SSL certificate R2.dev subdomain tidak valid** untuk domain yang digunakan.

## Solusi: Gunakan Custom Domain

### Langkah 1: Setup Custom Domain di Cloudflare R2

1. **Login ke Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Pilih **R2** → **Bucket Anda**

2. **Buka Settings → Custom Domain**
   - Klik **Connect Domain**
   - Masukkan domain: `cdn.yourdomain.com` (atau subdomain lain)
   - Cloudflare akan memberikan target untuk CNAME record

3. **Setup DNS Record**
   - Buka DNS settings untuk domain Anda
   - Tambahkan CNAME:
     ```
     Type: CNAME
     Name: cdn
     Target: (target yang diberikan Cloudflare)
     Proxy: ON (orange cloud)
     ```

4. **Tunggu SSL Certificate**
   - Status akan berubah menjadi "Active" (5-15 menit)
   - SSL certificate akan otomatis di-generate oleh Cloudflare

### Langkah 2: Update Environment Variable

1. **Edit `.env.local`**:
   ```env
   # Ganti dari:
   R2_PUBLIC_URL=https://pub-a7751a64faf741dca34547496be45bdd.r2.dev
   
   # Menjadi:
   R2_PUBLIC_URL=https://cdn.yourdomain.com
   ```

2. **Restart Development Server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   # atau
   yarn dev
   ```

### Langkah 3: Test

1. **Upload foto profil baru** di aplikasi
2. **Cek console** - tidak ada SSL error
3. **Test di Postman** - tidak ada warning
4. **Test di browser** - gambar tampil dengan benar

## Alternatif: Tetap Gunakan R2.dev (Tidak Disarankan)

Jika custom domain belum siap, aplikasi akan:
- ✅ Tetap berfungsi (fallback ke default image)
- ❌ Gambar dari R2 tidak akan tampil (SSL error)
- ❌ Warning di console setiap kali load gambar

**Catatan:** Untuk production, **WAJIB** menggunakan custom domain.

## Checklist

- [ ] Custom domain sudah di-setup di Cloudflare R2
- [ ] DNS CNAME record sudah ditambahkan
- [ ] SSL certificate sudah aktif (status: Active)
- [ ] `R2_PUBLIC_URL` sudah di-update di `.env.local`
- [ ] Development server sudah di-restart
- [ ] Test upload foto profil - tidak ada SSL error
- [ ] Test di Postman - tidak ada warning
- [ ] Gambar tampil dengan benar di browser

## Mengapa Custom Domain Penting?

1. **SSL Certificate Valid**: Tidak ada masalah SSL certificate
2. **Lebih Profesional**: URL lebih clean
3. **Lebih Stabil**: Tidak ada masalah dengan R2.dev subdomain
4. **Production Ready**: Siap untuk production
5. **Tidak Ada Warning**: Tidak ada warning di Postman atau browser

## Troubleshooting

### Jika Custom Domain Belum Aktif
- Tunggu beberapa menit (5-15 menit)
- Cek status di Cloudflare Dashboard
- Pastikan DNS record sudah benar

### Jika Masih Ada SSL Error
- Pastikan custom domain sudah aktif
- Clear browser cache
- Test dengan incognito/private mode
- Pastikan `R2_PUBLIC_URL` sudah benar

### Jika Gambar Tidak Tampil
- Cek CORS configuration (sudah benar)
- Test URL langsung di browser
- Cek Network tab di DevTools
- Pastikan public access sudah di-enable di R2 bucket



