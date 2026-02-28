# Setup Google Sheets untuk Ucapan & Doa (Google Apps Script)

## ✅ Kenapa Google Apps Script?

- ✅ **100% Gratis** - Tanpa batas request
- ✅ **Tanpa OAuth2 ribet** - Tidak perlu setup Service Account
- ✅ **Langsung terintegrasi** - Script berjalan di Google Sheet
- ✅ **Read & Write** - Bisa simpan dan baca ucapan dari Sheet
- ✅ **Aman** - URL deployment bisa di-restrict

---

## 📋 Langkah 1: Buat Google Sheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **+ Blank** untuk membuat spreadsheet baru
3. Beri nama: **"Ucapan Pernikahan"**
4. Di Sheet1, buat header di baris pertama:

| A | B | C | D | E |
|---|---|---|---|---|
| id | name | message | status | timestamp |

---

## 🔧 Langkah 2: Setup Google Apps Script

1. Di Google Sheet, klik menu **Extensions** → **Apps Script**
2. Hapus semua code yang ada
3. **Copy-paste** code dari file `google-apps-script/code.js` ke editor
4. Klik icon **Save** (💾)

### 📝 Code Google Apps Script

Code sudah include 2 fungsi:
- **doPost()**: Untuk menyimpan ucapan baru (POST)
- **doGet()**: Untuk membaca semua ucapan (GET)

```javascript
const SHEET_NAME = "Sheet1";

function doPost(e) {
  // Simpan ucapan baru
}

function doGet(e) {
  // Baca semua ucapan dari sheet
}
```

---

## 🚀 Langkah 3: Deploy sebagai Web App

1. Klik tombol **Deploy** (kanan atas) → **New deployment**
2. Klik icon gear ⚙️ → Pilih **Web app**
3. Isi konfigurasi:
   - **Description**: `Ucapan API`
   - **Execute as**: **Me** (email Anda)
   - **Who has access**: **Anyone** (siapa saja)
4. Klik **Deploy**
5. **Authorize access** jika diminta:
   - Pilih Google account Anda
   - Klik **Advanced** → **Go to ... (unsafe)**
   - Klik **Allow**
6. **Copy Web App URL** yang muncul (simpan untuk langkah berikutnya)

   Format URL: `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXX/exec`

---

## ⚙️ Langkah 4: Update Environment Variables

### Untuk Development (Localhost)

1. Edit file `.env` di project Anda:
   ```
   GOOGLE_SCRIPT_URL=<web_app_url_dari_langkah_3>
   ```

2. Restart dev server:
   ```bash
   # Stop server (Ctrl+C), lalu jalankan lagi
   npm run dev
   ```

### Untuk Production (Vercel)

1. Buka project di [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Environment Variables**
3. Tambahkan variable:
   ```
   GOOGLE_SCRIPT_URL=<web_app_url_dari_langkah_3>
   ```
4. Klik **Save**

---

## 🔄 Langkah 5: Update Code (Jika Perlu)

Jika Anda perlu update script (misalnya menambah fitur atau fix bug):

### ⚠️ PENTING: Selalu Buat Versi Baru!

Google Apps Script menggunakan sistem versioning. Setiap kali ada perubahan code, Anda **HARUS** membuat versi baru agar perubahan aktif.

### Langkah Update:

1. **Edit code** di Google Apps Script Editor
2. **Save** code (`Ctrl+S` atau klik icon 💾)
3. Klik **Deploy** → **Manage deployments**
4. Klik icon **Edit** (pensil) pada deployment yang aktif
5. **Version**: Pilih **New version** ⚠️
   - Jangan pilih "Default" atau versi lama!
   - Selalu pilih "New version" untuk update
6. Klik **Deploy**
7. Done! Perubahan sudah aktif

### 📝 Catatan Penting:

- ✅ **Selalu pilih "New version"** saat update
- ❌ **Jangan pilih versi lama** - code tidak akan update
- 🔍 **Cek version** di "Manage deployments" - versi terbaru harus yang aktif
- 🧪 **Test setelah update** - pastikan fungsi masih berjalan

### Cara Cek Versi Aktif:

1. Buka **Deploy** → **Manage deployments**
2. Lihat di bagian **Active deployment**
3. Version harus yang **terbaru** (angka paling besar)

### Jika Ada Masalah:

Jika setelah update code tidak berfungsi:

1. Buka **Manage deployments**
2. Klik **Edit** pada deployment
3. Pastikan **Version**: **New version** terpilih
4. Klik **Deploy** ulang
5. Test lagi di browser

---

## 🧪 Testing

### Test Simpan Ucapan (POST)
1. Buka aplikasi Anda di browser
2. Isi form ucapan & doa
3. Klik **Kirim Ucapan**
4. **Cek Google Sheet** - data akan muncul otomatis!

### Test Baca Ucapan (GET)
1. **Refresh halaman** aplikasi
2. Ucapan yang ada di Google Sheet akan dimuat otomatis
3. Semua ucapan dari database akan ditampilkan

---

## 📊 Fitur Lengkap

### ✅ Simpan Ucapan (POST)
Endpoint: `/api/submit-wish`
- Menyimpan ucapan baru ke Google Sheet
- Validasi name dan message
- Auto-generate ID dan timestamp

### ✅ Baca Ucapan (GET)
Endpoint: `/api/get-wishes`
- Membaca semua ucapan dari Google Sheet
- Urutan: terbaru dulu (newest first)
- Format JSON response

### Response Format (GET)
```json
{
  "wishes": [
    {
      "id": "1714567890123",
      "name": "John Doe",
      "message": "Happy Wedding!",
      "status": "Going",
      "timestamp": "2026-03-01T10:30:00.000Z"
    }
  ]
}
```

---

## 🔒 Keamanan

### Restrict Access (Opsional)

Jika ingin membatasi siapa yang bisa akses:

1. **Deploy ulang** dengan **Who has access**: **Anyone within [organization]**
2. Atau tambahkan validasi di script untuk check origin request

### URL Tidak Boleh Bocor!

- ⚠️ Jangan commit `.env` ke Git
- ✅ Simpan Web App URL di environment variables
- ✅ API berjalan di server (bukan client-side)

---

## 🐛 Troubleshooting

### Error: "Sheet not found"
- Pastikan nama sheet adalah **Sheet1** (case-sensitive)
- Atau update `SHEET_NAME` di code Apps Script

### Error: "Name and message are required"
- Form tidak mengirim data dengan benar
- Check browser console untuk error

### Data tidak muncul di sheet
- Buka Google Sheet → **Extensions** → **Apps Script**
- Klik **Executions** (icon play di kiri)
- Lihat log error di sana

### Error: "You do not have permission"
- Re-deploy dengan **Execute as**: **Me**
- Pastikan **Who has access**: **Anyone**

### Ucapan tidak muncul setelah refresh
- Pastikan `doGet()` function ada di Apps Script
- Re-deploy Apps Script dengan versi baru
- Clear browser cache

---

## 📝 Struktur Data di Google Sheet

| id | name | message | status | timestamp |
|----|------|---------|--------|-----------|
| 1714567890123 | John Doe | Happy Wedding! | Going | 2026-03-01T10:30:00.000Z |
| 1714567890456 | Jane Smith | Semoga bahagia selalu | Maybe | 2026-03-01T11:00:00.000Z |

---

## ✨ Keuntungan Google Apps Script

| Fitur | Google Apps Script | Google Sheets API |
|-------|-------------------|-------------------|
| Setup | ⭐ Mudah (5 menit) | ❌ Rumit (OAuth2) |
| Biaya | ✅ Gratis | ✅ Gratis |
| Write Access | ✅ Ya | ✅ Ya |
| Read Access | ✅ Ya | ✅ Ya |
| Rate Limit | 1000 requests/hari | Tergantung quota |
| Authentication | ✅ Otomatis | ❌ OAuth2 ribet |

**Rekomendasi**: Gunakan Google Apps Script untuk kasus ini! 🎉
