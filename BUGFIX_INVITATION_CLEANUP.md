# Bug Fix: Invitation Record Cleanup on Email Failure

## Problem

Ketika admin mencoba mengundang user dengan email yang tidak valid atau email sending gagal, invitation record tetap tersimpan di database. Ini mencegah re-invite dengan error "Undangan sudah pernah dikirim ke email ini" meskipun undangan pertama gagal.

### Scenario yang Bermasalah

1. Admin invites `john@wrong.com`
2. Email send gagal (e.g., invalid email, SMTP error)
3. Invitation record tetap ada di database dengan status='pending'
4. Admin retries dengan email lain atau sama → error "Undangan sudah dikirim sebelumnya"
5. User terjebak dan tidak bisa di-invite kembali tanpa manual database cleanup

## Root Cause

Di `useExpenseStore.ts` function `inviteMember()`:

- Insertion ke `family_invitations` terjadi SEBELUM email send attempt
- Ketika email gagal, record tetap tersimpan dengan pesan hanya di console
- Code mengembalikan `success: true` meskipun email gagal
- Tidak ada rollback atau cleanup jika email send fails

## Solution Implemented

### 1. **Email Format Validation (line 365-369)**

```typescript
// Validate email format BEFORE creating any record
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(trimmedEmail)) {
  return { success: false, message: "Format email tidak valid" };
}
```

✅ Early validation mencegah invalid email records masuk ke database

### 2. **Database Query for Existing Invitations (line 371-378)**

```typescript
// Query database directly (tidak bergantung pada store state)
const { data: existingInvitationsDb, error: queryError } = await supabase
  .from("family_invitations")
  .select("id, status")
  .eq("invited_email", trimmedEmail)
  .eq("family_id", familyId);
```

✅ Query database langsung lebih reliable daripada `get().pendingInvitations`
✅ Memastikan kami punya data terbaru, tidak stale state

### 3. **Delete Existing with Error Handling (line 380-395)**

```typescript
if (existingInvitationsDb && existingInvitationsDb.length > 0) {
  // Hapus dengan proper error checking
  const { error: deleteError } = await supabase
    .from("family_invitations")
    .delete()
    .eq("invited_email", trimmedEmail)
    .eq("family_id", familyId);

  if (deleteError) {
    return {
      success: false,
      message: "Gagal menghapus undangan lama. Coba lagi.",
    };
  }
}
```

✅ Delete dengan error handling mencegah race condition
✅ User tahu kalau ada problem alih-alih silent failure

### 4. **Return ID on Insert + Track Email Status (line 456-468)**

```typescript
const { data: newInvitation, error: invError } = await supabase
  .from("family_invitations")
  .insert({
    family_id: familyId,
    invited_email: trimmedEmail,
    invited_by: user.id,
    status: "pending",
  })
  .select("id") // ← Get the ID back
  .single();

let emailSent = false; // ← Track actual status
```

✅ Capture invitation ID untuk potential cleanup
✅ Track email status separately dari insert status

### 5. **Check Email Response (line 485-491)**

```typescript
const emailResponse = await supabase.functions.invoke("send-invitation-email", {
  body: { ... },
});

// Check if email function returned an error
if (emailResponse.error) {
  throw emailResponse.error;
}

emailSent = true;  // ← Only set true if successful
```

✅ Tidak hanya catch exception, tapi check response error
✅ Handle both throw dan silent error scenarios

### 6. **Delete on Failure (line 493-510)**

```typescript
catch (emailErr) {
  console.error("[inviteMember] Email send failed:", emailErr);
  // Email gagal — hapus invitation record untuk mencegah orphaned records
  if (newInvitation?.id) {
    const { error: deleteErr } = await supabase
      .from("family_invitations")
      .delete()
      .eq("id", newInvitation.id);

    if (deleteErr) {
      console.error("[inviteMember] Failed to clean up invitation...");
    }
  }

  return {
    success: false,
    message: "Gagal mengirim email undangan. Cek email address dan coba lagi.",
  };
}
```

✅ **KEY FIX**: Delete invitation record jika email gagal
✅ Mencegah orphaned records di database
✅ User bisa retry without "sudah dikirim" error

### 7. **Verify Email Success (line 512-524)**

```typescript
if (!emailSent) {
  // Email function returned a response but it wasn't successful
  if (newInvitation?.id) {
    await supabase
      .from("family_invitations")
      .delete()
      .eq("id", newInvitation.id);
  }
  return {
    success: false,
    message: "Gagal mengirim email undangan. Cek email address dan coba lagi.",
  };
}
```

✅ Catch case dimana email function return response tapi fails
✅ Cleanup record sebelum return error

## Testing Strategy

### Test Case 1: Invalid Email Format

```
1. Admin invite: "john@nodomain"
2. Expected: Error "Format email tidak valid"
3. Database: No record created ✓
4. Next attempt: Admin can retry without issue ✓
```

### Test Case 2: Email Send Fails (SMTP Error)

```
1. Admin invite: valid@gmail.com
2. System creates record (DB shows pending invitation)
3. Email function raises exception
4. System detects error, deletes record from DB
5. Expected: Error "Gagal mengirim email undangan"
6. Database: Record deleted ✓
7. Next attempt: Admin can retry without "sudah dikirim" error ✓
```

### Test Case 3: Email Function Returns Error in Response

```
1. Admin invite: valid@email.com
2. System creates record
3. Email function returns { error: "... " }
4. System detects response error, deletes record
5. Expected: Error message returned to user
6. Database: Record deleted ✓
7. Next attempt: Admin can retry ✓
```

### Test Case 4: Successful Invitation (Happy Path)

```
1. Admin invite: valid@gmail.com
2. Record created with status='pending'
3. Email send successful (no error, emailSent=true)
4. Expected: Success message "Undangan terkirim"
5. Database: Record stays with status='pending' ✓
```

### Test Case 5: Existing User Invitation

```
1. Admin invite: existing@profile.com (user sudah punya account)
2. Record NOT created as pending
3. Record created with status='accepted'
4. Email sent as notification
5. Expected: User immediately appears as joined member ✓
```

## Error Messages Users Will See

### Before Fix

❌ "Undangan sudah pernah dikirim ke email ini" (even though it failed)

### After Fix

✅ "Format email tidak valid" → Invalid format detected early
✅ "Gagal mengirim email undangan. Cek email address dan coba lagi." → Email error, record cleaned up
✅ "Gagal menghapus undangan lama. Coba lagi." → DB error on cleanup
✅ "Undangan terkirim! Email notifikasi telah dikirim." → Success

## Database Implications

### Invitation Record Lifecycle

```
BEFORE FIX:
Invite → Record Created → Email Fails → Record Stays (ORPHANED)

AFTER FIX:
Invite → Validate Email → Query for existing →
  Delete existing if found →
  Create new record →
  Send Email →
    If Success: Keep record ✓
    If Error: Delete record ✓
```

### No Manual Cleanup Needed

✅ No more orphaned records in database
✅ Users can be re-invited after email errors
✅ Data stays clean and consistent

## Files Modified

- [src/context/useExpenseStore.ts](src/context/useExpenseStore.ts#L355-L545)
  - Updated `inviteMember()` function (lines 355-545)
  - Added email validation
  - Added database query for existing invitations
  - Added cleanup on email failure
  - Better error handling and logging

## Backwards Compatibility

✅ No schema changes
✅ No API changes  
✅ Existing clients continue to work
✅ Only internal logic improved

## Next Steps

1. Test all 5 test cases above
2. Monitor console logs for cleanup operations
3. Verify database stays clean
4. Deploy to production
5. Monitor user reports of invitation issues
