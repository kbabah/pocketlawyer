# PocketLawyer Layout Architecture

## Overview
PocketLawyer uses a unified layout system with proper sidebar routing.

## Layouts

### 1. MainLayout (Primary)
- **File**: `components/layout/main-layout.tsx`
- **Sidebar**: `components/app-sidebar.tsx` ✅
- **Used by**: Most application pages
- **Features**:
  - Chat history (authenticated users only)
  - My Bookings link (authenticated users only)
  - Quick Actions
  - Navigation (Home, Documents, Find Lawyer)
  - User profile dropdown
  - Trial info banner (anonymous users)
  - Mobile-optimized with touch targets
  - SidebarProvider wrapper for state management

**Pages using MainLayout:**
- `/` - Home
- `/chat` - Chat interface
- `/documents` - Document management
- `/lawyers` - Lawyer directory
- `/lawyers/[id]` - Lawyer profile
- `/lawyers/register` - Lawyer registration
- `/bookings` - User bookings
- `/sign-in` - Sign in
- `/sign-up` - Sign up

### 2. OpenClawLayout (Admin/Specialized)
- **File**: `components/layout/openclaw-layout.tsx`
- **Sidebar**: `components/openclaw-sidebar.tsx` ✅
- **Used by**: Admin pages, specialized views
- **Features**:
  - Metrics (authenticated users only)
  - User-specific chat/booking counts
  - Terminal-style aesthetic
  - Admin navigation
  - System status indicators

**Pages using OpenClawLayout:**
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/lawyers` - Lawyer management
- `/page-openclaw.tsx` - OpenClaw demo page

## Sidebars

### 1. AppSidebar (Primary)
**File**: `components/app-sidebar.tsx`

**Features:**
- ✅ Navigation (Home, Documents, Find Lawyer)
- ✅ My Bookings (authenticated only)
- ✅ Quick Actions
- ✅ Start New Conversation button
- ✅ Chat History (authenticated only)
  - Grouped by date
  - Rename functionality
  - Delete functionality
  - Active chat highlighting
- ✅ Trial Info Banner (anonymous users)
- ✅ User Profile Dropdown
  - Profile Settings
  - Register as Lawyer
  - Lawyer Dashboard (lawyers only)
  - Admin Dashboard (admins only)
  - Sign Out
- ✅ Feedback Dialog
- ✅ Theme Switcher
- ✅ Mobile Optimizations
  - Touch-friendly (44px+ targets)
  - Swipe gestures
  - Pull-to-refresh
  - Auto-close on navigation

**Authentication Gates:**
- Chat History: `{user && !user.isAnonymous && ...}`
- My Bookings: `{user && !user.isAnonymous && ...}`
- Trial Banner: `{user?.isAnonymous && ...}`

### 2. OpenClawSidebar (Admin/Specialized)
**File**: `components/openclaw-sidebar.tsx`

**Features:**
- ✅ Terminal-style design
- ✅ Metrics Section (authenticated only)
  - Personal chat count
  - Personal booking count
  - Firestore-backed data
  - Loading states
- ✅ Navigation
- ✅ Quick Actions
- ✅ Admin-focused UI

**Authentication Gates:**
- Metrics: `{user && !user.isAnonymous && ...}`

## Layout Assignment Strategy

### Use MainLayout for:
- Public-facing pages
- User-facing features
- Chat interfaces
- Document management
- Lawyer directory
- Booking system
- Authentication pages

### Use OpenClawLayout for:
- Admin dashboards
- System management
- Analytics views
- Terminal-style interfaces
- Developer tools

## Key Differences

| Feature | AppSidebar (MainLayout) | OpenClawSidebar (OpenClawLayout) |
|---------|------------------------|----------------------------------|
| Chat History | ✅ Full list with actions | ❌ Not shown |
| Metrics | ❌ Not shown | ✅ Personal counts |
| My Bookings | ✅ Navigation link | ❌ Not shown |
| Design | Modern, user-friendly | Terminal, technical |
| Target Users | End users | Admins, developers |
| Mobile Optimization | ✅ Extensive | ✅ Basic |

## Recent Fixes (2026-02-07)

### Problem Identified
- MainLayout was importing `openclaw-sidebar` instead of `app-sidebar`
- Changes made to `app-sidebar` (chat history, auth gates, etc.) were not showing on most pages
- Inconsistent user experience across the application

### Solution
1. ✅ Updated MainLayout to import `app-sidebar.tsx`
2. ✅ Added SidebarProvider wrapper for state management
3. ✅ Removed fixed width constraint (AppSidebar manages its own width)
4. ✅ Maintained OpenClawLayout for admin pages with `openclaw-sidebar`

### Impact
- ✅ Chat history now visible on all main pages
- ✅ My Bookings link shows consistently
- ✅ Authentication gates work across entire app
- ✅ Mobile optimizations apply everywhere
- ✅ Unified user experience

## Best Practices

### When creating new pages:

1. **For user-facing pages:**
```tsx
import { MainLayout } from "@/components/layout/main-layout"

export default function MyPage() {
  return (
    <MainLayout>
      {/* Your content */}
    </MainLayout>
  )
}
```

2. **For admin pages:**
```tsx
import { OpenClawLayout } from "@/components/layout/openclaw-layout"

export default function AdminPage() {
  return (
    <OpenClawLayout>
      {/* Your content */}
    </OpenClawLayout>
  )
}
```

3. **For pages without sidebar:**
```tsx
import { MainLayout } from "@/components/layout/main-layout"

export default function FullscreenPage() {
  return (
    <MainLayout showSidebar={false}>
      {/* Your content */}
    </MainLayout>
  )
}
```

## Testing Checklist

After layout changes:
- [ ] Chat history visible on main pages
- [ ] My Bookings appears for authenticated users
- [ ] Trial banner shows for anonymous users
- [ ] Metrics show on admin pages
- [ ] Navigation works across all pages
- [ ] Mobile sidebar opens/closes correctly
- [ ] Theme switcher works everywhere
- [ ] User dropdown functions properly

## Future Improvements

1. **Consider consolidating sidebars:**
   - Single unified sidebar with role-based sections
   - Reduce code duplication
   - Easier maintenance

2. **Add sidebar state persistence:**
   - Remember open/closed state
   - Sync across tabs

3. **Enhance mobile experience:**
   - Bottom navigation bar option
   - Gesture improvements
   - Better tablet support

## Related Files
- `components/layout/main-layout.tsx`
- `components/layout/openclaw-layout.tsx`
- `components/app-sidebar.tsx`
- `components/openclaw-sidebar.tsx`
- `components/ui/sidebar.tsx`
- `hooks/use-chat-history.ts`
- `hooks/use-role-check.ts`
- `contexts/auth-context.tsx`
