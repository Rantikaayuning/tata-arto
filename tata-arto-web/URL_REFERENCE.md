# 🔗 Quick Reference - URLs & Links

## Base URL

```
https://tataarto.netlify.app/
```

---

## Public Pages

### 1. Home / Verification Page

**URL:** `https://tataarto.netlify.app/`
**Purpose:** Email verification & account confirmation
**Use when:** User baru selesai sign up

---

### 2. Signup & Join (MAIN INVITATION PAGE)

**URL:** `https://tataarto.netlify.app/signup.html`
**Parameters:**

- `source` - Tracking source (email, web, direct)
- `familyId` - Family ID yang mengundang
- `invitationId` - Specific invitation ID

**Full URL Example:**

```
https://tataarto.netlify.app/signup.html?source=email&familyId=550e8400-e29b-41d4-a716-446655440000&invitationId=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Use when:**

- ✅ Member invitation email
- ✅ Social media promotion
- ✅ Direct family joining

---

### 3. Invitation Confirmation

**URL:** `https://tataarto.netlify.app/invite.html`
**Parameters:** (optional)

- `familyId` - Family info

**Use when:**

- ✅ User sudah verified email
- ✅ Ready to download app

---

### 4. APK Download Guide

**URL:** `https://tataarto.netlify.app/download.html`
**Parameters:**

- `source` - Download source tracking
- `familyId` - For analytics

**Full URL Example:**

```
https://tataarto.netlify.app/download.html?source=email&familyId=550e8400-e29b-41d4-a716-446655440000
```

**Features:**

- Step-by-step APK installation guide
- FAQ section
- Expo Go alternative method
- APK download direct link

---

## Email Links Template

### Undangan Bergabung (Main Flow)

```
Subject: [Nama User] mengundang Anda ke [Nama Keluarga] di tata arto

Button Text: "🚀 Buat Akun dan Gabung"
Link: https://tataarto.netlify.app/signup.html?source=email&familyId=FAMILY_ID
```

### Verifikasi Email

```
Subject: Verifikasi Email Anda - tata arto

Button Text: "✅ Verifikasi Email"
Link: https://tataarto.netlify.app/index.html
```

### Download Pengingat

```
Subject: Jangan lupa download tata arto!

Button Text: "📥 Download Sekarang"
Link: https://tataarto.netlify.app/download.html?source=email&familyId=FAMILY_ID
```

---

## Deep Link Format (Future - ketika app sudah di store)

### Direct App Opening (jika app installed)

```
tata-arto://invite/FAMILY_ID/INVITATION_ID
tata-arto://family/FAMILY_ID
tata-arto://profile
```

### Fallback

```
Jika app tidak installed → redirect ke signup.html
```

---

## Parameter Reference

### source parameter values

| Value    | Meaning                |
| -------- | ---------------------- |
| `email`  | Came from email link   |
| `web`    | Came from website      |
| `social` | Came from social media |
| `direct` | Direct app navigation  |
| `qr`     | Scanned QR code        |
| `test`   | Testing purposes       |

### Example Parameters

```javascript
// Full URL dengan semua parameter
const inviteUrl = new URL("https://tataarto.netlify.app/signup.html");
inviteUrl.searchParams.append("source", "email");
inviteUrl.searchParams.append(
  "familyId",
  "550e8400-e29b-41d4-a716-446655440000",
);
inviteUrl.searchParams.append(
  "invitationId",
  "f47ac10b-58cc-4372-a567-0e02b2c3d479",
);
inviteUrl.searchParams.append("inviterName", "John Doe");
inviteUrl.searchParams.append("familyName", "Keluarga Besar");

// Hasil:
// https://tataarto.netlify.app/signup.html?source=email&familyId=550e8400-e29b-41d4-a716-446655440000&invitationId=f47ac10b-58cc-4372-a567-0e02b2c3d479&inviterName=John+Doe&familyName=Keluarga+Besar
```

---

## Google Play Store (Temporary)

```
Status: Coming Soon ⏳

Link: https://play.google.com/store/apps/details?id=com.tataarto.app
(Update ketika app sudah live)
```

---

## App Store (Temporary)

```
Status: Coming Soon ⏳

Link: https://apps.apple.com/app/tata-arto/id123456789
(Update ketika app sudah live)
```

---

## APK Download (Direct)

```
Status: Testing/Beta 🔧

Link: https://example.com/releases/tata-arto-v1.0.0.apk

Host platform options:
- EAS Build: https://expo.dev/accounts/YOUR_ACCOUNT/projects/tata-arto/builds
- GitHub Releases: https://github.com/YOUR_REPO/releases/download/v1.0.0/tata-arto.apk
- Firebase Storage: https://storage.googleapis.com/.../tata-arto.apk
- Personal server: https://yourdomain.com/apk/tata-arto.apk
```

---

## Expo Go (Quick Test)

```
Platform: Google Play Store
ID: host.exp.exponent

Direct Link:
https://play.google.com/store/apps/details?id=host.exp.exponent&hl=id

QR Code: (akan di-generate di homepage nantinya)
```

---

## Social Media Links (Future)

### Instagram

```
https://instagram.com/tataarto.app
```

### Twitter

```
https://twitter.com/tataarto_app
```

### Website

```
https://tata-arto.com (custom domain)
atau
https://tataarto.netlify.app/ (temporary)
```

---

## Analytics Tracking

### Link untuk GMail Campaign

```
https://tataarto.netlify.app/signup.html?source=email&campaign=gmail&familyId=FAMILY_ID&utm_source=email&utm_medium=family_invitation
```

### Link untuk SMS Campaign

```
https://tataarto.netlify.app/signup.html?source=sms&familyId=FAMILY_ID
```

### Link untuk Direct Message

```
https://tataarto.netlify.app/signup.html?source=dm&familyId=FAMILY_ID
```

---

## QR Code Generator

Generate QR codes untuk:

```
1. Main invite: https://tataarto.netlify.app/signup.html?source=qr
2. Download info: https://tataarto.netlify.app/download.html?source=qr
3. Direct app: tata-arto://invite/FAMILY_ID
```

Tools:

- https://qr-code-generator.com/
- https://www.qr-code-generator.com/ (API)
- Python: `pip install qrcode[pil]`

---

## Copy-Paste Ready URLs

```
❌ BEFORE (Not working)
https://tataarto.netlify.app/
https://tataarto.netlify.app/index.html

✅ AFTER (Working)
https://tataarto.netlify.app/signup.html?source=email&familyId=YOUR_FAMILY_ID

🎯 INVITE EMAIL LINK
https://tataarto.netlify.app/signup.html?source=email&familyId=YOUR_FAMILY_ID&invitationId=YOUR_INVITATION_ID&inviterName=John&familyName=Keluarga+Besar

📱 APK DOWNLOAD PAGE
https://tataarto.netlify.app/download.html?source=email&familyId=YOUR_FAMILY_ID

🎉 SUCCESS PAGE
https://tataarto.netlify.app/invite.html?familyId=YOUR_FAMILY_ID
```

---

## Update Checklist

- [ ] Replace `YOUR_FAMILY_ID` dengan actual ID sebelum sending
- [ ] Replace `YOUR_INVITATION_ID` dengan actual ID
- [ ] Test semua URL di browser
- [ ] Verify link encoding (terutama parameter dengan spaces)
- [ ] Test di mobile device
- [ ] Check email preview
- [ ] Setup analytics tracking
- [ ] Monitor click-through rates

---

## Notes

⚠️ **Important:**

- URL case-sensitive untuk file names
- Parameters tidak case-sensitive
- Double-check URL encoding
- Test production URLs sebelum launch
- Monitor 404 errors di Netlify analytics
