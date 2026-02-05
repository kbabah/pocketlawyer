# How to Access Lawyer & Admin Features - Complete Guide

## 🎯 **Quick Access Summary**

| Feature | How to Access | Who Can Access |
|---------|--------------|----------------|
| **Lawyer Registration** | Profile menu → "Register as Lawyer" | Any authenticated user |
| **Lawyer Dashboard** | Profile menu → "Lawyer Dashboard" | Approved lawyers only |
| **Admin Dashboard** | Profile menu → "Admin Dashboard" | Admin users only |
| **User Bookings** | Sidebar → "My Bookings" | Any authenticated user |

---

## 👨‍⚖️ **How Lawyers Sign Up**

### **Step-by-Step Process:**

#### **1. Create Account (if new user):**
```
1. Visit http://localhost:3000/sign-up
2. Fill in:
   - First Name
   - Last Name
   - Email
   - Password
3. Click "Sign Up"
```

#### **2. Register as Lawyer:**

**Option A - From Profile Menu:**
```
1. Sign in to your account
2. Click on your profile (bottom of sidebar)
3. Select "Register as Lawyer"
4. Fill out the registration form
```

**Option B - Direct Link:**
```
Visit: http://localhost:3000/lawyers/register
```

**Option C - From Lawyers Page:**
```
1. Go to /lawyers
2. Click "Become a Lawyer" button (top right)
3. Fill out the registration form
```

#### **3. Fill Registration Form:**

The form requires:
- ✅ Personal Information:
  - Full Name
  - Email
  - Phone Number
  - Bar Number (e.g., CM/BAR/2020/12345)
  - City/Region
  - Years of Experience
  - Office Address

- ✅ Professional Information:
  - Specializations (click badges to select)
    - Criminal Law
    - Family Law
    - Corporate Law
    - Real Estate Law
    - Labor Law
    - Tax Law
    - Immigration Law
    - Intellectual Property
    - Civil Litigation
    - Contract Law
    - Constitutional Law
    - Environmental Law
  
  - Languages (click badges to select)
    - English
    - French
    - Pidgin English
    - Douala
    - Fulfulde
    - Ewondo
  
  - Professional Bio (describe your experience)
  - Education & Qualifications (can add multiple)
  - Consultation Fee (XAF per hour)

#### **4. Submit & Wait:**
```
1. Click "Submit Registration"
2. See success confirmation
3. Wait for admin approval (2-3 business days)
4. Receive email notification when approved
```

---

## 👨‍💼 **How Admins Access Dashboard**

### **Step 1: Sign In as Admin**
```
1. Sign in with admin account
2. Make sure you have admin privileges
```

### **Step 2: Access Admin Dashboard**

**Option A - From Profile Menu (EASIEST):**
```
1. Click on your profile (bottom of sidebar)
2. Select "Admin Dashboard"
3. You're now at /admin/lawyers
```

**Option B - Direct URL:**
```
Visit: http://localhost:3000/admin/lawyers
```

### **What Admins Can Do:**

#### **1. View Pending Registrations:**
- See list of all pending lawyer applications
- Each card shows:
  - Name & contact info
  - Bar number
  - Specializations
  - Languages
  - Experience & hourly rate

#### **2. Review Lawyer Details:**
- Click "View Details" button
- See full profile:
  - Contact information
  - Professional information
  - Bio
  - Education
  - Specializations
  - Languages

#### **3. Approve Lawyer:**
```
1. Click "View Details" or "Approve" button
2. Confirm approval
3. Lawyer is approved immediately
4. Lawyer receives email notification
5. Lawyer can now:
   - Access lawyer dashboard
   - Set availability
   - Receive bookings
```

#### **4. Reject Lawyer:**
```
1. Click "Reject" button
2. Enter rejection reason (required)
3. Confirm rejection
4. Lawyer receives email with reason
5. Lawyer can reapply if issues fixed
```

---

## 🗺️ **Complete Navigation Map**

### **Sidebar Navigation:**
```
📂 Navigation
  🏠 Home
  📄 Documents
  ⚖️ Find a Lawyer
  📅 My Bookings (logged in users only)

💬 Chat
  ➕ Start New Conversation
  📅 Chat History

👤 User Profile (dropdown)
  👤 Profile Settings
  ⚖️ Register as Lawyer
  💼 Lawyer Dashboard
  ⚙️ Admin Dashboard
  🚪 Sign Out
```

### **Direct URLs:**

```bash
# Public Pages
http://localhost:3000/                    # Home
http://localhost:3000/lawyers             # Browse lawyers
http://localhost:3000/lawyers/[id]        # Lawyer profile

# Authenticated Users
http://localhost:3000/lawyers/register    # Register as lawyer
http://localhost:3000/lawyers/[id]/book   # Book consultation
http://localhost:3000/bookings            # User bookings

# Approved Lawyers
http://localhost:3000/lawyer/dashboard    # Lawyer dashboard

# Admin
http://localhost:3000/admin/lawyers       # Admin approval dashboard
```

---

## 🎭 **User Roles & Access**

### **Regular User:**
- ✅ Browse lawyers
- ✅ View lawyer profiles
- ✅ Book consultations
- ✅ Manage bookings
- ✅ Leave reviews
- ✅ Register as lawyer

### **Registered Lawyer (Pending):**
- ✅ All regular user features
- ⏳ Waiting for admin approval
- ❌ Cannot access lawyer dashboard yet
- ❌ Not visible in lawyer directory yet

### **Approved Lawyer:**
- ✅ All regular user features
- ✅ Access lawyer dashboard
- ✅ Manage bookings
- ✅ Set availability
- ✅ Confirm/decline consultations
- ✅ View earnings
- ✅ Visible in lawyer directory

### **Admin:**
- ✅ All features
- ✅ Access admin dashboard
- ✅ Approve/reject lawyers
- ✅ Manage platform

---

## 📝 **Common Questions**

### **Q: How do I know if I'm approved as a lawyer?**
A: You'll receive an email notification. Also try accessing `/lawyer/dashboard` - if you're approved, it will load. If not, you'll see an error.

### **Q: Can users see pending lawyers?**
A: No, only approved lawyers appear in the directory. Pending lawyers are only visible to admins.

### **Q: How do I make someone an admin?**
A: Currently, admin status is managed in Firebase Console:
1. Go to Firebase Console
2. Navigate to Authentication
3. Select the user
4. Add a custom claim: `{ "admin": true }`

### **Q: Can a lawyer also book other lawyers?**
A: Yes! Lawyers are also regular users and can book consultations with other lawyers.

### **Q: Where do rejected lawyers see rejection reason?**
A: The rejection reason is stored in the database and can be shown on the registration page or sent via email.

---

## 🔍 **Testing Checklist**

### **Test Lawyer Registration:**
- [ ] Create account or sign in
- [ ] Click profile → "Register as Lawyer"
- [ ] Fill out form with test data
- [ ] Submit registration
- [ ] See success confirmation
- [ ] Check admin dashboard for pending request

### **Test Admin Approval:**
- [ ] Sign in as admin
- [ ] Click profile → "Admin Dashboard"
- [ ] See pending lawyer registration
- [ ] Click "View Details"
- [ ] Click "Approve"
- [ ] Confirm lawyer disappears from pending list

### **Test Approved Lawyer:**
- [ ] Sign in as approved lawyer
- [ ] Click profile → "Lawyer Dashboard"
- [ ] See dashboard with stats
- [ ] Click "Manage Availability"
- [ ] Set working hours
- [ ] Save availability

### **Test Full Flow:**
1. User registers as lawyer
2. Admin approves
3. Lawyer sets availability
4. User books consultation
5. Lawyer confirms booking
6. Consultation happens
7. Lawyer marks complete
8. User leaves review

---

## 🚀 **Quick Start Guide**

### **For New Lawyers:**
```
1. Sign up → Sign in
2. Profile menu → "Register as Lawyer"
3. Fill form → Submit
4. Wait for email approval
5. Profile menu → "Lawyer Dashboard"
6. Set availability
7. Start receiving bookings!
```

### **For Admins:**
```
1. Sign in with admin account
2. Profile menu → "Admin Dashboard"
3. Review pending lawyers
4. Approve or reject
5. Done!
```

---

## 📍 **Where to Find Things**

### **In Sidebar:**
- **My Bookings** - Manage your consultations
- **Find a Lawyer** - Browse lawyer directory

### **In Profile Menu (dropdown):**
- **Profile Settings** - Edit your profile
- **Register as Lawyer** - Become a lawyer
- **Lawyer Dashboard** - Manage your practice
- **Admin Dashboard** - Approve lawyers

### **On Lawyers Page:**
- **"Become a Lawyer" button** - Quick registration

---

## ✅ **Success Indicators**

### **Lawyer Registration Successful:**
- ✅ See success confirmation screen
- ✅ Message: "Registration submitted for review"
- ✅ Can return home

### **Admin Approval Successful:**
- ✅ Lawyer disappears from pending list
- ✅ Toast: "Lawyer approved successfully!"
- ✅ Lawyer can now access dashboard

### **Lawyer Dashboard Access:**
- ✅ See statistics (pending, upcoming, completed, earnings)
- ✅ See quick actions (Manage Availability, View Profile, Edit Profile)
- ✅ See tabs (Pending, Upcoming, Completed)

---

## 🎯 **Pro Tips**

1. **For Lawyers:** Set your availability immediately after approval to start receiving bookings

2. **For Admins:** Check pending registrations daily to keep the approval process fast

3. **For Users:** Use the search and filters on `/lawyers` to find the right lawyer quickly

4. **For Everyone:** The profile dropdown menu is your main navigation hub!

---

## 🐛 **Troubleshooting**

### **"You are not registered as a lawyer" error:**
- You haven't registered yet → Go to "Register as Lawyer"
- Your registration is still pending → Wait for admin approval
- Your registration was rejected → Check email for reason

### **"Your lawyer registration is pending approval" error:**
- Admin hasn't reviewed your application yet
- Check back in 2-3 business days
- You'll receive email when approved

### **Can't find admin dashboard:**
- You may not have admin privileges
- Contact system administrator
- Admin status is set in Firebase Console

### **Can't access lawyer dashboard:**
- Make sure you're approved
- Try signing out and back in
- Check if you're using the correct account

---

## 📧 **Need Help?**

Contact support or check the documentation:
- Documentation: `/LAWYER-SYSTEM-FULLY-COMPLETE.md`
- Admin docs: `/LAWYER-BOOKING-COMPLETE.md`

**Everything is now accessible through the UI!** ✅
