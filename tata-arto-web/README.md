# 📱 tata arto. Netlify Pages Guide

## Overview

Folder `tata-arto-web` berisi halaman web Netlify untuk tata arto yang berfungsi sebagai landing pages dan undangan.

## Struktur Halaman

### 1. **index.html** (Start Page)

- URL: `https://tataarto.netlify.app/`
- Halaman utama dengan verifikasi email
- Menampilkan status verifikasi email setelah user mendaftar

### 2. **signup.html** (Undangan - Buat Akun & Gabung)

- URL: `https://tataarto.netlify.app/signup.html`
- **Digunakan untuk:** Email invitation link - "Buat akun dan gabung ke keluarga"
- Menampilkan fitur aplikasi dan tombol download
- Support URL parameters:
  - `?source=email` - Tracking dari mana user datang
  - `?familyId=xyz123` - ID keluarga yang mengundang

### 3. **invite.html** (Konfirmasi Undangan)

- URL: `https://tataarto.netlify.app/invite.html`
- Halaman untuk user yang sudah verify email dan siap download
- Menampilkan status "Akun Sudah Diverifikasi"
- Instruksi 3 langkah untuk mulai menggunakan app

### 4. **download.html** (APK Download Guide)

- URL: `https://tataarto.netlify.app/download.html`
- **Baru!** Halaman dengan instruksi download APK lengkap
- Step-by-step guide untuk install APK
- FAQ dan troubleshooting
- Alternative method menggunakan Expo Go

## Alur Penggunaan

### Flow 1: User Menerima Undangan Email

```
Email (Undangan)
    ↓
User klik "Download Aplikasi & Bergabung"
    ↓
get-app.html (pilihan download: Play Store/App Store)
    ↓
Download aplikasi
    ↓
User login dengan email yang diundang
    ↓
Otomatis bergabung ke keluarga ✓
```

### Flow 2: User Baru yang Mendaftar

```
User klik "Daftar" di halaman signup
    ↓
Verifikasi email
    ↓
index.html (loading verification)
    ↓
Email dikonfirmasi
    ↓
invite.html (instruksi download & login)
    ↓
Download aplikasi
    ↓
Login dengan email
    ↓
Siap menggunakan app
```

## Email Template URLs

### Untuk Invitation Email

**Subject:** Undangan Bergabung ke [Nama Keluarga]

**Button Text:** 📱 Download Aplikasi & Bergabung

**Link:** Magic link yang mengarah ke `get-app.html?source=email&familyId=[FAMILY_ID]`

**Implementation:** Menggunakan `supabase.functions.invoke("send-invitation-email")` dengan custom HTML template dan magic link

**Flow:** User klik tombol → Magic link redirect ke halaman download (Play Store/App Store) → Download dan login dengan email undangan → Otomatis bergabung ke keluarga

### Untuk Verification Email

**Subject:** Verifikasi Email Anda

**Button Text:** Verifikasi Email

**Link:**

```
https://tataarto.netlify.app/index.html
```

## Konfigurasi Temporary Links

### APK Download Link

Saat ini menggunakan placeholder:

```
https://expo.dev/accounts/YOUR_ACCOUNT/projects/tata-arto/builds
```

**Update dengan actual URL:**

```
https://example.com/releases/tata-arto.apk
```

Location: `signup.html` line ~167 & `download.html` line ~450

### Expo Build Link

Gunakan EAS Build untuk upload APK:

```bash
# Build APK
eas build --platform android --non-interactive

# Publish to EAS
```

Lalu ambil link dari EAS dan update di halaman.

## Deployment ke Netlify

### 1. Deploy

```bash
cd tata-arto-web
netlify deploy --prod --dir .
```

### 2. Domain Setup

```
Site URL: https://tataarto.netlify.app/
Custom Domain: (if available) tata-arto.com
```

### 3. Redirects (Config)

File `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## URL Parameters Tracking

### Utama:

- `source` - Where did user come from (email, web, direct)
- `familyId` - Which family is inviting
- `invitationId` - Specific invitation ID

### Contoh:

```
https://tataarto.netlify.app/signup.html?source=email&familyId=abc123&invitationId=def456
```

## Scripts & Analytics

### Email Tracking

File: [Halaman HTML] - `<script>` section

```javascript
const urlParams = new URLSearchParams(window.location.search);
const source = urlParams.get("source");
const familyId = urlParams.get("familyId");
```

### Deep Linking (Future)

```javascript
// Jika app sudah installed
exp://abcd1234.exp.host/--/...
```

## Support & Troubleshooting

### APK Download Issues

1. Check storage (minimum 100MB)
2. Enable "Unknown Sources" in Settings
3. Check internet connection
4. Try Expo Go alternative

### Email Verification Stuck

1. Check spam folder
2. Request verification resend
3. Check email in Supabase Auth
4. Verify email domain in Supabase settings

## Future Updates

### Planned:

- [ ] Google Play Store listing
- [ ] Apple App Store listing
- [ ] Deep linking to app if installed
- [ ] Analytics dashboard
- [ ] Custom domain (tata-arto.com)
- [ ] SSL certificate
- [ ] CDN caching

## Notes

⚠️ **Important:**

- Update `YOUR_ACCOUNT` dan `YOUR_BUILD_ID` dengan actual values
- Test semua link sebelum mengirim email
- Backup netlify.toml jika ada changes
- Monitor analytics untuk track download rates
