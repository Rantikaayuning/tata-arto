# 📧 Email & URL Setup Guide

## Email Template di Supabase

### 1. Akses Email Templates

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Navigate ke: **Authentication → Email Templates**

### 2. Update Invite User Template

**Langkah:**

1. Klik pada "Invite User" email template
2. Pilih **Use custom template** (jika belum diaktifkan)
3. Copy-paste isi dari `EMAIL_TEMPLATE_INVITATION.html`
4. Update variable `{{ link }}` - Supabase akan otomatis mengganti dengan invite link

**Template Variable:**

- `{{ link }}` → Invitation link dari Supabase
- `{{ email }}` → Email tujuan
- `{{ data.invited_by }}` → Nama yang mengundang
- `{{ data.family_name }}` → Nama keluarga

### 3. URL Redirect Configuration

**Di Supabase, URL invitation link default:**

```
https://yourdomain.com/auth/confirm?token=...
```

**Kita ingin mengubah menjadi:**

```
https://tataarto.netlify.app/signup.html?source=email&familyId=...
```

**Solusi:** Update di `netlify.toml` dengan redirect rules

## Konfigurasi URL di Netlify

### File: `netlify.toml`

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

# Redirect email verification to signup page
[[redirects]]
  from = "/auth/confirm"
  to = "/signup.html"
  status = 301
  query = {token = ":token", "source" = "email"}

# Redirect login confirmation
[[redirects]]
  from = "/auth/verify"
  to = "/signup.html"
  status = 301

# Default fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Integration Steps

### 1. Get Family ID untuk Email

Di aplikasi mobile (useExpenseStore.ts atau inviteMember function):

```typescript
// Saat mengirim invitation, tambahkan family_id ke invitation record
const familyInvitation = {
  family_id: userStore.familyId, // ← Tambahkan ini
  invited_email: email,
  invited_by: currentUser.id,
  status: "pending",
  created_at: new Date(),
};
```

### 2. Update Email Link

Saat mengirim email dari Supabase, customize link:

```javascript
// Di supabase function atau webhook
const signupUrl = new URL("https://tataarto.netlify.app/signup.html");
signupUrl.searchParams.append("source", "email");
signupUrl.searchParams.append("familyId", familyId);
signupUrl.searchParams.append("invitationId", invitationId);

// Replace {{ link }} dengan signupUrl
emailBody = emailBody.replace("{{ link }}", signupUrl.toString());
```

## Email Flow Diagram

```
User A (Admin) → Membuka MembersScreen
                 ↓
            Masukkan email User B
                 ↓
            API Call: inviteMember(email)
                 ↓
            Server: Create family_invitation record
                 ↓
            Server: Send Email di Supabase
                 ↓
Email Template dengan Custom Link:
https://tataarto.netlify.app/signup.html?source=email&familyId=ABC123&invitationId=XYZ789
                 ↓
User B: Klik link di email
                 ↓
Browser: Buka signup.html
                 ↓
App: Deteksi familyId dari URL
                 ↓
App: Pre-fill form dengan family info
                 ↓
User B: Daftar atau login
                 ↓
Auto-accept invitation saat login
```

## Testing Checklist

- [ ] Email dikirim ke inbox user
- [ ] Link di email tidak rusak
- [ ] Klik link membuka signup.html
- [ ] URL parameters terbaca dengan benar
- [ ] familyId ditampilkan di halaman
- [ ] Auto-accept invitation bekerja
- [ ] User berhasil login di app
- [ ] User muncul di family members list

## URL Format Reference

### Untuk Email Invitation

```
https://tataarto.netlify.app/signup.html?source=email&familyId=UUID&invitationId=UUID
```

### Untuk Test Manual

```
https://tataarto.netlify.app/signup.html?source=test&familyId=test-family-123
```

### Untuk Verification Email

```
https://tataarto.netlify.app/index.html
```

### Untuk APK Download

```
https://tataarto.netlify.app/download.html?source=email&familyId=UUID
```

## Environment Variables

### Supabase .env

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Netlify Environment (di Netlify Dashboard)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Troubleshooting

### Email tidak terkirim

1. ✓ Verify email domain di Supabase
2. ✓ Check "Custom SMTP" settings
3. ✓ Pastikan rate limit tidak terlampaui
4. ✓ Check spam/junk folder

### Link di email rusak

1. ✓ Check email template syntax
2. ✓ Validate URL encoding
3. ✓ Test dengan email test

### URL Parameters tidak terbaca

1. ✓ Check browser console untuk errors
2. ✓ Verify URL encoding di email
3. ✓ Test URL di `signup.html` script

### familyId tidak ter-auto-fill

1. ✓ Verify `new URL(window.location.search)` syntax
2. ✓ Check if familyId ada di database
3. ✓ Test dengan console.log(familyId)

## Production Checklist

- [ ] Email template sudah custom
- [ ] Netlify redirect rules aktif
- [ ] Domain custom configured (atau gunakan \*.netlify.app)
- [ ] APK download link valid
- [ ] Testing semua flow
- [ ] Monitoring email delivery
- [ ] Backup email templates
- [ ] Setup analytics tracking

## Future Improvements

- [ ] SMTP custom domain untuk email credibility
- [ ] Email tracking (open/click rates)
- [ ] A/B testing different email templates
- [ ] Progressive Web App (PWA) for signup
- [ ] SMS backup untuk verification
- [ ] Magic link authentication
