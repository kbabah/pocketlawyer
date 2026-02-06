# Dashboard Access Control & Quick Actions Implementation Plan

## Overview
This document outlines the implementation plan for:
1. Unified admin dashboard with lawyer approvals and management
2. Role-based access control for admin and lawyer dashboards
3. Moving Quick Actions from chat interface to sidebar
4. Ensuring AI assistant responses in chat interface

## Current State Analysis

### Admin Dashboard (`/app/admin/page.tsx`)
- ✅ Has admin access verification
- ✅ Shows various admin sections (Users, Email, Content, Analytics, Settings)
- ❌ Lawyer approvals are in a separate page (`/admin/lawyers`)
- ❌ Not fully consolidated as a single dashboard

### Lawyer Dashboard (`/app/lawyer/dashboard/page.tsx`)
- ✅ Has lawyer verification (checks if user is registered as lawyer)
- ✅ Checks if lawyer status is 'approved'
- ✅ Shows bookings management
- ✅ Shows availability management
- ✅ Shows earnings and statistics

### Sidebar (`/components/app-sidebar.tsx`)
- ✅ Has navigation links for various features
- ❌ No Quick Actions section
- ❌ All users can see "Lawyer Dashboard" link (no role check)
- ❌ All users can see "Admin Dashboard" link (no role check)

### Chat Interface (`/components/chat-interface-optimized.tsx`)
- ✅ AI assistant is working and responding
- ❌ No visible "Quick Actions" section (may be planned but not implemented)
- ✅ Has keyboard shortcuts and search functionality

## Implementation Plan

### Phase 1: Consolidate Admin Dashboard

#### 1.1 Update Admin Dashboard to Include Lawyer Management
**File:** `/app/admin/page.tsx`

Add a new tab for "Lawyer Management" that shows:
- Pending lawyer approvals
- Approved lawyers list
- Rejected lawyers list
- Quick actions for approval/rejection

#### 1.2 Keep Separate Lawyer Approval Page
**File:** `/app/admin/lawyers/page.tsx`
- Keep this as a dedicated detailed view
- Add navigation back to main admin dashboard

### Phase 2: Implement Role-Based Access Control

#### 2.1 Create Role Check Hook
**New File:** `/hooks/use-role-check.ts`

```typescript
export function useRoleCheck() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLawyer, setIsLawyer] = useState(false)
  const [isApprovedLawyer, setIsApprovedLawyer] = useState(false)
  
  // Check admin status
  // Check lawyer status
  // Check approval status
  
  return { isAdmin, isLawyer, isApprovedLawyer }
}
```

#### 2.2 Update Sidebar with Role-Based Navigation
**File:** `/components/app-sidebar.tsx`

- Only show "Admin Dashboard" link to admin users
- Only show "Lawyer Dashboard" link to approved lawyers
- Show "Register as Lawyer" to non-lawyers
- Add Quick Actions section for all users

#### 2.3 Add Middleware Protection
**File:** `/middleware.ts`

Add route protection:
- `/admin/*` → Only admins
- `/lawyer/dashboard/*` → Only approved lawyers

### Phase 3: Add Quick Actions to Sidebar

#### 3.1 Create Quick Actions Component
**New File:** `/components/quick-actions.tsx`

Quick Actions to include:
- 📄 **Analyze Document** - Upload and analyze legal documents
- 📝 **Draft Contract** - Generate contract templates
- ⚖️ **Legal Research** - Search legal precedents
- 🔍 **Case Review** - Review case details
- 📋 **Legal Forms** - Access common legal forms
- 👨‍⚖️ **Find Lawyer** - Browse lawyer directory
- 📅 **Book Consultation** - Schedule lawyer appointment

#### 3.2 Integrate Quick Actions into Sidebar
**File:** `/components/app-sidebar.tsx`

Add Quick Actions section between navigation and chat sections:
```tsx
{/* Quick Actions Section */}
<div className={isMobile ? "mb-5" : "mb-4"}>
  <QuickActions />
</div>
```

### Phase 4: Ensure AI Assistant Functionality

#### 4.1 Verify Chat API Endpoint
**File:** `/app/api/chat/route.ts` (need to check this file)

Ensure the endpoint:
- Handles user messages correctly
- Integrates with AI service
- Returns proper responses
- Handles errors gracefully

#### 4.2 Update Chat Interface
**File:** `/components/chat-interface-optimized.tsx`

- Ensure AI responses are displayed correctly
- Add loading states
- Add error handling
- Remove any Quick Actions UI from chat (move to sidebar)

## Implementation Steps

### Step 1: Create Role Check Hook
1. Create `/hooks/use-role-check.ts`
2. Implement admin and lawyer role checks
3. Add loading and error states

### Step 2: Update Admin Dashboard
1. Add "Lawyer Management" tab to `/app/admin/page.tsx`
2. Integrate lawyer approval functionality
3. Show statistics for pending/approved/rejected lawyers

### Step 3: Create Quick Actions Component
1. Create `/components/quick-actions.tsx`
2. Design Quick Actions UI
3. Implement action handlers

### Step 4: Update Sidebar
1. Add role-based navigation visibility
2. Integrate Quick Actions component
3. Update mobile responsiveness

### Step 5: Update Middleware
1. Add route protection for `/admin/*`
2. Add route protection for `/lawyer/dashboard/*`
3. Add proper redirects

### Step 6: Test All Scenarios
1. Test admin access to admin dashboard
2. Test non-admin denial of admin dashboard
3. Test approved lawyer access to lawyer dashboard
4. Test non-lawyer/pending lawyer denial of lawyer dashboard
5. Test Quick Actions functionality
6. Test AI chat responses

## File Structure

```
/Users/babahkingsley/PocketLawyer/
├── app/
│   ├── admin/
│   │   ├── page.tsx (UPDATE - Add lawyer management tab)
│   │   └── lawyers/
│   │       └── page.tsx (KEEP - Detailed lawyer approval)
│   ├── lawyer/
│   │   └── dashboard/
│   │       └── page.tsx (UPDATE - Verify approved lawyer check)
│   └── api/
│       └── chat/
│           └── route.ts (VERIFY - Ensure AI responses work)
├── components/
│   ├── app-sidebar.tsx (UPDATE - Add Quick Actions, role-based nav)
│   ├── quick-actions.tsx (CREATE - New Quick Actions component)
│   └── chat-interface-optimized.tsx (UPDATE - Remove Quick Actions UI)
├── hooks/
│   └── use-role-check.ts (CREATE - New role check hook)
└── middleware.ts (UPDATE - Add route protection)
```

## Priority Order

1. **High Priority**
   - Role-based access control (security)
   - Admin dashboard consolidation
   - Lawyer dashboard access control

2. **Medium Priority**
   - Quick Actions component creation
   - Sidebar integration
   - AI chat verification

3. **Low Priority**
   - UI/UX refinements
   - Mobile optimizations
   - Additional features

## Next Steps

Would you like me to:
1. Start implementing these changes?
2. Create the role check hook first?
3. Update the admin dashboard?
4. Create the Quick Actions component?

Please let me know which part you'd like me to start with!
