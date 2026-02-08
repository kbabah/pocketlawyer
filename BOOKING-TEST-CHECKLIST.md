# Booking Flow Test Checklist

## Test Credentials
- **Email:** test@example.com
- **Password:** Test@123

## Test Steps

### 1. Authentication ✓
- [ ] Go to http://localhost:3001/sign-in
- [ ] Enter email: test@example.com
- [ ] Enter password: Test@123
- [ ] Click "Sign In"
- [ ] **Expected:** Successfully signed in, redirected to home/dashboard
- [ ] **Verify:** User name/email appears in sidebar footer

### 2. Find a Lawyer ✓
- [ ] Click "Find Lawyers" in navigation or go to http://localhost:3001/lawyers
- [ ] **Expected:** See list of available lawyers
- [ ] **Verify:** Lawyers displayed with names, ratings, specialties
- [ ] Select any lawyer by clicking "View Profile" or "Book Consultation"

### 3. View Lawyer Profile ✓
- [ ] On lawyer profile page
- [ ] **Expected:** See lawyer details (photo, bio, specialties, pricing, availability)
- [ ] **Verify:** "Book Consultation" button is visible
- [ ] Click "Book Consultation" button

### 4. Booking Page Access (Critical Test) ✓
- [ ] Should land on `/lawyers/{id}/book` page
- [ ] **Expected:** See booking form (NOT sign-in prompt)
- [ ] **Verify:** 
  - ✅ Booking form is visible
  - ✅ Date picker is available
  - ✅ Time slots are shown
  - ✅ Consultation type options (video/phone/in-person)
  - ✅ Duration dropdown
  - ✅ Notes textarea
- [ ] **FAIL CONDITIONS:**
  - ❌ See "Sign In Required" message → Authentication bug
  - ❌ Redirected to sign-in page → isAnonymous check failing

### 5. Fill Booking Form ✓
- [ ] Select a date (future date, not today if it's late)
- [ ] Select an available time slot
- [ ] Choose consultation type (Video/Phone/In-Person)
- [ ] Select duration (30/60/90 minutes)
- [ ] Add notes (optional): "Test booking for quality assurance"
- [ ] **Verify:** Form validation works (shows errors if fields missing)

### 6. Submit Booking ✓
- [ ] Click "Book Consultation" or "Continue" button
- [ ] **Expected:** 
  - ✅ No "Please sign in" error
  - ✅ Booking created successfully
  - ✅ Success message appears
  - ✅ Redirected to confirmation page or bookings list
- [ ] **FAIL CONDITIONS:**
  - ❌ Error: "Please sign in to book a consultation" → isAnonymous check bug
  - ❌ Firestore permission error → Database rules issue
  - ❌ 500 error → Server-side error

### 7. Verify Booking Created ✓
- [ ] Go to "My Bookings" (in sidebar navigation)
- [ ] **Expected:** See the newly created booking
- [ ] **Verify:**
  - ✅ Booking appears in list
  - ✅ Shows correct lawyer name
  - ✅ Shows correct date/time
  - ✅ Status is "pending"
  - ✅ Can view booking details

### 8. Email Confirmation (If Enabled) ✓
- [ ] Check email (test@example.com)
- [ ] **Expected:** Confirmation email received
- [ ] **Note:** Email might not work if Resend API not configured in production
- [ ] **Acceptable:** No email if API keys not set (payment disabled for beta)

### 9. Lawyer View (If Test Account is Lawyer) ✓
- [ ] If test account is also a lawyer, go to `/lawyer/dashboard`
- [ ] **Expected:** See booking in lawyer's pending bookings
- [ ] **Verify:** Can view booking details from lawyer side

## Critical Tests (Must Pass)

### Test A: Anonymous User Blocked ✓
- [ ] Open incognito/private window
- [ ] Go to http://localhost:3001
- [ ] DON'T sign in (stay as guest)
- [ ] Go to `/lawyers` → Select a lawyer → Click "Book Consultation"
- [ ] **Expected:** 
  - ✅ See "Sign In Required" prompt
  - ✅ Cannot access booking form
  - ✅ "Sign In" and "Sign Up" buttons shown
- [ ] **FAIL:** If booking form is visible → Anonymous blocking not working

### Test B: Authenticated User Allowed ✓
- [ ] Sign in with test@example.com / Test@123
- [ ] Go to `/lawyers` → Select a lawyer → Click "Book Consultation"
- [ ] **Expected:**
  - ✅ Booking form immediately visible
  - ✅ Can fill out all fields
  - ✅ Can submit booking
  - ✅ Booking creates successfully
- [ ] **FAIL:** If "Sign In Required" shown → isAnonymous bug

### Test C: Form Validation ✓
- [ ] Sign in and go to booking page
- [ ] Try to submit WITHOUT selecting date
- [ ] **Expected:** Error "Please select a date"
- [ ] Try to submit WITHOUT selecting time
- [ ] **Expected:** Error "Please select a time"
- [ ] Select phone consultation without entering phone number
- [ ] **Expected:** Error "Please provide your phone number"

### Test D: Availability Check ✓
- [ ] Create first booking for specific time slot
- [ ] Try to create second booking for SAME time slot
- [ ] **Expected:** Error "This time slot is no longer available"
- [ ] **Verify:** Double-booking prevention works

## Known Status

### ✅ Fixed Issues
- [x] Anonymous users blocked from booking (commit 7319e05)
- [x] isAnonymous property set correctly (commit 7b5b64a)
- [x] Chat API working (commit 2c3c2b6)
- [x] Docker build successful (commit a43ea6f)
- [x] Firestore rules deployed

### ⚠️ Expected Behaviors
- **Payment Disabled:** No payment dialog shown (disabled for beta testing)
- **Email Notifications:** May not work if Resend API not configured
- **Meeting Links:** May be empty/null (lawyer adds later)

### 🔧 If Tests Fail

#### If "Sign In Required" shown for authenticated user:
1. Check browser console for errors
2. Verify user object: `console.log(user)`
3. Check if `user.isAnonymous === false`
4. If `isAnonymous` is `undefined`, the fix didn't apply
5. Clear browser cache and cookies, sign in again

#### If Firestore permission error:
1. Check Firebase Console → Firestore → Rules
2. Verify rules were deployed
3. Check if user is authenticated in Firebase Auth panel

#### If 500 server error:
1. Check terminal logs: `tail -50 /tmp/pocketlawyer-dev.log`
2. Look for specific error messages
3. Report full error stack

## Success Criteria

### ✅ Test Passes If:
1. Authenticated user can access booking form
2. Authenticated user can submit booking
3. Booking appears in "My Bookings"
4. Anonymous users are blocked (see sign-in prompt)
5. No console errors during flow
6. No server 500 errors

### ❌ Test Fails If:
1. Authenticated user sees "Sign In Required"
2. Booking submission shows "Please sign in" error
3. Firestore permission denied errors
4. 500 errors in console/terminal
5. Booking not created in database

## Test Results

**Test Date:** ___________  
**Tester:** ___________  
**Server:** http://localhost:3001  
**Branch:** main (commit 2c3c2b6)

### Overall Result:
- [ ] ✅ PASS - All critical tests passed
- [ ] ⚠️ PARTIAL - Some tests passed, minor issues
- [ ] ❌ FAIL - Critical functionality broken

### Notes:
_Record any issues, unexpected behavior, or questions here_

---

## Quick Test (30 seconds)
If you want a quick smoke test:
1. Sign in: test@example.com / Test@123
2. Go to: http://localhost:3001/lawyers
3. Click any lawyer → "Book Consultation"
4. **If you see the booking form:** ✅ WORKING
5. **If you see "Sign In Required":** ❌ BUG

---

**Created:** 2026-02-08  
**Last Updated:** After commit 2c3c2b6  
**Related Commits:** 7319e05, 7b5b64a, a43ea6f
