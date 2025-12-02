# Setup Custom Domain untuk R2 di Localhost

## Langkah-langkah Setup

### 1. Setup Custom Domain di Cloudflare R2

1. **Buka Cloudflare Dashboard**
   - Login ke https://dash.cloudflare.com
   - Pilih R2 → Bucket Anda

2. **Setup Custom Domain**
   - Klik **Settings** → **Custom Domain**
   - Klik **Connect Domain**
   - Masukkan domain yang ingin digunakan (misalnya: `cdn.yourdomain.com`)
   - Cloudflare akan memberikan instruksi untuk setup DNS

3. **Setup DNS Record**
   - Buka DNS settings untuk domain Anda
   - Tambahkan CNAME record:
     ```
     Type: CNAME
     Name: cdn
     Target: (akan diberikan oleh Cloudflare)
     Proxy: ON (orange cloud)
     ```

4. **Tunggu SSL Certificate**
   - Cloudflare akan otomatis generate SSL certificate
   - Biasanya membutuhkan waktu 5-15 menit
   - Status akan berubah menjadi "Active" ketika siap

### 2. Konfigurasi untuk Localhost Development

1. **Update `.env.local`**
   ```env
   # Gunakan custom domain yang sudah di-setup
   R2_PUBLIC_URL=https://cdn.yourdomain.com
   
   # Pastikan tidak ada trailing slash
   ```

2. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   npm run dev
   # atau
   yarn dev
   ```

### 3. Test di Localhost

1. **Upload Foto Profil**
   - Buka http://localhost:3000/admin/profile-setting
   - Upload foto profil baru
   - Cek console untuk melihat URL yang di-generate

2. **Cek Console Log**
   Setelah upload, console akan menampilkan:
   ```
   Uploaded to R2 - Bucket: your-bucket, Key: profile-photos/xxx.jpg, Base URL: https://cdn.yourdomain.com, Final URL: https://cdn.yourdomain.com/profile-photos/xxx.jpg
   ```

3. **Test URL Langsung**
   - Copy URL dari console
   - Buka di browser baru (atau tab baru)
   - Pastikan gambar bisa diakses tanpa SSL error

4. **Cek Network Tab**
   - Buka DevTools → Network tab
   - Refresh halaman profile-setting
   - Cek apakah request ke custom domain berhasil (status 200)
   - Tidak ada SSL certificate error

### 4. Troubleshooting

#### Jika Custom Domain Belum Aktif
- Tunggu beberapa menit untuk SSL certificate di-generate
- Cek status di Cloudflare Dashboard → R2 → Settings → Custom Domain
- Pastikan DNS record sudah benar (CNAME pointing ke target yang diberikan)

#### Jika Masih Ada SSL Error
1. **Cek DNS Propagation**
   ```bash
   # Test di terminal
   nslookup cdn.yourdomain.com
   # atau
   dig cdn.yourdomain.com
   ```

2. **Cek SSL Certificate**
   - Buka https://cdn.yourdomain.com di browser
   - Pastikan tidak ada SSL warning
   - Jika ada warning, tunggu beberapa saat untuk certificate di-generate

3. **Clear Browser Cache**
   - Clear cache browser
   - Atau gunakan incognito/private mode

#### Jika Gambar Tidak Tampil
1. **Cek CORS Configuration**
   - Buka Cloudflare Dashboard → R2 → Bucket → Settings → CORS
   - Pastikan CORS sudah dikonfigurasi:
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

2. **Cek Public Access**
   - Pastikan bucket sudah di-set ke **Public Access**
   - Settings → Public Access → Enable

3. **Test URL Langsung**
   - Buka URL gambar langsung di browser
   - Jika muncul 403 atau CORS error, berarti ada masalah dengan CORS atau public access

### 5. Alternatif: Tetap Gunakan R2.dev untuk Development

Jika custom domain belum siap, Anda bisa tetap menggunakan R2.dev subdomain untuk development:

```env
# .env.local untuk development
R2_PUBLIC_URL=https://pub-a7751a64faf741dca34547496be45bdd.r2.dev
```

**Catatan:** 
- R2.dev subdomain mungkin memiliki masalah SSL certificate
- Gambar akan fallback ke default image jika ada SSL error
- Untuk production, gunakan custom domain

### 6. Checklist Setup

- [ ] Custom domain sudah di-setup di Cloudflare R2
- [ ] DNS CNAME record sudah ditambahkan
- [ ] SSL certificate sudah aktif (status: Active)
- [ ] `R2_PUBLIC_URL` sudah di-update di `.env.local`
- [ ] Development server sudah di-restart
- [ ] Test upload foto profil berhasil
- [ ] URL gambar bisa diakses langsung di browser
- [ ] Tidak ada SSL error di console
- [ ] Gambar tampil dengan benar di localhost

## Keuntungan Custom Domain

1. **SSL Certificate Valid**: Tidak ada masalah SSL certificate
2. **Lebih Profesional**: URL lebih clean dan professional
3. **Lebih Stabil**: Tidak ada masalah dengan R2.dev subdomain
4. **Production Ready**: Siap untuk production tanpa perubahan konfigurasi

## Catatan Penting

- Custom domain harus sudah aktif sebelum digunakan
- SSL certificate membutuhkan waktu untuk di-generate (5-15 menit)
- Pastikan DNS record sudah benar sebelum test
- Untuk development, bisa tetap menggunakan R2.dev jika custom domain belum siap



