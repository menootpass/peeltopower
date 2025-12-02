# Panduan Upload Gambar ke Cloudflare R2

## Alur Upload Gambar

### 1. Upload dari Halaman Admin
- Buka `/admin/new`
- Pilih atau drag & drop gambar (bisa multiple)
- Klik "Publish"
- Gambar akan di-upload ke R2 terlebih dahulu
- URL gambar disimpan ke database di kolom "Gambar" sebagai array JSON

### 2. Proses Upload
1. **Upload ke R2**: Gambar di-upload ke folder `projects/images/` di R2 bucket
2. **Generate URL**: URL public dari R2 di-generate (format: `{R2_PUBLIC_URL}/projects/images/{filename}`)
3. **Simpan ke Database**: Array URL gambar disimpan ke spreadsheet di kolom "Gambar" sebagai JSON string

### 3. Tampilan di Website
- Gambar pertama dari array digunakan sebagai thumbnail di halaman projects
- Gambar ditampilkan di:
  - Halaman `/admin` (admin panel)
  - Halaman `/` (home page)
  - Halaman detail project (jika ada)

## Konfigurasi yang Diperlukan

### 1. Environment Variables (.env.local)
```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=peeltopower
R2_PUBLIC_URL=https://your-public-domain.com
```

**PENTING**: 
- `R2_PUBLIC_URL` harus URL yang bisa diakses public
- Jika menggunakan custom domain, pastikan sudah di-setup dengan benar
- Jika menggunakan R2.dev subdomain, format: `https://your-bucket-name.r2.dev`

### 2. Next.js Config (next.config.ts)
Sudah dikonfigurasi untuk allow images dari:
- `*.r2.dev`
- `*.r2.cloudflarestorage.com`
- Custom domain dari `R2_PUBLIC_URL`

### 3. R2 Bucket Settings
- **Public Access**: Harus di-enable
- **CORS**: Pastikan sudah dikonfigurasi untuk allow requests dari domain website Anda

## Struktur Data di Database

### Spreadsheet "Projects"
| Judul | Penulis | Konten | Gambar | Tanggal |
|-------|---------|--------|--------|---------|
| Project 1 | Author 1 | Content... | `["https://...", "https://..."]` | 25 Dec 2024, 14:30 |

Kolom "Gambar" berisi JSON array string dari URL R2:
```json
["https://your-domain.com/projects/images/1234567890-abc123.jpg", "https://your-domain.com/projects/images/1234567891-def456.jpg"]
```

## Troubleshooting

### Gambar tidak muncul
1. **Cek R2_PUBLIC_URL**: Pastikan URL benar dan bisa diakses
2. **Cek R2 Public Access**: Pastikan bucket sudah di-set ke public
3. **Cek CORS**: Pastikan CORS sudah dikonfigurasi dengan benar
4. **Cek next.config.ts**: Pastikan domain R2 sudah ditambahkan ke `remotePatterns`
5. **Cek Console Browser**: Lihat error di browser console (F12)

### Upload gagal
1. **Cek R2 Credentials**: Pastikan `R2_ACCESS_KEY_ID` dan `R2_SECRET_ACCESS_KEY` benar
2. **Cek R2_ENDPOINT**: Pastikan endpoint benar
3. **Cek R2_BUCKET_NAME**: Pastikan nama bucket benar
4. **Cek Console Server**: Lihat error di terminal server

### URL tidak tersimpan
1. **Cek Apps Script**: Pastikan fungsi `addProject` sudah benar
2. **Cek Response**: Lihat response dari API di browser console
3. **Cek Spreadsheet**: Buka spreadsheet dan cek apakah data sudah masuk

## Testing

### Test Upload
1. Buka `/admin/new`
2. Upload gambar
3. Cek di R2 bucket apakah file sudah ada di folder `projects/images/`
4. Cek di spreadsheet apakah URL sudah tersimpan di kolom "Gambar"

### Test Tampilan
1. Buka `/admin` - gambar harus muncul di list projects
2. Buka `/` - gambar harus muncul di home page
3. Cek apakah gambar bisa di-load dengan benar

## Catatan Penting

- Gambar di-upload ke folder `projects/images/` di R2
- Format filename: `{timestamp}-{randomString}.{extension}`
- Multiple images didukung (array)
- Gambar pertama digunakan sebagai thumbnail
- Jika upload gagal, project tidak akan disimpan (rollback)

