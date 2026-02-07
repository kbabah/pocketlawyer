# Chat Interface, Metrics, Booking & Profile Upload Changes

## Implementation Plan

### Overview
This document outlines the specific changes to be made without affecting other functionality:

1. **Separate Chat Interface from Home Page**
2. **Restrict Metrics to Authenticated Users (Personal Data Only)**
3. **Guest User Booking Flow (Sign-up Prompt)**
4. **Profile Picture Upload for All Users**

---

## 1. Separate Chat Interface from Home Page

### Current State:
- Home page (`/app/page.tsx`) shows ChatInterface component when user is authenticated
- Guest users see hero section and example interactions

### Required Changes:

#### A. Create New Chat Page (`/app/chat/page.tsx`)
- Move ChatInterface component to dedicated chat page
- Accessible to both guest and authenticated users
- Include proper breadcrumbs and layout

#### B. Update Home Page (`/app/page.tsx`)
- Remove ChatInterface component from authenticated user view
- Show welcome content/dashboard for authenticated users
- Keep hero section for guest users
- Add call-to-action to start chat

#### C. Update Sidebar (`/components/app-sidebar.tsx`)
- "New Chat" button should navigate to `/chat` instead of `/`
- Chat history items should navigate to `/chat?chatId=X`
- Update `handleNewChat()` function

#### D. Update ChatInterface Component
- Ensure it works standalone on `/chat` page
- Handle chat history loading via URL params

---

## 2. Restrict Metrics to Authenticated Users (Personal Data Only)

### Current State:
- Need to identify where metrics are displayed
- Check if metrics show aggregate or personal data

### Required Changes:

#### A. Identify Metric Components
- Search for chat metrics display
- Search for booking metrics display
- Locate any dashboard metrics

#### B. Add Authentication Check
- Wrap metrics in authentication check
- Only show for non-anonymous users (`!user?.isAnonymous`)

#### C. Ensure Personal Data Only
- Metrics should query user-specific data
- No aggregate or general statistics for non-admin users

#### D. Potential Locations:
- Home page sidebar
- Profile page
- Dashboard components
- Sidebar metrics section

---

## 3. Guest User Booking Flow

### Current State:
- Booking page (`/app/lawyers/[id]/book/page.tsx`) redirects to sign-in if no user
- Shows authentication error toast

### Required Changes:

#### A. Update Booking Page (`/app/lawyers/[id]/book/page.tsx`)
- Instead of immediate redirect, show sign-up prompt dialog
- Display lawyer info and consultation details
- Clear call-to-action to sign up/sign in
- Save booking intent (return URL) for post-auth redirect

#### B. Guest Flow Components:
- Create `BookingSignUpPrompt` component
- Show why authentication is required
- Benefits of creating an account
- Quick sign-up form or redirect to sign-up with return URL

#### C. Preserve Booking Context:
- Save booking parameters in URL or localStorage
- After successful auth, redirect back to booking with params
- Auto-populate form if data was saved

---

## 4. Profile Picture Upload

### Current State:
- `AvatarUpload` component exists (`/components/avatar-upload.tsx`)
- Currently used in profile settings

### Required Changes:

#### A. Add to Sign-Up Form (`/components/auth/auth-form.tsx`)
- Add optional profile picture upload field
- Show avatar preview
- Use `AvatarUpload` component
- Mark as optional (can skip)

#### B. Add to Profile Settings (`/app/profile/page.tsx`)
- Integrate `AvatarUpload` component
- Allow both adding and changing profile picture
- Show current avatar
- Upload button to change

#### C. Guest User Support:
- Allow anonymous users to upload avatar
- Store temporarily or associate with anonymous ID
- Transfer to permanent account on sign-up conversion

#### D. Update Auth Context:
- Include `profileImage` field in user object
- Update profile update function to handle image URL
- Sync with Firestore user document

---

## Files to Modify

### New Files:
1. `/app/chat/page.tsx` - New dedicated chat page

### Modified Files:
1. `/app/page.tsx` - Remove chat interface, update content
2. `/components/app-sidebar.tsx` - Update navigation URLs
3. `/app/lawyers/[id]/book/page.tsx` - Add sign-up prompt instead of redirect
4. `/components/auth/auth-form.tsx` - Add profile picture upload
5. `/app/profile/page.tsx` - Add avatar upload section
6. `/contexts/auth-context.tsx` - Ensure profileImage support

### Components to Check:
1. Any metric display components
2. Chat history components
3. Dashboard components

---

## Implementation Order

1. ✅ Create chat page and move chat interface
2. ✅ Update sidebar navigation (New Chat, chat history)
3. ✅ Update home page content
4. ✅ Add profile picture to sign-up form
5. ✅ Add profile picture to profile settings
6. ✅ Update booking page with sign-up prompt
7. ✅ Find and restrict metrics to authenticated users
8. ✅ Test all flows (guest, authenticated, chat, booking)

---

## Testing Checklist

### Chat Functionality:
- [ ] Guest users can access `/chat` page
- [ ] Authenticated users can access `/chat` page
- [ ] "New Chat" button navigates to `/chat`
- [ ] Chat history items navigate to `/chat?chatId=X`
- [ ] Home page no longer shows chat interface

### Booking Flow:
- [ ] Guest users see sign-up prompt when trying to book
- [ ] Authenticated users can book directly
- [ ] After sign-up, user is redirected back to booking
- [ ] Booking context is preserved

### Profile Picture:
- [ ] Sign-up form has optional avatar upload
- [ ] Profile settings has avatar upload/change
- [ ] Avatar displays correctly in sidebar
- [ ] Avatar persists after page reload

### Metrics:
- [ ] Guest users don't see personal metrics
- [ ] Authenticated users see only their own metrics
- [ ] Metrics show correct personal data

---

## Notes

- Maintain all existing functionality
- Don't break role-based access control
- Keep OpenClaw theme consistency
- Ensure mobile responsiveness
- Handle loading and error states
- Add proper TypeScript types

