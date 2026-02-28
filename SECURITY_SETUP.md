# Setup Rate Limiting & Origin Validation

## 🔒 Fitur Keamanan yang Ditambahkan:

### 1. **Rate Limiting** (5 requests per menit per IP)
- Mencegah spam dan abuse
- Menggunakan Upstash Redis (gratis untuk 10K requests/hari)
- Setiap IP dibatasi 5 kali submit ucapan per menit

### 2. **Origin Validation**
- Hanya request dari domain Anda yang diterima
- Mencegah request dari website lain
- Block otomatis di production

---

## 📋 Langkah 1: Setup Upstash Redis (Gratis)

### 1.1 Daftar di Upstash

1. Buka [Upstash Console](https://upstash.com/)
2. Klik **Get Started** atau **Sign Up**
3. Login dengan GitHub/Google/Email

### 1.2 Buat Database Redis

1. Klik **Create Database**
2. Isi form:
   - **Name**: `wedding-invite-ratelimit` (atau nama lain)
   - **Region**: Pilih yang terdekat (e.g., `asia-southeast-1` untuk Singapore)
   - **TLS**: ✅ Enabled (default)
3. Klik **Create**

### 1.3 Dapatkan Credentials

1. Setelah database dibuat, Anda akan lihat **UPSTASH_REDIS_REST_URL** dan **UPSTASH_REDIS_REST_TOKEN**
2. Copy kedua nilai tersebut

### 1.4 Update .env File

Edit file `.env` di project Anda:

```bash
# Google Apps Script
GOOGLE_SCRIPT_URL=<your_google_apps_script_url>

# Allowed Origin (production)
ALLOWED_ORIGIN=https://your-app.vercel.app

# Upstash Redis
UPSTASH_REDIS_REST_URL=<paste_upstash_redis_url>
UPSTASH_REDIS_REST_TOKEN=<paste_upstash_redis_token>
```

Contoh:
```bash
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/ABC123/exec
ALLOWED_ORIGIN=https://yusuf-invite.vercel.app
UPSTASH_REDIS_REST_URL=https://us-east-1-1234567890.upstash.io
UPSTASH_REDIS_REST_TOKEN=eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZGF0YWJhc2VJZCI6IjEyMzQ1Njc4OTAifQ==
```

---

## 📋 Langkah 2: Setup di Vercel

### 2.1 Tambahkan Environment Variables

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. **Settings** → **Environment Variables**
4. Tambahkan variable berikut:

```
GOOGLE_SCRIPT_URL=<your_google_apps_script_url>
ALLOWED_ORIGIN=https://your-app.vercel.app
UPSTASH_REDIS_REST_URL=<your_upstash_redis_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_redis_token>
```

5. Klik **Save** untuk setiap variable

### 2.2 Redeploy

```bash
git add .
git commit -m "Add rate limiting and origin validation"
git push
```

Vercel akan auto-deploy dengan konfigurasi baru.

---

## 🧪 Testing

### Test Rate Limiting

1. Buka aplikasi Anda
2. Submit ucapan **6 kali berturut-turut** dalam 1 menit
3. Request ke-6 akan ditolak dengan error:
   ```json
   {
     "error": "Terlalu banyak request. Silakan tunggu sebentar.",
     "retryAfter": 45
   }
   ```

### Test Origin Validation

1. Coba submit dari domain lain (bukan domain Anda)
2. Request akan ditolak dengan error 403:
   ```json
   {
     "error": "Unauthorized origin"
   }
   ```

---

## 📊 Monitoring

### Cek Usage di Upstash

1. Buka [Upstash Console](https://upstash.com/)
2. Pilih database Anda
3. Lihat **Data Browser** atau **Metrics** untuk monitoring:
   - Jumlah requests
   - Rate limit hits
   - Latency

### Rate Limit Headers

Setiap response akan include headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1714567890
```

---

## ⚙️ Konfigurasi Rate Limit

### Ubah Limit

Edit file `api/submit-wish.ts`:

```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per 1 minute
  // ... lainnya
});
```

### Pilihan Konfigurasi:

```typescript
// 5 requests per menit
Ratelimit.slidingWindow(5, "1 m")

// 10 requests per jam
Ratelimit.slidingWindow(10, "1 h")

// 100 requests per hari
Ratelimit.slidingWindow(100, "1 d")

// 1 request per 10 detik
Ratelimit.slidingWindow(1, "10 s")
```

---

## 🛡️ Keamanan Tambahan (Opsional)

### Tambah Input Validation

Filter kata-kata tidak pantas:

```typescript
// api/submit-wish.ts
const inappropriateWords = ['kata1', 'kata2', 'kata3'];

const hasInappropriateContent = (text: string) => {
  return inappropriateWords.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
};

if (hasInappropriateContent(message)) {
  sendJson(res, 400, { error: 'Konten tidak pantas' });
  return;
}
```

### Tambah Captcha

Lihat dokumentasi `SETUP_RECAPTCHA.md` (jika ada)

---

## 📈 Free Tier Limits

### Upstash Redis (Free Tier):

- ✅ **10,000 requests/hari**
- ✅ **1,000 commands/hari** (rate limit check = 1 command)
- ✅ **256 MB storage**
- ✅ **Unlimited databases**

**Cukup untuk wedding invitation!** 🎉

### Kapan Perlu Upgrade?

Jika Anda expect:
- > 10,000 unique visitors per hari
- > 100,000 requests per hari

Maka pertimbangkan upgrade ke **Pro Plan** ($9/bulan)

---

## 🐛 Troubleshooting

### Error: "Missing UPSTASH_REDIS_REST_URL"

- Pastikan environment variables sudah ter-set di `.env` dan Vercel
- Restart dev server setelah update `.env`

### Error: "Unauthorized origin"

- Pastikan `ALLOWED_ORIGIN` sesuai dengan domain aplikasi
- Di localhost, origin otomatis di-allow (hanya logging)

### Rate Limit Tidak Bekerja

- Cek koneksi Redis di Upstash Console
- Pastikan credentials benar
- Cek logs di Vercel Function

---

## ✅ Checklist Setup

- [ ] Daftar Upstash
- [ ] Buat database Redis
- [ ] Copy credentials ke `.env`
- [ ] Set `ALLOWED_ORIGIN` di `.env`
- [ ] Test di localhost
- [ ] Add env vars di Vercel
- [ ] Deploy ke Vercel
- [ ] Test rate limiting di production
- [ ] Monitoring di Upstash Console

---

## 🎉 Selesai!

Aplikasi Anda sekarang:
- ✅ **Aman dari spam** (rate limiting)
- ✅ **Hanya terima request dari domain Anda** (origin validation)
- ✅ **Monitoring real-time** (Upstash dashboard)
- ✅ **Gratis** (hingga 10K requests/hari)

**Proteksi aktif!** 🛡️
