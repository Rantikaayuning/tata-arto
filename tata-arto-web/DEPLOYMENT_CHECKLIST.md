# 🚀 Deployment & Launch Checklist

## Pre-Launch Preparation

### 1. Netlify Setup

- [ ] Authorize GitHub/GitLab repository
- [ ] Link repository to Netlify site
- [ ] Configure custom domain (optional - otherwise use \*.netlify.app)
- [ ] Setup SSL certificate (automatic with Netlify)
- [ ] Configure build command: `echo 'No build needed'`
- [ ] Configure publish directory: `.` (root)

### 2. Environment Variables

- [ ] Review `netlify.toml` file
- [ ] Check all redirect rules are correct
- [ ] No hardcoded secrets in files
- [ ] Verify file permissions

### 3. HTML Files Verification

- [ ] `index.html` - Email verification page ✓
- [ ] `signup.html` - Main invitation page ✓
- [ ] `invite.html` - Confirmation page ✓
- [ ] `download.html` - APK guide page ✓
- [ ] All files have correct encoding (UTF-8)
- [ ] All links are relative or absolute HTTPS

### 4. Email Template Setup (Supabase)

- [ ] Access Supabase Dashboard
- [ ] Go to Authentication → Email Templates
- [ ] Update "Invite User" template:
  - Copy from `EMAIL_TEMPLATE_INVITATION.html`
  - Enable custom template toggle
  - Paste HTML content
  - Save changes
- [ ] Test email sending:
  - [ ] Send test invite email
  - [ ] Verify email arrives
  - [ ] Check link works
  - [ ] Verify styling

### 5. URL Parameters Testing

Before going live, test all URLs:

#### Test Signup Page

```bash
# Open in browser
https://tataarto.netlify.app/signup.html?source=test&familyId=test-123

# Expected:
✓ Page loads without 404
✓ All styling is correct
✓ Download buttons are visible
✓ Features section shows correctly
```

#### Test Download Page

```bash
https://tataarto.netlify.app/download.html?source=test&familyId=test-123

# Expected:
✓ Page loads
✓ Instructions are clear
✓ All buttons work
✓ Responsive on mobile
```

#### Test Index Page

```bash
https://tataarto.netlify.app/

# Expected:
✓ Email verification UI loads
✓ Loading animation works
```

#### Test Invite Page

```bash
https://tataarto.netlify.app/invite.html

# Expected:
✓ Confirmation message shows
✓ Features listed
✓ Download buttons visible
```

### 6. Mobile Responsiveness

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] Check button sizes (min 44x44px)
- [ ] Verify text readability
- [ ] Check form inputs

### 7. Performance Testing

- [ ] Check page load time < 2s
- [ ] Google PageSpeed Insights score
- [ ] Lighthouse score > 80
- [ ] No console errors
- [ ] No broken images/links

### 8. Accessibility Testing

- [ ] Color contrast ratio > 4.5:1
- [ ] Keyboard navigation works
- [ ] Alt text for images (if any)
- [ ] Proper heading hierarchy
- [ ] Form labels present

---

## Launch Day

### 1. Final Checklist

- [ ] All files committed to git
- [ ] Branch merged to main/master
- [ ] No console errors in browser dev tools
- [ ] Netlify build successful
- [ ] Site preview loads correctly

### 2. Go Live

```bash
# Deploy to production (if not auto-deploy)
netlify deploy --prod --dir .

# Verify
curl -I https://tataarto.netlify.app
# Expected: 200 OK
```

### 3. Database Setup (Supabase)

- [ ] Email templates updated
- [ ] RLS policies correct
- [ ] Webhook configured (if needed)
- [ ] Rate limiting configured
- [ ] Backups enabled

### 4. First Email Test

- [ ] Send test invitation to personal email
- [ ] Verify email receives
- [ ] Click link and verify landing on signup.html
- [ ] URL parameters pass through correctly
- [ ] Mobile view loads correctly

### 5. Monitoring Setup

- [ ] Google Analytics configured
- [ ] Netlify Analytics enabled
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Email open/click tracking
- [ ] APK download tracking

---

## Post-Launch (Week 1)

### Daily Checks

- [ ] Monitor error rates
- [ ] Check email delivery
- [ ] Monitor traffic trends
- [ ] Verify no 404 errors
- [ ] Check APK download metrics

### Weekly Reports

- [ ] Total invitation emails sent
- [ ] Click-through rate (CTR)
- [ ] Signup completion rate
- [ ] Mobile vs Desktop breakdown
- [ ] Source of traffic breakdown

---

## Production Monitoring

### Critical Metrics

```
Page Load Time: < 2s
Error Rate: < 1%
Email Delivery: > 95%
Signup Conversion: Track progress
Download Rate: Track progress
```

### Alerts to Setup

- 404 errors on main pages
- High error rates
- Email send failures
- Unexpected traffic spikes
- SSL certificate expiry

### Tools to Use

```
Monitoring:
- Netlify Analytics (built-in)
- Google Analytics
- Uptime monitors (Pingdom, UptimeRobot)

Email:
- Supabase email logs
- SendGrid/Mailgun logs (if using custom SMTP)

Errors:
- Sentry / LogRocket
- Netlify function logs
```

---

## File Checklist Before Deploy

```
tata-arto-web/
├── index.html                          [✓] Main page
├── signup.html                         [✓] Invitation page
├── invite.html                         [✓] Confirmation page
├── download.html                       [✓] APK guide
├── netlify.toml                        [✓] Config file
├── README.md                           [✓] Documentation
├── EMAIL_SETUP.md                      [✓] Email guide
├── URL_REFERENCE.md                    [✓] URL reference
├── EMAIL_TEMPLATE_INVITATION.html      [✓] Email template
└── .netlify/                           [✓] Netlify config (auto-generated)
```

---

## Rollback Plan

If something goes wrong:

### Step 1: Quick Rollback

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Netlify auto-deploys
# Or manually rollback in Netlify Dashboard
```

### Step 2: Check Netlify Deploy History

- Netlify Dashboard → Deploys
- Click previous successful deploy
- Click "Publish deploy"

### Step 3: Contact Support

- Netlify support if infrastructure issue
- Supabase support if email issue
- Check GitHub status page

---

## Common Issues & Fixes

### Email not received

```
1. Check spam/junk folder
2. Verify sender domain reputation
3. Check Supabase email logs
4. Try resending after 5 minutes
5. Check rate limiting not exceeded
```

### Page 404 errors

```
1. Check file names (case-sensitive)
2. Verify netlify.toml redirects
3. Clear browser cache (Ctrl+Shift+Del)
4. Check Netlify deploy logs
5. Verify git commit contains all files
```

### URL parameters not working

```
1. Check URL encoding (spaces = %20)
2. Verify parameter names match script
3. Test URL manually in browser
4. Check browser console for errors
5. Verify JavaScript is enabled
```

### Styling looks wrong

```
1. Clear browser cache
2. Check CSS file loads (F12 → Network)
3. Verify all CSS paths are correct
4. Test in different browser
5. Check CSS syntax errors
```

---

## Post-Launch Optimization

### Phase 2 (Week 2-4)

- [ ] A/B test email templates
- [ ] Optimize signup form
- [ ] Add progress indicators
- [ ] Setup email tracking
- [ ] Optimize images

### Phase 3 (Month 2)

- [ ] Custom domain setup
- [ ] SEO optimization
- [ ] Social media integration
- [ ] Analytics dashboard
- [ ] Performance improvements

### Phase 4 (Month 3+)

- [ ] Google Play Store submission
- [ ] App Store submission
- [ ] Deep linking via QR codes
- [ ] Campaign tracking
- [ ] Conversion optimization

---

## Contacts & Support

### Netlify Support

- Email: support@netlify.com
- Docs: netlify.com/docs

### Supabase Support

- Dashboard help: supabase.com/docs
- Email issues: Check console → Email logs
- Contact: support@supabase.com

### GitHub Issues

- Create issue for code problems
- Use detailed reproduction steps

---

## Success Metrics (Target)

```
Week 1 Goals:
- 100% email delivery ✓
- < 2% bounce rate ✓
- 15%+ click-through rate (provisional)
- 0 (zero) server errors ✓

Month 1 Goals:
- 5%+ signup conversion rate
- 80%+ APK download from signup
- 50%+ app retention after 7 days
- Zero critical bugs

Quarter 1 Goals:
- Live on Google Play Store
- Live on App Store
- 1000+ active users
- 90%+ email delivery
```

---

## Final Verification

Before announcing publicly:

- [ ] Test all flows end-to-end
- [ ] Email template looks good on Gmail, Outlook, Apple Mail
- [ ] Links click correctly from email
- [ ] App launches correctly from downloaded APK
- [ ] user data syncs properly
- [ ] Invitation auto-accept works
- [ ] Family members list updates correctly
- [ ] No data loss scenarios
- [ ] Error states handled gracefully

✅ Ready to Launch!
