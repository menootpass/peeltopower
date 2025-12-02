# Setup Google Apps Script untuk Database Authentication

## Langkah-langkah Setup

### 1. Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Rename sheet menjadi "Users" (atau sesuaikan dengan SHEET_NAME di code)
4. Di baris pertama (A1, B1, C1), tambahkan header:
   ```
   Email          | Username    | Password
   ```
5. Tambahkan data user di baris berikutnya:
   ```
   admin@example.com | admin | password123
   user@example.com  | user  | password456
   ```

**Catatan Keamanan:**
- Untuk production, simpan password yang sudah di-hash
- Jangan simpan password plain text di production
- Gunakan password manager untuk generate password yang kuat

### 2. Copy Spreadsheet ID

1. Di URL spreadsheet, copy ID yang ada di antara `/d/` dan `/edit`
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
2. Simpan ID ini untuk digunakan di Apps Script

### 3. Buat Google Apps Script Project

1. Buka [Google Apps Script](https://script.google.com)
2. Klik "New Project"
3. Hapus code default
4. Copy semua code dari `apps-script/Code.gs`
5. Paste ke editor Apps Script
6. Ganti `SPREADSHEET_ID` dengan ID spreadsheet Anda:
   ```javascript
   const SPREADSHEET_ID = 'your-spreadsheet-id-here';
   ```
7. Jika nama sheet berbeda, ganti `SHEET_NAME`:
   ```javascript
   const SHEET_NAME = 'Users'; // atau nama sheet Anda
   ```

### 4. Deploy sebagai Web App

1. Klik "Deploy" → "New deployment"
2. Klik icon gear (⚙️) di sebelah "Select type"
3. Pilih "Web app"
4. Isi konfigurasi:
   - **Description**: "Database Authentication API"
   - **Execute as**: "Me" (user yang deploy)
   - **Who has access**: "Anyone" (atau "Anyone with Google account" untuk lebih aman)
5. Klik "Deploy"
6. **Authorize access** saat diminta:
   - Klik "Authorize access"
   - Pilih Google account
   - Klik "Advanced" → "Go to [Project Name] (unsafe)"
   - Klik "Allow"
7. Copy **Web App URL** yang muncul
   - Format: `https://script.google.com/macros/s/.../exec`

### 5. Konfigurasi di Next.js

1. Buka file `.env.local` di project
2. Tambahkan konfigurasi:
   ```env
   # Google Apps Script Web App URL
   DATABASE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   DATABASE_API_KEY=optional_api_key_if_needed
   ```

### 6. Update API Route Login

File `app/api/auth/login/route.ts` sudah dikonfigurasi untuk menggunakan Apps Script jika `DATABASE_API_URL` di-set.

## Testing

### Test via Browser

Buka Web App URL di browser:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getAllUsers
```

Harusnya return JSON dengan list users.

### Test via Postman/curl

**Test Login:**
```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Test GetAllUsers (POST):**
```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getAllUsers"
  }'
```

**Test GetAllUsers (GET):**
```bash
curl https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getAllUsers
```

### Test via Next.js

1. Start development server: `npm run dev`
2. Buka `/login`
3. Login dengan email dan password dari spreadsheet
4. Harusnya redirect ke `/admin` jika berhasil

## API Endpoints

### POST - Login
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "valid": true,
  "user": {
    "id": "2",
    "email": "user@example.com",
    "username": "user",
    "name": "user"
  }
}
```

### POST - Register (Optional)
```json
{
  "action": "register",
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "password123"
}
```

### GET/POST - Get All Users (Optional)
```
GET: ?action=getAllUsers
POST: { "action": "getAllUsers" }
```

**Note:** Untuk POST `getAllUsers`, tidak perlu kirim email dan password.

## Troubleshooting

### Error: "Unexpected error while getting the method or property openById"

Error ini terjadi karena `SPREADSHEET_ID` tidak valid atau Apps Script tidak memiliki akses ke spreadsheet.

**Solusi:**

1. **Pastikan SPREADSHEET_ID sudah diisi dengan benar:**
   - Buka Google Spreadsheet Anda
   - Lihat URL di browser, formatnya: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy ID yang ada di antara `/d/` dan `/edit`
   - Contoh: Jika URL adalah `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`, maka ID-nya adalah `1a2b3c4d5e6f7g8h9i0j`
   - Paste ID ini ke Apps Script, pastikan ada tanda kutip: `const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j';`

2. **Pastikan Apps Script memiliki akses ke spreadsheet:**
   - Spreadsheet harus dibuat dengan Google account yang sama dengan Apps Script
   - Atau, jika spreadsheet dibuat oleh orang lain, pastikan:
     - Spreadsheet di-share ke email Google account yang digunakan untuk Apps Script
     - Set permission ke "Editor" atau "Viewer" (minimal Viewer)
   - Cara share: Buka spreadsheet → Klik "Share" → Masukkan email → Set permission → Kirim

3. **Test akses spreadsheet:**
   - Di Apps Script editor, jalankan fungsi test sederhana:
   ```javascript
   function testSpreadsheet() {
     try {
       const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
       Logger.log('Spreadsheet found: ' + ss.getName());
     } catch (error) {
       Logger.log('Error: ' + error.toString());
     }
   }
   ```
   - Klik "Run" → Pilih `testSpreadsheet`
   - Cek log di "Executions" untuk melihat apakah berhasil

4. **Pastikan tidak ada typo:**
   - SPREADSHEET_ID harus dalam tanda kutip: `'...'` atau `"..."`
   - Tidak ada spasi di awal/akhir ID
   - ID harus lengkap (biasanya panjang, sekitar 44 karakter)

### Error: "Sheet not found"
- Pastikan nama sheet sesuai dengan `SHEET_NAME` di code
- Pastikan sheet ada di spreadsheet
- Nama sheet case-sensitive (jika di code `'Users'`, maka di spreadsheet harus `Users`, bukan `users`)

### Error: "Column not found"
- Pastikan header di baris pertama: `Email | Username | Password`
- Pastikan case-sensitive sesuai (Email, bukan email)
- Pastikan tidak ada spasi ekstra di header

### Error: "User not found"
- Pastikan email di spreadsheet sesuai (case-insensitive tapi harus exact match setelah trim)
- Pastikan ada data di baris setelah header
- Pastikan email tidak ada spasi di awal/akhir

### Error: 401 Unauthorized

Error ini terjadi ketika Apps Script menolak request dari server Next.js.

**Solusi:**

1. **Pastikan "Who has access" di-set ke "Anyone":**
   - Buka Apps Script → "Deploy" → "Manage deployments"
   - Klik icon pensil (edit) pada deployment
   - Pastikan "Who has access" = **"Anyone"** (bukan "Only myself")
   - Klik "Deploy" untuk save perubahan
   - **PENTING:** Setelah mengubah setting, Apps Script akan generate URL baru
   - Copy URL baru dan update di `.env.local`

2. **Deploy ulang dengan setting yang benar:**
   - Jika masih error, buat deployment baru:
   - "Deploy" → "New deployment"
   - Select type: "Web app"
   - Execute as: "Me"
   - **Who has access: "Anyone"** ← Ini yang paling penting!
   - Klik "Deploy"
   - Copy URL baru

3. **Test URL langsung:**
   - Buka URL Apps Script di browser (tanpa parameter)
   - Harusnya muncul: `{"message":"Google Apps Script API is running. Use POST method for login."}`
   - Jika muncul halaman login/error, berarti setting "Who has access" masih salah

4. **Pastikan URL benar:**
   - URL harus berakhir dengan `/exec` (bukan `/dev`)
   - Format: `https://script.google.com/macros/s/SCRIPT_ID/exec`
   - Tidak ada parameter di URL (parameter dikirim di body untuk POST)

### Error: "Access denied" saat deploy
- Pastikan sudah authorize dengan benar
- Coba deploy ulang dan authorize lagi
- Pastikan spreadsheet sudah di-share ke account yang digunakan untuk deploy

### Error: CORS atau network error
- Pastikan Web App URL benar
- Pastikan "Who has access" di-set ke "Anyone" atau "Anyone with Google account"
- Cek browser console untuk error detail

## Security Best Practices

1. **Hash Passwords**: Untuk production, simpan password yang sudah di-hash di spreadsheet
2. **HTTPS Only**: Pastikan menggunakan HTTPS
3. **Limit Access**: Set "Who has access" ke "Anyone with Google account" untuk lebih aman
4. **API Key**: Tambahkan API key validation di Apps Script jika perlu
5. **Rate Limiting**: Pertimbangkan untuk menambahkan rate limiting
6. **Input Validation**: Validasi input di Apps Script

## Advanced: Menambahkan API Key Protection

Jika ingin menambahkan API key protection, update `doPost` function:

```javascript
function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);
  const apiKey = requestData.apiKey;
  const expectedApiKey = 'your-secret-api-key';
  
  if (apiKey !== expectedApiKey) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Invalid API key' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... rest of the code
}
```

Lalu update `.env.local`:
```env
DATABASE_API_KEY=your-secret-api-key
```

