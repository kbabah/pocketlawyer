# PocketLawyer

> Your AI Legal Assistant for Cameroonian Law

PocketLawyer is an intelligent legal assistant platform that provides accessible legal information and guidance specifically tailored for Cameroon's unique legal system, which combines elements of English Common Law, French Civil Law, and customary law.

## 🌟 Features

### Core Features
- **AI-Powered Chat Assistant**: Get instant answers to legal questions with our specialized AI trained on Cameroonian law
- **Bilingual Support**: Full support for both English and French languages
- **Document Analysis**: Upload and analyze legal documents with AI-powered insights
- **Web Search Integration**: Browse relevant legal resources and find specific information about Cameroonian law
- **Legal Terminology Tooltips**: Contextual explanations of legal terms throughout the platform

### User Experience
- **Example AI Interactions**: See demonstrations of the AI's capabilities before signing up
- **Progressive Form Completion**: Step-by-step registration process for better user experience
- **Post-Registration Onboarding**: Guided tour of key features for new users
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Comfortable viewing in any lighting condition

### Additional Features
- **User Profiles**: Personalized experience with saved chat history
- **Blog System**: Educational content about Cameroonian law
- **Newsletter**: Stay updated with legal news and information
- **Admin Dashboard**: Content and user management tools
- **Email Campaign Management**: For marketing and user engagement

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation

### Backend & Services
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI/ML**: OpenAI API with AI SDK
- **Email Services**: Multiple providers supported (Mailgun, Nodemailer, Postmark)
- **Document Processing**: PDF parsing and analysis

### Development Tools
- **Build Tool**: Custom build script with Next.js
- **Code Quality**: ESLint
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase account
- OpenAI API key

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kbabah/pocketlawyer.git
   cd pocketlawyer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Email Service Configuration (choose one)
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   # or
   POSTMARK_API_KEY=your_postmark_api_key
   # or configure Nodemailer SMTP settings
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
pocketlawyer/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── admin/           # Admin API endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   ├── document/        # Document processing endpoints
│   │   ├── email/           # Email service endpoints
│   │   ├── feedback/        # User feedback endpoints
│   │   └── search/          # Search functionality
│   ├── admin/               # Admin dashboard pages
│   ├── blog/                # Blog pages
│   ├── documents/           # Document management pages
│   ├── examples/            # Example interactions page
│   ├── profile/             # User profile pages
│   ├── sign-in/             # Authentication pages
│   ├── sign-up/             # Registration pages
│   ├── welcome/             # Welcome/landing page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── ui/                  # Reusable UI components (Radix UI)
│   ├── layout/              # Layout components
│   ├── chat-interface-optimized.tsx
│   ├── document-analysis.tsx
│   ├── example-ai-interactions.tsx
│   ├── language-switcher.tsx
│   ├── legal-terminology.tsx
│   ├── post-registration-onboarding.tsx
│   ├── theme-provider.tsx
│   └── ...
│
├── contexts/                # React Context providers
│   ├── auth-context.tsx     # Authentication context
│   └── language-context.tsx # Language/translation context
│
├── hooks/                   # Custom React hooks
│
├── lib/                     # Utility libraries
│   ├── firebase.ts          # Firebase initialization
│   └── utils.ts             # Utility functions
│
├── styles/                  # CSS files
│   └── chat-interface.css   # Chat-specific styles
│
├── types/                   # TypeScript type definitions
│
├── public/                  # Static assets
│
├── build.js                 # Custom build script
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 🔑 Key Components

### Chat Interface (`components/chat-interface-optimized.tsx`)
The main chat component providing:
- Message history display
- AI response streaming
- Document upload integration
- Web search capabilities
- Message actions (copy, share, etc.)

### Language System (`contexts/language-context.tsx`)
Manages bilingual support:
- Language switching (English/French)
- Translation function (`t()`)
- User preference persistence
- Firestore synchronization

### Legal Terminology (`components/legal-terminology.tsx`)
Provides legal term explanations:
- Hover tooltips with definitions
- Automatic term detection
- Bilingual term database
- Legal dictionary component

### Document Analysis (`components/document-analysis.tsx`)
Handles document processing:
- PDF upload and parsing
- AI-powered analysis
- Document insights
- Text extraction

### Onboarding Flow (`components/post-registration-onboarding.tsx`)
Guides new users:
- Step-by-step tutorial
- Progress tracking
- Skippable steps
- Firestore state persistence

## 🔌 API Endpoints

### Chat & Search
- `POST /api/search` - Web search functionality
- Chat is handled through the AI SDK streaming

### Document Processing
- `POST /api/document/process` - Process uploaded documents
- `POST /api/document/analyze` - Analyze document content

### Authentication
- `GET /api/auth/session` - Get current user session

### Admin
- `/api/admin/setup` - Initial admin setup
- `/api/admin/email/*` - Email campaign management
- `/api/admin/blog/*` - Blog post management

### User Features
- `POST /api/feedback` - Submit user feedback
- `POST /api/newsletter/subscribe` - Newsletter subscription

## 🌍 Internationalization

The application supports two languages:
- **English (en)**: Default language
- **French (fr)**: Full French translation

Translations are managed through the `LanguageContext` provider and the `t()` function. All user-facing text should be wrapped with `t()` for proper translation.

## 🎨 Theming

The application supports both light and dark modes through the `ThemeProvider` component. The theme preference is persisted in localStorage and synced across sessions.

## 🔐 Authentication

Firebase Authentication is used for user management with support for:
- Email/password authentication
- Anonymous users
- User profile management
- Session persistence

## 📊 Database Structure

Firebase Firestore collections:
- `users` - User profiles and preferences
- `chats` - Chat history and messages
- `documents` - Uploaded documents
- `onboarding_progress` - User onboarding state
- `blog_posts` - Blog content
- `email_campaigns` - Email marketing campaigns
- `subscribers` - Newsletter subscribers
- `feedback` - User feedback submissions

## 🧪 Development

### Running the Development Server
```bash
pnpm dev
```

### Building for Production
```bash
pnpm build
# or
pnpm build:next
```

### Linting
```bash
pnpm lint
```

### Starting Production Server
```bash
pnpm start
```

## 📝 Configuration

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore
3. Copy your Firebase config to `.env.local`
4. Deploy Firestore rules from `firestore.rules`
5. Deploy Firestore indexes from `firestore.indexes.json`

### OpenAI Setup
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add it to `.env.local` as `OPENAI_API_KEY`

### Email Service Setup
Choose one of the supported email services and configure the appropriate environment variables.

## 🚢 Deployment

The application is optimized for deployment on platforms like:
- Vercel (recommended for Next.js)
- Firebase Hosting
- Any Node.js hosting platform

### Vercel Deployment
1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📖 Documentation

Additional documentation files:
- `chat-ui-design-doc.md` - Chat UI/UX design specifications
- `pull-request-documentation.md` - Feature implementation details
- `test-plan.md` - Testing guidelines
- `testing-plan.md` - Test strategy

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style
- New features include documentation
- All tests pass before submitting PR
- Bilingual support is maintained for user-facing features

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AI powered by [OpenAI](https://openai.com/)
- Backend powered by [Firebase](https://firebase.google.com/)

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Contact through the application's contact page

---

**PocketLawyer** - Making legal information accessible to everyone in Cameroon 🇨🇲
