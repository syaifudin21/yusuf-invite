# 🚀 Quick Start - Setup Google Sheets untuk Ucapan

## ⚡ Setup Cepat (5 Menit)

### 1️⃣ Buat Google Sheet (1 menit)

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Beri nama: **"Ucapan Pernikahan"**
4. Buat header di baris 1:
   ```
   A1: id
   B1: name
   C1: message
   D1: status
   E1: timestamp
   ```

### 2️⃣ Setup Google Apps Script (2 menit)

1. Di Google Sheet, klik **Extensions** → **Apps Script**
2. Hapus semua code yang ada
3. **Copy-paste** code ini:

```javascript
const SHEET_NAME = "Sheet1";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { name, message, status, timestamp } = data;
    
    if (!name || !message) {
      return createResponse(400, { error: "Name and message are required" });
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(500, { error: "Sheet not found" });
    }
    
    const id = new Date().getTime().toString();
    sheet.appendRow([id, name, message, status, new Date(timestamp).toISOString()]);
    
    return createResponse(200, { success: true, message: "Wish saved successfully" });
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(500, { error: "Internal server error" });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse(500, { error: "Sheet not found" });
    }
    
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // Skip header
    
    const wishes = rows.map(row => ({
      id: row[0].toString(),
      name: row[1],
      message: row[2],
      status: row[3],
      timestamp: row[4]
    })).reverse(); // Newest first
    
    return createResponse(200, { wishes });
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(500, { error: "Internal server error" });
  }
}

function createResponse(statusCode, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

4. Klik **Save** (💾)

### 3️⃣ Deploy Web App (1 menit)

1. Klik **Deploy** → **New deployment**
2. Klik ⚙️ → Pilih **Web app**
3. Konfigurasi:
   - **Description**: `Ucapan API`
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Klik **Deploy**
5. **Authorize** jika diminta (Advanced → Go to unsafe → Allow)
6. **Copy Web App URL**

### 4️⃣ Update .env File (1 menit)

Edit file `.env` di project Anda:

```bash
GOOGLE_SCRIPT_URL=<paste_web_app_url_disini>
```

Contoh:
```bash
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/ABC123XYZ/exec
```

### 5️⃣ Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 6️⃣ Test!

1. Buka aplikasi di browser
2. Isi form ucapan
3. Klik **Kirim Ucapan**
4. **Refresh halaman** - ucapan akan dimuat dari Google Sheet! 🎉

---

## 📦 Deploy ke Vercel

```bash
git add .
git commit -m "Add Google Sheets integration"
git push
```

Di Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Add: `GOOGLE_SCRIPT_URL` = `<web_app_url_anda>`
3. **Redeploy**

---

## ✅ Fitur Lengkap

- ✅ **Simpan Ucapan** - Form kirim ke `/api/submit-wish`
- ✅ **Baca Ucapan** - Load otomatis dari `/api/get-wishes`
- ✅ **Auto Refresh** - Ucapan dimuat saat aplikasi dibuka
- ✅ **Real-time** - Data langsung sinkron dengan Google Sheet

---

## ✅ Selesai!

Sekarang ucapan tamu akan:
1. Tersimpan otomatis ke Google Sheets
2. Ditampilkan di aplikasi secara real-time
3. Tidak hilang setelah refresh! 🎊
