# Sidebar Layout - User Type Comparison

## Overview

This document shows how the OpenClaw sidebar adapts based on user roles and permissions.

---

## 🎯 Sidebar Layouts by User Type

### 1. **Anonymous/Guest User**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  [ 🔐 SIGN IN ]                    │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ Basic navigation (Home, Documents, Find Lawyer)
- ✅ New Chat button
- ✅ Sign In button
- ❌ No authenticated features
- ❌ No bookings
- ❌ No dashboard access

---

### 2. **Regular Authenticated User**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  👤 John Doe                       │
│     john@example.com               │
│                                 >  │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
│  📅 My Bookings                    │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  ⚙️ SETTINGS                        │
│  🚪 SIGN OUT                       │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ User profile section
- ✅ My Bookings access
- ✅ Settings option
- ✅ Sign Out button
- ❌ No lawyer dashboard
- ❌ No admin panel

---

### 3. **Approved Lawyer User**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  👤 Jane Smith, Esq.               │
│     lawyer@firm.com                │
│                                 >  │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
│  📅 My Bookings                    │
│  💼 Lawyer Dashboard          ✓    │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  ⚙️ SETTINGS                        │
│  🚪 SIGN OUT                       │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ All regular user features
- ✅ **Lawyer Dashboard** access
- ✅ Manage bookings
- ✅ Set availability
- ✅ View earnings
- ❌ No admin panel

---

### 4. **Admin User**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  👤 Admin User                     │
│     admin@pocketlawyer.com         │
│                                 >  │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
│  📅 My Bookings                    │
│  ⚙️ Admin Panel               ✓    │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  ⚙️ SETTINGS                        │
│  🚪 SIGN OUT                       │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ All regular user features
- ✅ **Admin Panel** access
- ✅ User management
- ✅ Lawyer approvals
- ✅ System settings
- ❌ No lawyer dashboard (unless also a lawyer)

---

### 5. **Admin User on Admin Page (Expanded Submenu)**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  👤 Admin User                     │
│     admin@pocketlawyer.com         │
│                                 >  │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
│  📅 My Bookings                    │
│  ⚙️ Admin Panel               ✓    │
│    ├─ 📊 Overview                  │
│    ├─ 👥 Users                ✓    │
│    ├─ ⚖️ Lawyers                   │
│    └─ ⚙️ Settings                  │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  ⚙️ SETTINGS                        │
│  🚪 SIGN OUT                       │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ All admin features
- ✅ **Expanded submenu** showing:
  - Overview (dashboard home)
  - Users (user management)
  - Lawyers (lawyer approvals)
  - Settings (system config)
- ✅ Active item highlighted
- ✅ Quick navigation between sections

---

### 6. **Admin + Lawyer User (Super User)**

```
┌────────────────────────────────────┐
│  POCKETLAWYER                      │
│  Legal AI Platform                 │
│  ● SYSTEM ONLINE                   │
├────────────────────────────────────┤
│  👤 Super Admin, Esq.              │
│     super@pocketlawyer.com         │
│                                 >  │
├────────────────────────────────────┤
│  [ + NEW CHAT ]                    │
├────────────────────────────────────┤
│  NAVIGATION                        │
│  🏠 Home                           │
│  📄 Documents                      │
│  ⚖️ Find Lawyer                    │
│  📅 My Bookings                    │
│  💼 Lawyer Dashboard               │
│  ⚙️ Admin Panel               ✓    │
│    ├─ 📊 Overview                  │
│    ├─ 👥 Users                     │
│    ├─ ⚖️ Lawyers                   │
│    └─ ⚙️ Settings                  │
├────────────────────────────────────┤
│  METRICS                           │
│  💬 CHATS: 12                      │
│  📅 BOOKINGS: 3                    │
├────────────────────────────────────┤
│  ⚙️ SETTINGS                        │
│  🚪 SIGN OUT                       │
│  v1.0.0 • 2026                     │
└────────────────────────────────────┘
```

**Features:**
- ✅ ALL features available
- ✅ Lawyer Dashboard access
- ✅ Admin Panel with submenu
- ✅ Full system control

---

## 📊 Feature Comparison Table

| Feature | Guest | User | Lawyer | Admin | Super |
|---------|-------|------|--------|-------|-------|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Find Lawyer | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Bookings | ❌ | ✅ | ✅ | ✅ | ✅ |
| Lawyer Dashboard | ❌ | ❌ | ✅ | ❌ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lawyer Approvals | ❌ | ❌ | ❌ | ✅ | ✅ |
| New Chat | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile Section | ❌ | ✅ | ✅ | ✅ | ✅ |
| Settings | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 Visual States

### **Normal State**
```css
text-slate-400
hover:text-slate-200
hover:bg-slate-800/50
```

### **Active/Selected State**
```css
bg-emerald-500/20
text-emerald-400
border border-emerald-500/30
```

### **Submenu Item**
```css
ml-4
border-l-2 border-slate-700
text-xs
```

### **Active Submenu Item**
```css
bg-emerald-500/10
text-emerald-400
```

---

## 🔐 Access Control Logic

### **Navigation Filtering**
```typescript
const filteredNavigation = navigation.filter(item => {
  // Hide if requires auth and user not logged in
  if (item.requiresAuth && !user) return false
  
  // Hide if admin only and user not admin
  if (item.adminOnly && !isAdmin) return false
  
  // Hide if lawyer only and user not approved lawyer
  if (item.lawyerOnly && !isApprovedLawyer) return false
  
  return true
})
```

### **Submenu Visibility**
```typescript
{isAdmin && pathname.startsWith('/admin') && (
  // Show admin submenu
)}
```

---

## 📱 Responsive Behavior

### **Desktop (> 1024px)**
- Sidebar always visible (256px width)
- Full navigation labels
- All metrics visible
- Expanded submenu when on admin pages

### **Tablet (768px - 1024px)**
- Collapsible sidebar
- Compact metrics
- Truncated labels if needed

### **Mobile (< 768px)**
- Sidebar hidden by default
- Toggle button to open
- Full-screen overlay when open
- Touch-optimized buttons

---

## 🎯 Navigation Flow Examples

### **Guest → Sign In → Regular User**
```
1. Guest sees: Home, Documents, Find Lawyer
2. Clicks "SIGN IN"
3. After sign in, sees: + My Bookings
4. Profile section appears
5. Settings option available
```

### **User → Register as Lawyer → Approved Lawyer**
```
1. User clicks profile
2. Selects "Register as Lawyer"
3. Fills application
4. Waits for approval
5. After approval: Lawyer Dashboard appears
6. Can now manage bookings & availability
```

### **User → Promoted to Admin**
```
1. Regular user sees standard navigation
2. Admin promotes user in user management
3. On next page load/refresh:
4. "Admin Panel" appears in navigation
5. Can access all admin features
6. Submenu expands on admin pages
```

---

## 💡 Best Practices

### **For Regular Users**
- Keep navigation simple and intuitive
- Focus on core features
- Provide clear path to booking lawyers

### **For Lawyers**
- Quick access to dashboard
- Easy booking management
- Clear availability settings

### **For Admins**
- Organize features by category
- Use submenu for related items
- Provide quick stats in sidebar

---

## 🚀 Summary

The OpenClaw sidebar provides:

✅ **Role-Based Navigation** - Shows only relevant features  
✅ **Consistent Design** - Same look across all user types  
✅ **Smart Submenu** - Expands for admin on admin pages  
✅ **Responsive Layout** - Works on all devices  
✅ **Visual Hierarchy** - Clear organization of features  
✅ **Status Indicators** - Active state highlighting  
✅ **Quick Actions** - One-click access to key features  

The sidebar automatically adapts to user permissions, providing a seamless and intuitive navigation experience for all user types!

---

**Last Updated:** February 6, 2026
