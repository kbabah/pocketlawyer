# Lawyer Booking System - Implementation Plan

## Overview
Enable users to book consultations with verified lawyers, and allow lawyers to register and manage their profiles.

## Database Schema (Firestore)

### Collections:

#### 1. `lawyers` Collection
```typescript
interface Lawyer {
  id: string                    // Auto-generated
  userId: string                // Link to auth user
  email: string
  name: string
  phone: string
  barNumber: string             // Bar association number
  specializations: string[]     // e.g., ["Criminal Law", "Family Law"]
  experience: number            // Years of experience
  bio: string
  education: string[]
  languages: string[]           // e.g., ["English", "French"]
  hourlyRate: number           // In XAF (Cameroon Franc)
  availability: {
    monday: { available: boolean, hours: string[] }
    tuesday: { available: boolean, hours: string[] }
    // ... other days
  }
  profileImage: string
  documents: {                  // Verification documents
    barCertificate: string      // URL to document
    idCard: string
    // Other verification docs
  }
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  rating: number               // Average rating (1-5)
  totalReviews: number
  totalConsultations: number
  createdAt: Timestamp
  updatedAt: Timestamp
  rejectionReason?: string     // If rejected
}
```

#### 2. `bookings` Collection
```typescript
interface Booking {
  id: string
  userId: string               // User who booked
  userName: string
  userEmail: string
  lawyerId: string
  lawyerName: string
  date: Timestamp              // Consultation date/time
  duration: number             // In minutes (30, 60, 90)
  type: 'video' | 'phone' | 'in-person'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number          // In XAF
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod?: string
  notes?: string               // User's notes about consultation
  meetingLink?: string         // For video calls
  createdAt: Timestamp
  updatedAt: Timestamp
  cancelledBy?: 'user' | 'lawyer'
  cancellationReason?: string
}
```

#### 3. `reviews` Collection
```typescript
interface Review {
  id: string
  bookingId: string
  userId: string
  userName: string
  lawyerId: string
  rating: number               // 1-5
  comment: string
  createdAt: Timestamp
}
```

## Features to Implement

### 1. Lawyer Registration Flow
- [ ] `/lawyers/register` - Registration form
- [ ] Document upload for verification
- [ ] Email confirmation
- [ ] Pending approval status

### 2. Admin Approval System
- [ ] `/admin/lawyers` - List of pending lawyers
- [ ] View lawyer details & documents
- [ ] Approve/Reject with reason
- [ ] Email notifications

### 3. Lawyer Directory
- [ ] `/lawyers` - Browse verified lawyers
- [ ] Search by specialization, language, rating
- [ ] Filter by availability, price range
- [ ] Lawyer profile pages

### 4. Booking System
- [ ] `/lawyers/[id]/book` - Booking form
- [ ] Calendar availability view
- [ ] Time slot selection
- [ ] Payment integration (placeholder)
- [ ] Booking confirmation

### 5. User Dashboard
- [ ] `/bookings` - User's bookings
- [ ] Upcoming consultations
- [ ] Past consultations
- [ ] Leave reviews

### 6. Lawyer Dashboard
- [ ] `/lawyer/dashboard` - Lawyer's bookings
- [ ] Manage availability
- [ ] View earnings
- [ ] Update profile

## File Structure

```
app/
  lawyers/
    page.tsx                  # Lawyer directory
    register/
      page.tsx               # Lawyer registration
    [id]/
      page.tsx               # Lawyer profile
      book/
        page.tsx             # Booking form
  bookings/
    page.tsx                 # User bookings list
    [id]/
      page.tsx               # Booking details
  lawyer/
    dashboard/
      page.tsx               # Lawyer dashboard
    profile/
      page.tsx               # Edit lawyer profile
  admin/
    lawyers/
      page.tsx               # Admin lawyer management

components/
  lawyers/
    lawyer-card.tsx          # Lawyer card component
    lawyer-registration-form.tsx
    booking-form.tsx
    availability-calendar.tsx
    review-card.tsx
  
lib/
  services/
    lawyer-service.ts        # Lawyer CRUD operations
    booking-service.ts       # Booking operations
```

## Implementation Steps

### Phase 1: Database & Services (30 min)
1. Create Firestore collections
2. Create lawyer service functions
3. Create booking service functions

### Phase 2: Lawyer Registration (45 min)
1. Registration form with validation
2. Document upload
3. Email confirmation
4. Thank you page

### Phase 3: Admin Approval (30 min)
1. Admin lawyers list page
2. Lawyer details view
3. Approve/reject functionality
4. Email notifications

### Phase 4: Lawyer Directory (45 min)
1. Browse lawyers page
2. Search & filters
3. Lawyer profile page
4. Reviews display

### Phase 5: Booking System (60 min)
1. Booking form
2. Availability calendar
3. Time slot selection
4. Booking confirmation
5. Email notifications

### Phase 6: Dashboards (45 min)
1. User bookings dashboard
2. Lawyer dashboard
3. Manage availability

**Total Estimated Time: 4-5 hours**

## UI/UX Considerations

- Mobile-first design
- Clear booking flow
- Trust indicators (verified badge, ratings)
- Professional lawyer profiles
- Easy cancellation process
- Clear pricing display

## Next Steps

Ready to implement? I'll start with:
1. Database services
2. Lawyer registration
3. Admin approval
4. Then booking system

Let me know if you want me to proceed!
