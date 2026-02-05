Redesign the PocketLawyer Web Application - Technical Specification

Create a modern, responsive redesign of the PocketLawyer legal assistant web application while preserving core functionality. Implementation must follow these specifications:

TECHNICAL REQUIREMENTS
- Framework: Next.js (latest stable version)
- Database: Firebase/Firestore
- Styling: Tailwind CSS
- Authentication: Firebase Auth
- Languages: English/French
- Performance Target: < 3s initial load, 1s subsequent page loads
- Mobile-First Design: Breakpoints at 640px, 768px, 1024px, 1280px

CORE FEATURES
1. Persistent Chat Interface
- Floating widget accessible across all routes
- Real-time streaming responses
- Typing indicators and loading states
- Chat history preservation
- Multilingual support (EN/FR)

2. Authentication System
- Email/password and Google OAuth options
- Progressive form validation
- Clear error handling
- Password reset flow
- Session management

3. Document Management
- Drag-and-drop upload for PDF/DOCX (max 10MB)
- AI-powered document summarization
- Preview functionality
- Document organization system
- Search capabilities

4. Responsive Layout
- Sidebar navigation (collapsible on mobile)
- Sticky header with language toggle
- Breadcrumb navigation
- Loading states for all async operations

5. Data Management
- Optimized Firestore queries with pagination
- Client-side caching strategy
- Offline support
- Real-time updates for critical data

IMPLEMENTATION PRIORITIES
1. Layout & Navigation Framework
2. Authentication Components
3. Chat Widget Integration
4. Document Upload System
5. Language Switch Implementation
6. Performance Optimization
7. Security Hardening

DELIVERABLES
- Responsive component library
- Updated routing structure
- Comprehensive Tailwind theme
- Migration guide for existing data
- Unit tests for new components

Reference Material:
- Next.js App Router documentation
- Firebase Web v9 SDK guidelines
- Tailwind CSS best practices
- WCAG 2.1 AA compliance requirements