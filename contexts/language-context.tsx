"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define available languages
export type Language = "en" | "fr"

// Define translations interface
interface TranslationStrings {
  [key: string]: string;
}

interface Translations {
  en: TranslationStrings;
  fr: TranslationStrings;
}

// Define the context type
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  t: (key: string) => string
  isChanging: boolean
  error: string | null
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations: Translations = {
  en: {
    // Common
    "app.name": "PocketLawyer",
    "app.tagline": "Your Personal Legal Assistant for Cameroonian Law",
    "app.copyright": "© 2025 PocketLawyer. All rights reserved.",

    // Auth
    "auth.signin": "Log in",
    "auth.signup": "Create Account",
    "auth.signin.title": "Welcome back",
    "auth.signup.title": "Join PocketLawyer",
    "auth.signin.description": "Log in to your account",
    "auth.signup.description": "Create your free account",
    "auth.signin.google": "Continue with Google",
    "auth.signup.google": "Continue with Google",
    "auth.signin.email": "Continue with Email",
    "auth.signup.email": "Continue with Email",
    "auth.or": "or",
    "auth.email": "Your email",
    "auth.password": "Your password",
    "auth.confirm.password": "Confirm password",
    "auth.name": "Your name",
    "auth.forgot.password": "Forgot your password?",
    "auth.no.account": "Don't have an account?",
    "auth.has.account": "Already have an account?",
    "auth.creating": "Creating your account...",
    "auth.signing.in": "Logging you in...",
    "auth.signin.button": "Log in",
    "auth.orContinueWith": "or",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.noAccount": "New to PocketLawyer?",
    "auth.createAccount": "Create an account",

    // Welcome page
    "welcome.hero.title": "Your AI Legal Assistant for Cameroonian Law",
    "welcome.hero.subtitle":
      "Get instant answers to your legal questions, browse relevant resources, and access personalized legal guidance powered by AI.",
    "welcome.get.started": "Get Started",
    "welcome.features.title": "Key Features",
    "welcome.feature.chat.title": "AI Chat Assistant",
    "welcome.feature.chat.description":
      "Get instant answers to your legal questions with our specialized AI trained on Cameroonian law.",
    "welcome.feature.search.title": "Web Search Integration",
    "welcome.feature.search.description":
      "Browse relevant legal resources and find specific information about Cameroonian law.",
    "welcome.feature.personalized.title": "Personalized Experience",
    "welcome.feature.personalized.description":
      "Create an account to save your chat history and get more personalized legal guidance.",
    "welcome.feature.document.title": "Document Analysis",
    "welcome.feature.document.description":
      "Upload legal documents for AI-powered analysis and get insights specific to your documents.",
    "welcome.understand.title": "Understand Cameroonian Law",
    "welcome.understand.description":
      "Cameroon's legal system is unique, combining elements of English Common Law, French Civil Law, and customary law. Our AI assistant helps you navigate this complex legal landscape.",
    "welcome.understand.point1": "Access information on civil, criminal, and commercial law",
    "welcome.understand.point2": "Learn about your rights and legal procedures",
    "welcome.understand.point3": "Get guidance on legal documents and requirements",
    "welcome.justice.title": "Justice Accessible to All",
    "welcome.justice.description": "Our mission is to make legal information accessible to everyone in Cameroon",
    "welcome.ready.title": "Ready to get started?",
    "welcome.ready.description": "Sign up now to access all features and get personalized legal assistance.",
    "welcome.create.account": "Create Your Free Account",
    "welcome.footer.terms": "Terms",
    "welcome.footer.privacy": "Privacy",
    "welcome.footer.contact": "Contact",

    // Chat interface
    "chat.tab.chat": "Chat",
    "chat.tab.web": "Web Search",
    "chat.tab.document": "Document",
    "chat.welcome.title": "Welcome to PocketLawyer",
    "chat.welcome.subtitle": "Ask any legal question about Cameroonian law and get helpful answers.",
    "chat.try.asking": "Try asking:",
    "chat.example1": "What are the requirements for starting a business in Cameroon?",
    "chat.example2": "Explain the divorce process in Cameroon",
    "chat.example3": "What are my rights if I'm arrested in Cameroon?",
    "chat.signin.prompt": "Sign in for unlimited messages and personalized history",
    "chat.message.limit": "Message limit reached. Sign in to continue chatting.",
    "chat.messages.remaining": "{count} messages remaining. Sign in for unlimited access.",
    "chat.input.placeholder": "Ask a legal question...",
    "chat.send": "Send",
    "chat.search.placeholder": "search", // Updated placeholder
    "chat.search": "Search",

    // Chat errors
    "chat.not.found": "Chat not found. Redirecting to new chat...",
    "chat.unauthorized": "You don't have access to this chat. Redirecting to new chat...",
    "chat.error.loading": "Error loading chat. Please try again.",

    // Document analysis
    "document.select": "Select Document",
    "document.signin.prompt": "Sign in for enhanced document analysis and to save your results",
    "document.preview": "Document Preview",
    "document.question.prompt": "Ask a question about this document",
    "document.question.placeholder":
      "E.g., What are the key legal points in this document? Or, Can you summarize this document?",
    "document.analyze": "Analyze Document",
    "document.analyzing": "Analyzing...",

    // Quick Actions
    "Quick Actions": "Quick Actions",
    "Analyze Document": "Analyze Document",
    "Draft Contract": "Draft Contract",
    "Legal Research": "Legal Research",
    "Case Review": "Case Review",
    "Find a Lawyer": "Find a Lawyer",
    "Book Consultation": "Book Consultation",
    "Contract drafting feature coming soon": "Contract drafting feature coming soon",
    "Legal research feature coming soon": "Legal research feature coming soon",
    "Case review feature coming soon": "Case review feature coming soon",

    // Sidebar
    "sidebar.new.chat": "New Chat",
    "sidebar.no.history": "No chat history yet",
    "sidebar.start.conversation": "Start a new conversation to see it here",
    "sidebar.delete.chat": "Delete Chat",
    "sidebar.delete.confirm": "Are you sure you want to delete this chat? This action cannot be undone.",
    "sidebar.cancel": "Cancel",
    "sidebar.delete": "Delete",
    "sidebar.signed.with.google": "Signed in with Google",
    "sidebar.signout": "Sign out",

    // Language
    "language.en": "English",
    "language.fr": "French",
    "language.switch": "Switch to {language}",

    // Profile
    "profile.title": "Profile Settings",
    "profile.description": "Update your profile information and password",
    "profile.tab": "Profile",
    "profile.password.tab": "Password",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.email.google": "Email cannot be changed for Google accounts",
    "profile.update": "Update Profile",
    "profile.updated": "Profile updated successfully",
    "profile.current.password": "Current Password",
    "profile.new.password": "New Password",
    "profile.confirm.password": "Confirm New Password",
    "profile.password.mismatch": "New passwords don't match",
    "profile.password.updated": "Password updated successfully",
    "profile.password.google": "Password management is handled by Google for Google accounts",
    "profile.update.password": "Update Password",

    // Password Reset
    "auth.reset.password.title": "Reset Password",
    "auth.reset.password.description": "Enter your email address and we'll send you a password reset link",
    "auth.reset.password.button": "Send Reset Link",
    "auth.reset.password.success": "Password reset link sent! Check your email",

    // Feedback
    "feedback.button": "Give Feedback",
    "feedback.title": "Help us improve",
    "feedback.rating.required": "Please select a rating",
    "feedback.comment.placeholder": "Share your experience (optional)",
    "feedback.submit": "Submit Feedback",
    "feedback.submitting": "Submitting...",
    "feedback.success": "Thank you for your feedback!",
    "feedback.error": "Failed to submit feedback. Please try again.",

    // Contact page
    "contact.title": "Contact Us",
    "contact.description": "Have questions or feedback? Send us a message below.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "contact.back": "Back to Home",
    "contact.success": "Your message has been sent successfully!",
    "contact.error": "Failed to send message. Please try again later.",

    // Not found page
    "notfound.title": "Page Not Found",
    "notfound.description": "The page you're looking for doesn't exist or has been moved.",
    "notfound.go.home": "Go Home",
    "notfound.find.lawyers": "Find Lawyers",

    // Onboarding loading
    "onboarding.loading": "Loading onboarding...",

    // Profile page (extended)
    "profile.settings.title": "Profile Settings",
    "profile.settings.description": "Update your profile information and password",
    "profile.picture": "Profile Picture",
    "profile.picture.updated": "Profile picture updated successfully!",
    "profile.picture.failed": "Failed to save profile picture",
    "profile.update.button": "Update Profile",
    "profile.update.password.button": "Update Password",
    "profile.go.to.admin": "Go To Admin",

    // Lawyer profile edit page
    "lawyer.edit.back": "Back to Dashboard",
    "lawyer.edit.title": "Edit Profile",
    "lawyer.edit.subtitle": "Update your professional information",
    "lawyer.edit.picture": "Profile Picture",
    "lawyer.edit.picture.desc": "Upload a professional photo (max 2MB)",
    "lawyer.edit.basic": "Basic Information",
    "lawyer.edit.fullname": "Full Name *",
    "lawyer.edit.email": "Email *",
    "lawyer.edit.phone": "Phone Number *",
    "lawyer.edit.bar": "Bar Number",
    "lawyer.edit.bio": "Professional Bio *",
    "lawyer.edit.bio.placeholder": "Tell potential clients about yourself...",
    "lawyer.edit.professional": "Professional Details",
    "lawyer.edit.specialties": "Specialties * (Select all that apply)",
    "lawyer.edit.experience": "Years of Experience *",
    "lawyer.edit.rate": "Hourly Rate (XAF) *",
    "lawyer.edit.education": "Education",
    "lawyer.edit.languages": "Languages",
    "lawyer.edit.add.language": "Add language",
    "lawyer.edit.add": "Add",
    "lawyer.edit.save": "Save Changes",
    "lawyer.edit.saving": "Saving...",
    "lawyer.edit.cancel": "Cancel",
    "lawyer.edit.error.name": "Name is required",
    "lawyer.edit.error.phone": "Phone is required",
    "lawyer.edit.error.bio": "Bio is required",
    "lawyer.edit.error.specialty": "Select at least one specialty",
    "lawyer.edit.error.experience": "Valid experience is required",
    "lawyer.edit.error.rate": "Valid hourly rate is required",
    "lawyer.edit.success": "Profile updated successfully!",
    "lawyer.edit.load.error": "Failed to load profile",
    "lawyer.edit.save.error": "Failed to update profile",
    "lawyer.edit.not.found": "Lawyer profile not found",

    // Lawyer dashboard
    "lawyer.dashboard.pending": "PENDING",
    "lawyer.dashboard.upcoming": "UPCOMING",
    "lawyer.dashboard.history": "HISTORY",
    "lawyer.dashboard.config": "CONFIG",
    "lawyer.dashboard.no.pending": "No pending bookings",
    "lawyer.dashboard.no.upcoming": "No upcoming bookings",
    "lawyer.dashboard.no.completed": "No completed bookings yet",
    "lawyer.dashboard.availability": "AVAILABILITY CONFIG",
    "lawyer.dashboard.availability.desc": "Configure your weekly schedule",
    "lawyer.dashboard.profile.settings": "PROFILE SETTINGS",
    "lawyer.dashboard.profile.desc": "Manage your professional profile",
    "lawyer.dashboard.account": "ACCOUNT",
    "lawyer.dashboard.edit.profile": "EDIT PROFILE",
    "lawyer.dashboard.client.view": "CLIENT VIEW",
    "lawyer.dashboard.sign.out": "SIGN OUT",
    "lawyer.dashboard.edit": "EDIT",
    "lawyer.dashboard.offline": "OFFLINE",
    "lawyer.dashboard.slots": "{count} slots",
    "lawyer.dashboard.confirm.title": "CONFIRM BOOKING",
    "lawyer.dashboard.confirm.desc": "Approve this consultation request",
    "lawyer.dashboard.confirm.meeting": "Meeting Link",
    "lawyer.dashboard.confirm.btn": "CONFIRM",
    "lawyer.dashboard.cancel.title": "CANCEL BOOKING",
    "lawyer.dashboard.cancel.desc": "This action cannot be undone",
    "lawyer.dashboard.abort": "ABORT",
    "lawyer.dashboard.cancel.btn": "CANCEL BOOKING",
    "lawyer.dashboard.avail.title": "EDIT AVAILABILITY",
    "lawyer.dashboard.avail.desc": "Configure your weekly schedule",
    "lawyer.dashboard.save": "SAVE",
    "lawyer.dashboard.cancel": "CANCEL",
    "lawyer.dashboard.confirm.booking": "CONFIRM",
    "lawyer.dashboard.decline": "DECLINE",
    "lawyer.dashboard.complete": "COMPLETE",
    "lawyer.dashboard.initializing": "Initializing dashboard...",
    "lawyer.dashboard.label.pending": "PENDING",
    "lawyer.dashboard.label.upcoming": "UPCOMING",
    "lawyer.dashboard.label.completed": "COMPLETED",
    "lawyer.dashboard.label.earnings": "EARNINGS",
    "lawyer.dashboard.label.rating": "RATING",
    "lawyer.dashboard.label.reviews": "REVIEWS",
    "lawyer.dashboard.label.rate": "HOURLY RATE",
    "lawyer.dashboard.label.status": "STATUS",
    "lawyer.dashboard.label.specialties": "SPECIALTIES",
    "lawyer.dashboard.label.experience": "EXPERIENCE",
    "lawyer.dashboard.years": "{n} years",
    "lawyer.dashboard.exit": "EXIT",

    // Footer disclaimer
    "footer.disclaimer": "PocketLawyer provides general legal information based on Cameroonian law. It does not offer personalized legal advice, cannot represent you in court, and should not replace consultation with a qualified attorney.",
    "footer.capabilities": "What PocketLawyer can and cannot do",
    "footer.can": "PocketLawyer CAN:",
    "footer.cannot": "PocketLawyer CANNOT:",
    "footer.can.1": "Provide general information about Cameroonian law",
    "footer.can.2": "Explain legal concepts and terminology",
    "footer.can.3": "Point to relevant statutes and legal resources",
    "footer.can.4": "Help understand legal procedures and requirements",
    "footer.can.5": "Generate basic document templates",
    "footer.cannot.1": "Provide personalized legal advice for specific situations",
    "footer.cannot.2": "Represent users in court or legal proceedings",
    "footer.cannot.3": "File documents on behalf of users",
    "footer.cannot.4": "Guarantee outcomes in legal matters",
    "footer.cannot.5": "Replace professional legal counsel",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",

    // Common shared strings
    "Home": "Home",
    "Back": "Back",
    "Cancel": "Cancel",
    "Copy": "Copy",
    "Copied": "Copied",
    "Download": "Download",
    "Save": "Save",
    "optional": "optional",
    "Blog": "Blog",
    "Examples": "Examples",
    "Return to Chat": "Return to Chat",
    "Copied to clipboard": "Copied to clipboard",
    "Documents": "Documents",
    "Chat": "Chat",

    // Blog page
    "Legal Resources & Guides": "Legal Resources & Guides",
    "Articles, guides and resources on Cameroonian law to help you understand your rights and obligations.": "Articles, guides and resources on Cameroonian law to help you understand your rights and obligations.",
    "Search articles...": "Search articles...",
    "View Examples": "View Examples",
    "Loading articles...": "Loading articles...",
    "Failed to load blog posts. Please try again later.": "Failed to load blog posts. Please try again later.",
    "Try Again": "Try Again",
    "Categories": "Categories",
    "All Categories": "All Categories",
    "Popular Tags": "Popular Tags",
    "Have a Legal Question?": "Have a Legal Question?",
    "Use our AI assistant to get instant answers to your Cameroonian legal questions.": "Use our AI assistant to get instant answers to your Cameroonian legal questions.",
    "Chat with PocketLawyer": "Chat with PocketLawyer",
    "No articles found": "No articles found",
    "Try adjusting your search or category filters": "Try adjusting your search or category filters",
    "Reset Filters": "Reset Filters",
    "Subscribe to Our Legal Updates": "Subscribe to Our Legal Updates",
    "Get the latest articles and resources on Cameroonian law delivered to your inbox": "Get the latest articles and resources on Cameroonian law delivered to your inbox",
    "Enter your email": "Enter your email",
    "Subscribing...": "Subscribing...",
    "Subscribe": "Subscribe",
    "Please enter your email address": "Please enter your email address",
    "Failed to process subscription. Please try again.": "Failed to process subscription. Please try again.",

    // Draft Contract page
    "Generate professional legal contracts compliant with Cameroonian law and OHADA": "Generate professional legal contracts compliant with Cameroonian law and OHADA",
    "AI-powered contract generation for Cameroon": "AI-powered contract generation for Cameroon",
    "Select Contract Type": "Select Contract Type",
    "Employment Contract": "Employment Contract",
    "CDI/CDD under Cameroon Labour Code": "CDI/CDD under Cameroon Labour Code",
    "Lease Agreement": "Lease Agreement",
    "Residential or commercial rental": "Residential or commercial rental",
    "Sale of Goods": "Sale of Goods",
    "Commercial sale under OHADA": "Commercial sale under OHADA",
    "Service Agreement": "Service Agreement",
    "Consulting or professional services": "Consulting or professional services",
    "Non-Disclosure Agreement": "Non-Disclosure Agreement",
    "Confidentiality agreement": "Confidentiality agreement",
    "Partnership Agreement": "Partnership Agreement",
    "Business partnership terms": "Business partnership terms",
    "Loan Agreement": "Loan Agreement",
    "Personal or business loan": "Personal or business loan",
    "Power of Attorney": "Power of Attorney",
    "Procuration / legal representation": "Procuration / legal representation",
    "Custom Contract": "Custom Contract",
    "Describe your specific needs": "Describe your specific needs",
    "Additional Requirements": "Additional Requirements",
    "Describe any specific requirements: parties involved, key terms, special clauses, language preference (English/French)...": "Describe any specific requirements: parties involved, key terms, special clauses, language preference (English/French)...",
    "Generate Contract": "Generate Contract",
    "New Contract": "New Contract",
    "Drafting contract...": "Drafting contract...",
    "Request modifications to the contract...": "Request modifications to the contract...",
    "Contracts generated using Cameroonian law templates and OHADA provisions": "Contracts generated using Cameroonian law templates and OHADA provisions",
    "Contract downloaded": "Contract downloaded",
    "Please select a contract type": "Please select a contract type",

    // Bookings page
    "My Bookings": "My Bookings",
    "Manage your legal consultations": "Manage your legal consultations",
    "Upcoming Consultations": "Upcoming Consultations",
    "Past Consultations": "Past Consultations",
    "Total Bookings": "Total Bookings",
    "Upcoming": "Upcoming",
    "Past": "Past",
    "No upcoming consultations": "No upcoming consultations",
    "Browse Lawyers": "Browse Lawyers",
    "No past consultations": "No past consultations",
    "Cancel Booking": "Cancel Booking",
    "Please provide a reason for cancelling this consultation": "Please provide a reason for cancelling this consultation",
    "Cancellation Reason": "Cancellation Reason",
    "e.g., Schedule conflict, found another lawyer...": "e.g., Schedule conflict, found another lawyer...",
    "Keep Booking": "Keep Booking",
    "Cancelling...": "Cancelling...",
    "Leave a Review": "Leave a Review",
    "Share your experience with": "Share your experience with",
    "Rating": "Rating",
    "Your Review": "Your Review",
    "Share your thoughts about the consultation...": "Share your thoughts about the consultation...",
    "Submitting...": "Submitting...",
    "Submit Review": "Submit Review",
    "minutes": "minutes",
    "Notes": "Notes",
    "Join Video Call": "Join Video Call",
    "Cancelled by": "Cancelled by",
    "Total": "Total",
    "Payment": "Payment",
    "Leave Review": "Leave Review",
    "Review submitted": "Review submitted",
    "Failed to load bookings": "Failed to load bookings",
    "Please sign in to cancel bookings": "Please sign in to cancel bookings",
    "Please provide a cancellation reason": "Please provide a cancellation reason",
    "Booking cancelled successfully": "Booking cancelled successfully",
    "Failed to cancel booking": "Failed to cancel booking",
    "Please sign in to submit reviews": "Please sign in to submit reviews",
    "Please write a review comment": "Please write a review comment",
    "Review submitted successfully!": "Review submitted successfully!",
    "Failed to submit review": "Failed to submit review",
    "Pending": "Pending",
    "Confirmed": "Confirmed",
    "Completed": "Completed",
    "Cancelled": "Cancelled",

    // Case Review page
    "Get an AI-powered analysis of your legal case under Cameroonian law": "Get an AI-powered analysis of your legal case under Cameroonian law",
    "AI analysis of legal cases under Cameroonian law": "AI analysis of legal cases under Cameroonian law",
    "Disclaimer": "Disclaimer",
    "This tool provides an AI-generated analysis for informational purposes only. It is not legal advice. Please consult a qualified Cameroonian lawyer for professional legal counsel.": "This tool provides an AI-generated analysis for informational purposes only. It is not legal advice. Please consult a qualified Cameroonian lawyer for professional legal counsel.",
    "Case Type": "Case Type",
    "Select case type...": "Select case type...",
    "Civil Dispute": "Civil Dispute",
    "Criminal Matter": "Criminal Matter",
    "Commercial / Business": "Commercial / Business",
    "Labour / Employment": "Labour / Employment",
    "Land / Property": "Land / Property",
    "Family Law": "Family Law",
    "Administrative": "Administrative",
    "Other": "Other",
    "Describe Your Case": "Describe Your Case",
    "Describe the facts of your case in detail. Include: what happened, when, who was involved, any documents or agreements, and what outcome you are seeking...": "Describe the facts of your case in detail. Include: what happened, when, who was involved, any documents or agreements, and what outcome you are seeking...",
    "Example Cases": "Example Cases",
    "Wrongful Dismissal": "Wrongful Dismissal",
    "Employee fired without notice after 5 years of service": "Employee fired without notice after 5 years of service",
    "Land Dispute": "Land Dispute",
    "Neighbour building on my registered land": "Neighbour building on my registered land",
    "Unpaid Invoice": "Unpaid Invoice",
    "Client refuses to pay for delivered goods": "Client refuses to pay for delivered goods",
    "Use this example": "Use this example",
    "Start Case Review": "Start Case Review",
    "New Case Review": "New Case Review",
    "Analysing case...": "Analysing case...",
    "Ask a follow-up question about your case...": "Ask a follow-up question about your case...",
    "Analysis enhanced with built-in Cameroonian law knowledge base": "Analysis enhanced with built-in Cameroonian law knowledge base",
    "Please describe your case details": "Please describe your case details",

    // Legal Research page
    "Research Cameroonian law with AI-powered assistance and built-in legal knowledge base": "Research Cameroonian law with AI-powered assistance and built-in legal knowledge base",
    "Powered by Cameroonian law knowledge base + AI": "Powered by Cameroonian law knowledge base + AI",
    "Popular Research Topics": "Popular Research Topics",
    "Land & Property Law": "Land & Property Law",
    "Business Formation": "Business Formation",
    "Labour & Employment": "Labour & Employment",
    "Criminal Law": "Criminal Law",
    "Tax Law": "Tax Law",
    "Researching...": "Researching...",
    "Describe the legal topic you want to research...": "Describe the legal topic you want to research...",
    "Responses enhanced with built-in Cameroonian law knowledge base (available offline)": "Responses enhanced with built-in Cameroonian law knowledge base (available offline)",

    // Documents page
    "Document Analysis Center": "Document Analysis Center",
    "Upload, analyze, and extract insights from your legal documents": "Upload, analyze, and extract insights from your legal documents",
    "Processed Documents": "Processed Documents",
    "Click on a document to analyze it": "Click on a document to analyze it",
    "Select a Document": "Select a Document",
    "characters": "characters",
    "Document Preview": "Document Preview",
    "Quick Analysis": "Quick Analysis",
    "Summarize the key points of this document": "Summarize the key points of this document",
    "Who are the parties involved and what are their obligations?": "Who are the parties involved and what are their obligations?",
    "What are the important dates and deadlines?": "What are the important dates and deadlines?",
    "Identify any potential legal risks or problematic clauses": "Identify any potential legal risks or problematic clauses",
    "What legal rights are established in this document?": "What legal rights are established in this document?",
    "Is this document enforceable under Cameroonian law?": "Is this document enforceable under Cameroonian law?",
    "Custom Question": "Custom Question",
    "Ask a specific question about this document...": "Ask a specific question about this document...",
    "Tip": "Tip",
    "to submit": "to submit",
    "Analyzing…": "Analyzing…",
    "Analyze": "Analyze",
    "Analyzing your document with AI…": "Analyzing your document with AI…",
    "Analysis History": "Analysis History",
    "Document was truncated. Analysis based on first portion only.": "Document was truncated. Analysis based on first portion only.",
    "Question": "Question",
    "Answer": "Answer",
    "No document selected": "No document selected",
    "Upload a document above or select one from the list to start analyzing": "Upload a document above or select one from the list to start analyzing",
    "Quick Tips": "Quick Tips",
    "Supported Formats": "Supported Formats",
    "PDF, DOCX, and TXT files up to 10MB each": "PDF, DOCX, and TXT files up to 10MB each",
    "OCR Support": "OCR Support",
    "Scanned PDFs automatically fall back to Tesseract OCR": "Scanned PDFs automatically fall back to Tesseract OCR",
    "AI Analysis": "AI Analysis",
    "Ask specific questions about your documents for detailed insights": "Ask specific questions about your documents for detailed insights",
    "Secure Processing": "Secure Processing",
    "All documents are processed securely and confidentially": "All documents are processed securely and confidentially",
    "Please select a document and enter a question": "Please select a document and enter a question",
    "Analysis failed": "Analysis failed",
  },
  fr: {
    // Common
    "app.name": "PocketLawyer",
    "app.tagline": "Votre Assistant Juridique Personnel pour le Droit Camerounais",
    "app.copyright": "© 2025 PocketLawyer. Tous droits réservés.",

    // Auth
    "auth.signin": "Connexion",
    "auth.signup": "Créer un compte",
    "auth.signin.title": "Bon retour parmi nous",
    "auth.signup.title": "Rejoignez PocketLawyer",
    "auth.signin.description": "Connectez-vous à votre compte",
    "auth.signup.description": "Créez votre compte gratuit",
    "auth.signin.google": "Continuer avec Google",
    "auth.signup.google": "Continuer avec Google",
    "auth.signin.email": "Continuer avec Email",
    "auth.signup.email": "Continuer avec Email",
    "auth.or": "ou",
    "auth.email": "Votre email",
    "auth.password": "Votre mot de passe",
    "auth.confirm.password": "Confirmez votre mot de passe",
    "auth.name": "Votre nom",
    "auth.forgot.password": "Mot de passe oublié ?",
    "auth.no.account": "Pas encore de compte ?",
    "auth.has.account": "Déjà un compte ?",
    "auth.creating": "Création de votre compte...",
    "auth.signing.in": "Connexion en cours...",
    "auth.signin.button": "Se connecter",
    "auth.orContinueWith": "ou",
    "auth.continueWithGoogle": "Continuer avec Google",
    "auth.noAccount": "Nouveau sur PocketLawyer ?",
    "auth.createAccount": "Créer un compte",

    // Welcome page
    "welcome.hero.title": "Votre assistant juridique IA pour le droit camerounais",
    "welcome.hero.subtitle":
      "Obtenez des réponses instantanées à vos questions juridiques, parcourez des ressources pertinentes et accédez à des conseils juridiques personnalisés grâce à l'IA.",
    "welcome.get.started": "Commencer",
    "welcome.features.title": "Fonctionnalités clés",
    "welcome.feature.chat.title": "Assistant de chat IA",
    "welcome.feature.chat.description":
      "Obtenez des réponses instantanées à vos questions juridiques avec notre IA spécialisée dans le droit camerounais.",
    "welcome.feature.search.title": "Intégration de recherche web",
    "welcome.feature.search.description":
      "Parcourez des ressources juridiques pertinentes et trouvez des informations spécifiques sur le droit camerounais.",
    "welcome.feature.personalized.title": "Expérience personnalisée",
    "welcome.feature.personalized.description":
      "Créez un compte pour sauvegarder votre historique de chat et obtenir des conseils juridiques plus personnalisés.",
    "welcome.feature.document.title": "Analyse de documents",
    "welcome.feature.document.description":
      "Téléchargez des documents juridiques pour une analyse alimentée par l'IA et obtenez des informations spécifiques à vos documents.",
    "welcome.understand.title": "Comprendre le droit camerounais",
    "welcome.understand.description":
      "Le système juridique camerounais est unique, combinant des éléments du droit commun anglais, du droit civil français et du droit coutumier. Notre assistant IA vous aide à naviguer dans ce paysage juridique complexe.",
    "welcome.understand.point1": "Accédez à des informations sur le droit civil, pénal et commercial",
    "welcome.understand.point2": "Renseignez-vous sur vos droits et les procédures juridiques",
    "welcome.understand.point3": "Obtenez des conseils sur les documents juridiques et les exigences",
    "welcome.justice.title": "Justice accessible à tous",
    "welcome.justice.description": "Notre mission est de rendre l'information juridique accessible à tous au Cameroun",
    "welcome.ready.title": "Prêt à commencer?",
    "welcome.ready.description":
      "Inscrivez-vous maintenant pour accéder à toutes les fonctionnalités et obtenir une assistance juridique personnalisée.",
    "welcome.create.account": "Créez votre compte gratuit",
    "welcome.footer.terms": "Conditions",
    "welcome.footer.privacy": "Confidentialité",
    "welcome.footer.contact": "Contact",

    // Chat interface
    "chat.tab.chat": "Chat",
    "chat.tab.web": "Recherche Web",
    "chat.tab.document": "Document",
    "chat.welcome.title": "Bienvenue sur PocketLawyer",
    "chat.welcome.subtitle":
      "Posez n'importe quelle question juridique sur le droit camerounais et obtenez des réponses utiles.",
    "chat.try.asking": "Essayez de demander:",
    "chat.example1": "Quelles sont les exigences pour créer une entreprise au Cameroun?",
    "chat.example2": "Expliquez le processus de divorce au Cameroun",
    "chat.example3": "Quels sont mes droits si je suis arrêté au Cameroun?",
    "chat.signin.prompt": "Connectez-vous pour des messages illimités et un historique personnalisé",
    "chat.message.limit": "Limite de messages atteinte. Connectez-vous pour continuer à discuter.",
    "chat.messages.remaining": "{count} messages restants. Connectez-vous pour un accès illimité.",
    "chat.input.placeholder": "Posez une question juridique...",
    "chat.send": "Envoyer",
    "chat.search.placeholder": "search", // Updated placeholder
    "chat.search": "Rechercher",

    // Chat errors
    "chat.not.found": "Chat introuvable. Redirection vers un nouveau chat...",
    "chat.unauthorized": "Vous n'avez pas accès à ce chat. Redirection vers un nouveau chat...",
    "chat.error.loading": "Erreur lors du chargement du chat. Veuillez réessayer.",

    // Document analysis
    "document.select": "Sélectionner un document",
    "document.signin.prompt": "Connectez-vous pour une analyse de document améliorée et pour sauvegarder vos résultats",
    "document.preview": "Aperçu du document",
    "document.question.prompt": "Posez une question sur ce document",
    "document.question.placeholder":
      "Par exemple, quels sont les points juridiques clés de ce document? Ou, pouvez-vous résumer ce document?",
    "document.analyze": "Analyser le document",
    "document.analyzing": "Analyse en cours...",

    // Sidebar
    "sidebar.new.chat": "Nouvelle conversation",
    "sidebar.no.history": "Pas encore d'historique de chat",
    "sidebar.start.conversation": "Commencez une nouvelle conversation pour la voir ici",
    "sidebar.delete.chat": "Supprimer la conversation",
    "sidebar.delete.confirm":
      "Êtes-vous sûr de vouloir supprimer cette conversation? Cette action ne peut pas être annulée.",
    "sidebar.cancel": "Annuler",
    "sidebar.delete": "Supprimer",
    "sidebar.signed.with.google": "Connecté avec Google",
    "sidebar.signout": "Se déconnecter",

    // Quick Actions
    "Quick Actions": "Actions Rapides",
    "Analyze Document": "Analyser un Document",
    "Draft Contract": "Rédiger un Contrat",
    "Legal Research": "Recherche Juridique",
    "Case Review": "Examen de Cas",
    "Find a Lawyer": "Trouver un Avocat",
    "Book Consultation": "Réserver une Consultation",
    "Contract drafting feature coming soon": "Fonctionnalité de rédaction de contrat bientôt disponible",
    "Legal research feature coming soon": "Fonctionnalité de recherche juridique bientôt disponible",
    "Case review feature coming soon": "Fonctionnalité d'examen de cas bientôt disponible",

    // Language
    "language.en": "Anglais",
    "language.fr": "Français",
    "language.switch": "Passer à {language}",

    // Profile
    "profile.title": "Paramètres du profil",
    "profile.description": "Mettez à jour vos informations de profil et votre mot de passe",
    "profile.tab": "Profil",
    "profile.password.tab": "Mot de passe",
    "profile.name": "Nom",
    "profile.email": "Email",
    "profile.email.google": "L'email ne peut pas être modifié pour les comptes Google",
    "profile.update": "Mettre à jour le profil",
    "profile.updated": "Profil mis à jour avec succès",
    "profile.current.password": "Mot de passe actuel",
    "profile.new.password": "Nouveau mot de passe",
    "profile.confirm.password": "Confirmer le nouveau mot de passe",
    "profile.password.mismatch": "Les nouveaux mots de passe ne correspondent pas",
    "profile.password.updated": "Mot de passe mis à jour avec succès",
    "profile.password.google": "La gestion des mots de passe est gérée par Google pour les comptes Google",
    "profile.update.password": "Mettre à jour le mot de passe",

    // Password Reset
    "auth.reset.password.title": "Réinitialiser le mot de passe",
    "auth.reset.password.description": "Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation",
    "auth.reset.password.button": "Envoyer le lien",
    "auth.reset.password.success": "Lien de réinitialisation envoyé ! Vérifiez vos emails",

    // Feedback
    "feedback.button": "Donner un avis",
    "feedback.title": "Aidez-nous à nous améliorer",
    "feedback.rating.required": "Veuillez sélectionner une note",
    "feedback.comment.placeholder": "Partagez votre expérience (facultatif)",
    "feedback.submit": "Soumettre",
    "feedback.submitting": "Envoi en cours...",
    "feedback.success": "Merci pour votre avis !",
    "feedback.error": "Échec de l'envoi. Veuillez réessayer.",

    // Contact page
    "contact.title": "Contactez-nous",
    "contact.description": "Des questions ou des commentaires ? Envoyez-nous un message.",
    "contact.name": "Nom",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Envoyer le message",
    "contact.sending": "Envoi...",
    "contact.back": "Retour à l'accueil",
    "contact.success": "Votre message a été envoyé avec succès !",
    "contact.error": "Échec de l'envoi. Veuillez réessayer plus tard.",

    // Not found page
    "notfound.title": "Page introuvable",
    "notfound.description": "La page que vous recherchez n'existe pas ou a été déplacée.",
    "notfound.go.home": "Accueil",
    "notfound.find.lawyers": "Trouver des avocats",

    // Onboarding loading
    "onboarding.loading": "Chargement de l'intégration...",

    // Profile page (extended)
    "profile.settings.title": "Paramètres du profil",
    "profile.settings.description": "Mettez à jour vos informations de profil et votre mot de passe",
    "profile.picture": "Photo de profil",
    "profile.picture.updated": "Photo de profil mise à jour avec succès !",
    "profile.picture.failed": "Échec de l'enregistrement de la photo de profil",
    "profile.update.button": "Mettre à jour le profil",
    "profile.update.password.button": "Mettre à jour le mot de passe",
    "profile.go.to.admin": "Accéder à l'administration",

    // Lawyer profile edit page
    "lawyer.edit.back": "Retour au tableau de bord",
    "lawyer.edit.title": "Modifier le profil",
    "lawyer.edit.subtitle": "Mettez à jour vos informations professionnelles",
    "lawyer.edit.picture": "Photo de profil",
    "lawyer.edit.picture.desc": "Téléchargez une photo professionnelle (max 2 Mo)",
    "lawyer.edit.basic": "Informations de base",
    "lawyer.edit.fullname": "Nom complet *",
    "lawyer.edit.email": "Email *",
    "lawyer.edit.phone": "Numéro de téléphone *",
    "lawyer.edit.bar": "Numéro de barreau",
    "lawyer.edit.bio": "Biographie professionnelle *",
    "lawyer.edit.bio.placeholder": "Parlez de vous aux clients potentiels...",
    "lawyer.edit.professional": "Détails professionnels",
    "lawyer.edit.specialties": "Spécialités * (Sélectionnez tout ce qui s'applique)",
    "lawyer.edit.experience": "Années d'expérience *",
    "lawyer.edit.rate": "Tarif horaire (XAF) *",
    "lawyer.edit.education": "Formation",
    "lawyer.edit.languages": "Langues",
    "lawyer.edit.add.language": "Ajouter une langue",
    "lawyer.edit.add": "Ajouter",
    "lawyer.edit.save": "Enregistrer les modifications",
    "lawyer.edit.saving": "Enregistrement...",
    "lawyer.edit.cancel": "Annuler",
    "lawyer.edit.error.name": "Le nom est requis",
    "lawyer.edit.error.phone": "Le téléphone est requis",
    "lawyer.edit.error.bio": "La biographie est requise",
    "lawyer.edit.error.specialty": "Sélectionnez au moins une spécialité",
    "lawyer.edit.error.experience": "Une expérience valide est requise",
    "lawyer.edit.error.rate": "Un tarif valide est requis",
    "lawyer.edit.success": "Profil mis à jour avec succès !",
    "lawyer.edit.load.error": "Échec du chargement du profil",
    "lawyer.edit.save.error": "Échec de la mise à jour du profil",
    "lawyer.edit.not.found": "Profil d'avocat introuvable",

    // Lawyer dashboard
    "lawyer.dashboard.pending": "EN ATTENTE",
    "lawyer.dashboard.upcoming": "À VENIR",
    "lawyer.dashboard.history": "HISTORIQUE",
    "lawyer.dashboard.config": "CONFIG",
    "lawyer.dashboard.no.pending": "Aucune réservation en attente",
    "lawyer.dashboard.no.upcoming": "Aucune réservation à venir",
    "lawyer.dashboard.no.completed": "Aucune réservation terminée",
    "lawyer.dashboard.availability": "CONFIG DISPONIBILITÉ",
    "lawyer.dashboard.availability.desc": "Configurez votre planning hebdomadaire",
    "lawyer.dashboard.profile.settings": "PARAMÈTRES DU PROFIL",
    "lawyer.dashboard.profile.desc": "Gérez votre profil professionnel",
    "lawyer.dashboard.account": "COMPTE",
    "lawyer.dashboard.edit.profile": "MODIFIER LE PROFIL",
    "lawyer.dashboard.client.view": "VUE CLIENT",
    "lawyer.dashboard.sign.out": "SE DÉCONNECTER",
    "lawyer.dashboard.edit": "MODIFIER",
    "lawyer.dashboard.offline": "HORS LIGNE",
    "lawyer.dashboard.slots": "{count} créneaux",
    "lawyer.dashboard.confirm.title": "CONFIRMER LA RÉSERVATION",
    "lawyer.dashboard.confirm.desc": "Approuver cette demande de consultation",
    "lawyer.dashboard.confirm.meeting": "Lien de réunion",
    "lawyer.dashboard.confirm.btn": "CONFIRMER",
    "lawyer.dashboard.cancel.title": "ANNULER LA RÉSERVATION",
    "lawyer.dashboard.cancel.desc": "Cette action est irréversible",
    "lawyer.dashboard.abort": "ABANDONNER",
    "lawyer.dashboard.cancel.btn": "ANNULER LA RÉSERVATION",
    "lawyer.dashboard.avail.title": "MODIFIER LA DISPONIBILITÉ",
    "lawyer.dashboard.avail.desc": "Configurez votre planning hebdomadaire",
    "lawyer.dashboard.save": "ENREGISTRER",
    "lawyer.dashboard.cancel": "ANNULER",
    "lawyer.dashboard.confirm.booking": "CONFIRMER",
    "lawyer.dashboard.decline": "REFUSER",
    "lawyer.dashboard.complete": "TERMINER",
    "lawyer.dashboard.initializing": "Initialisation du tableau de bord...",
    "lawyer.dashboard.label.pending": "EN ATTENTE",
    "lawyer.dashboard.label.upcoming": "À VENIR",
    "lawyer.dashboard.label.completed": "TERMINÉ",
    "lawyer.dashboard.label.earnings": "REVENUS",
    "lawyer.dashboard.label.rating": "NOTE",
    "lawyer.dashboard.label.reviews": "AVIS",
    "lawyer.dashboard.label.rate": "TARIF HORAIRE",
    "lawyer.dashboard.label.status": "STATUT",
    "lawyer.dashboard.label.specialties": "SPÉCIALITÉS",
    "lawyer.dashboard.label.experience": "EXPÉRIENCE",
    "lawyer.dashboard.years": "{n} ans",
    "lawyer.dashboard.exit": "QUITTER",

    // Footer disclaimer
    "footer.disclaimer": "PocketLawyer fournit des informations juridiques générales basées sur le droit camerounais. Il n'offre pas de conseils juridiques personnalisés, ne peut pas vous représenter en justice et ne devrait pas remplacer la consultation d'un avocat qualifié.",
    "footer.capabilities": "Ce que PocketLawyer peut et ne peut pas faire",
    "footer.can": "PocketLawyer PEUT :",
    "footer.cannot": "PocketLawyer NE PEUT PAS :",
    "footer.can.1": "Fournir des informations générales sur le droit camerounais",
    "footer.can.2": "Expliquer les concepts et la terminologie juridiques",
    "footer.can.3": "Pointer vers des lois et ressources juridiques pertinentes",
    "footer.can.4": "Aider à comprendre les procédures et exigences juridiques",
    "footer.can.5": "Générer des modèles de documents de base",
    "footer.cannot.1": "Fournir des conseils juridiques personnalisés pour des situations spécifiques",
    "footer.cannot.2": "Représenter les utilisateurs devant les tribunaux",
    "footer.cannot.3": "Déposer des documents au nom des utilisateurs",
    "footer.cannot.4": "Garantir les résultats dans les affaires juridiques",
    "footer.cannot.5": "Remplacer un conseil juridique professionnel",
    "footer.terms": "Conditions d'utilisation",
    "footer.privacy": "Politique de confidentialité",

    // Common shared strings
    "Home": "Accueil",
    "Back": "Retour",
    "Cancel": "Annuler",
    "Copy": "Copier",
    "Copied": "Copié",
    "Download": "Télécharger",
    "Save": "Enregistrer",
    "optional": "optionnel",
    "Blog": "Blog",
    "Examples": "Exemples",
    "Return to Chat": "Retour au chat",
    "Copied to clipboard": "Copié dans le presse-papiers",
    "Documents": "Documents",
    "Chat": "Chat",

    // Blog page
    "Legal Resources & Guides": "Ressources et guides juridiques",
    "Articles, guides and resources on Cameroonian law to help you understand your rights and obligations.": "Articles, guides et ressources sur le droit camerounais pour vous aider à comprendre vos droits et obligations.",
    "Search articles...": "Rechercher des articles...",
    "View Examples": "Voir des exemples",
    "Loading articles...": "Chargement des articles...",
    "Failed to load blog posts. Please try again later.": "Échec du chargement des articles. Veuillez réessayer.",
    "Try Again": "Réessayer",
    "Categories": "Catégories",
    "All Categories": "Toutes les catégories",
    "Popular Tags": "Tags populaires",
    "Have a Legal Question?": "Vous avez une question juridique ?",
    "Use our AI assistant to get instant answers to your Cameroonian legal questions.": "Utilisez notre assistant IA pour obtenir des réponses instantanées à vos questions juridiques camerounaises.",
    "Chat with PocketLawyer": "Discuter avec PocketLawyer",
    "No articles found": "Aucun article trouvé",
    "Try adjusting your search or category filters": "Essayez d'ajuster votre recherche ou vos filtres",
    "Reset Filters": "Réinitialiser les filtres",
    "Subscribe to Our Legal Updates": "Abonnez-vous à nos mises à jour juridiques",
    "Get the latest articles and resources on Cameroonian law delivered to your inbox": "Recevez les derniers articles et ressources sur le droit camerounais dans votre boîte de réception",
    "Enter your email": "Entrez votre email",
    "Subscribing...": "Abonnement en cours...",
    "Subscribe": "S'abonner",
    "Please enter your email address": "Veuillez entrer votre adresse email",
    "Failed to process subscription. Please try again.": "Échec du traitement de l'abonnement. Veuillez réessayer.",

    // Draft Contract page
    "Generate professional legal contracts compliant with Cameroonian law and OHADA": "Générez des contrats juridiques professionnels conformes au droit camerounais et à l'OHADA",
    "AI-powered contract generation for Cameroon": "Génération de contrats alimentée par l'IA pour le Cameroun",
    "Select Contract Type": "Sélectionner le type de contrat",
    "Employment Contract": "Contrat de travail",
    "CDI/CDD under Cameroon Labour Code": "CDI/CDD selon le Code du Travail camerounais",
    "Lease Agreement": "Contrat de bail",
    "Residential or commercial rental": "Location résidentielle ou commerciale",
    "Sale of Goods": "Vente de marchandises",
    "Commercial sale under OHADA": "Vente commerciale selon l'OHADA",
    "Service Agreement": "Contrat de prestation de services",
    "Consulting or professional services": "Services de conseil ou professionnels",
    "Non-Disclosure Agreement": "Accord de confidentialité",
    "Confidentiality agreement": "Accord de non-divulgation",
    "Partnership Agreement": "Accord de partenariat",
    "Business partnership terms": "Conditions de partenariat commercial",
    "Loan Agreement": "Contrat de prêt",
    "Personal or business loan": "Prêt personnel ou professionnel",
    "Power of Attorney": "Procuration",
    "Procuration / legal representation": "Procuration / représentation légale",
    "Custom Contract": "Contrat personnalisé",
    "Describe your specific needs": "Décrivez vos besoins spécifiques",
    "Additional Requirements": "Exigences supplémentaires",
    "Describe any specific requirements: parties involved, key terms, special clauses, language preference (English/French)...": "Décrivez les exigences spécifiques : parties impliquées, termes clés, clauses particulières, préférence de langue (anglais/français)...",
    "Generate Contract": "Générer le contrat",
    "New Contract": "Nouveau contrat",
    "Drafting contract...": "Rédaction du contrat en cours...",
    "Request modifications to the contract...": "Demandez des modifications au contrat...",
    "Contracts generated using Cameroonian law templates and OHADA provisions": "Contrats générés à partir de modèles du droit camerounais et des dispositions OHADA",
    "Contract downloaded": "Contrat téléchargé",
    "Please select a contract type": "Veuillez sélectionner un type de contrat",

    // Bookings page
    "My Bookings": "Mes réservations",
    "Manage your legal consultations": "Gérez vos consultations juridiques",
    "Upcoming Consultations": "Consultations à venir",
    "Past Consultations": "Consultations passées",
    "Total Bookings": "Total des réservations",
    "Upcoming": "À venir",
    "Past": "Passées",
    "No upcoming consultations": "Aucune consultation à venir",
    "Browse Lawyers": "Parcourir les avocats",
    "No past consultations": "Aucune consultation passée",
    "Cancel Booking": "Annuler la réservation",
    "Please provide a reason for cancelling this consultation": "Veuillez fournir un motif d'annulation pour cette consultation",
    "Cancellation Reason": "Motif d'annulation",
    "e.g., Schedule conflict, found another lawyer...": "ex. : Conflit d'agenda, autre avocat trouvé...",
    "Keep Booking": "Conserver la réservation",
    "Cancelling...": "Annulation en cours...",
    "Leave a Review": "Laisser un avis",
    "Share your experience with": "Partagez votre expérience avec",
    "Rating": "Note",
    "Your Review": "Votre avis",
    "Share your thoughts about the consultation...": "Partagez vos impressions sur la consultation...",
    "Submitting...": "Envoi en cours...",
    "Submit Review": "Soumettre l'avis",
    "minutes": "minutes",
    "Notes": "Notes",
    "Join Video Call": "Rejoindre l'appel vidéo",
    "Cancelled by": "Annulé par",
    "Total": "Total",
    "Payment": "Paiement",
    "Leave Review": "Laisser un avis",
    "Review submitted": "Avis soumis",
    "Failed to load bookings": "Échec du chargement des réservations",
    "Please sign in to cancel bookings": "Veuillez vous connecter pour annuler des réservations",
    "Please provide a cancellation reason": "Veuillez fournir un motif d'annulation",
    "Booking cancelled successfully": "Réservation annulée avec succès",
    "Failed to cancel booking": "Échec de l'annulation de la réservation",
    "Please sign in to submit reviews": "Veuillez vous connecter pour soumettre des avis",
    "Please write a review comment": "Veuillez écrire un commentaire",
    "Review submitted successfully!": "Avis soumis avec succès !",
    "Failed to submit review": "Échec de la soumission de l'avis",
    "Pending": "En attente",
    "Confirmed": "Confirmée",
    "Completed": "Terminée",
    "Cancelled": "Annulée",

    // Case Review page
    "Get an AI-powered analysis of your legal case under Cameroonian law": "Obtenez une analyse IA de votre cas juridique selon le droit camerounais",
    "AI analysis of legal cases under Cameroonian law": "Analyse IA des cas juridiques selon le droit camerounais",
    "Disclaimer": "Avertissement",
    "This tool provides an AI-generated analysis for informational purposes only. It is not legal advice. Please consult a qualified Cameroonian lawyer for professional legal counsel.": "Cet outil fournit une analyse générée par IA à des fins informatives uniquement. Il ne s'agit pas de conseils juridiques. Veuillez consulter un avocat camerounais qualifié pour un conseil juridique professionnel.",
    "Case Type": "Type de cas",
    "Select case type...": "Sélectionner le type de cas...",
    "Civil Dispute": "Litige civil",
    "Criminal Matter": "Affaire pénale",
    "Commercial / Business": "Commercial / Affaires",
    "Labour / Employment": "Travail / Emploi",
    "Land / Property": "Foncier / Propriété",
    "Family Law": "Droit de la famille",
    "Administrative": "Administratif",
    "Other": "Autre",
    "Describe Your Case": "Décrivez votre cas",
    "Describe the facts of your case in detail. Include: what happened, when, who was involved, any documents or agreements, and what outcome you are seeking...": "Décrivez les faits de votre cas en détail. Incluez : ce qui s'est passé, quand, qui était impliqué, les documents ou accords, et le résultat souhaité...",
    "Example Cases": "Exemples de cas",
    "Wrongful Dismissal": "Licenciement abusif",
    "Employee fired without notice after 5 years of service": "Employé licencié sans préavis après 5 ans de service",
    "Land Dispute": "Litige foncier",
    "Neighbour building on my registered land": "Voisin construisant sur mon terrain enregistré",
    "Unpaid Invoice": "Facture impayée",
    "Client refuses to pay for delivered goods": "Client qui refuse de payer pour des marchandises livrées",
    "Use this example": "Utiliser cet exemple",
    "Start Case Review": "Démarrer l'examen du cas",
    "New Case Review": "Nouvel examen de cas",
    "Analysing case...": "Analyse du cas en cours...",
    "Ask a follow-up question about your case...": "Posez une question de suivi sur votre cas...",
    "Analysis enhanced with built-in Cameroonian law knowledge base": "Analyse enrichie par la base de connaissances intégrée du droit camerounais",
    "Please describe your case details": "Veuillez décrire les détails de votre cas",

    // Legal Research page
    "Research Cameroonian law with AI-powered assistance and built-in legal knowledge base": "Recherchez le droit camerounais avec l'assistance IA et la base de connaissances juridiques intégrée",
    "Powered by Cameroonian law knowledge base + AI": "Propulsé par la base de connaissances du droit camerounais + IA",
    "Popular Research Topics": "Sujets de recherche populaires",
    "Land & Property Law": "Droit foncier et immobilier",
    "Business Formation": "Création d'entreprise",
    "Labour & Employment": "Travail et emploi",
    "Criminal Law": "Droit pénal",
    "Tax Law": "Droit fiscal",
    "Researching...": "Recherche en cours...",
    "Describe the legal topic you want to research...": "Décrivez le sujet juridique que vous souhaitez rechercher...",
    "Responses enhanced with built-in Cameroonian law knowledge base (available offline)": "Réponses enrichies par la base de connaissances intégrée du droit camerounais (disponible hors ligne)",

    // Documents page
    "Document Analysis Center": "Centre d'analyse de documents",
    "Upload, analyze, and extract insights from your legal documents": "Téléchargez, analysez et extrayez des informations de vos documents juridiques",
    "Processed Documents": "Documents traités",
    "Click on a document to analyze it": "Cliquez sur un document pour l'analyser",
    "Select a Document": "Sélectionner un document",
    "characters": "caractères",
    "Document Preview": "Aperçu du document",
    "Quick Analysis": "Analyse rapide",
    "Summarize the key points of this document": "Résumez les points clés de ce document",
    "Who are the parties involved and what are their obligations?": "Qui sont les parties impliquées et quelles sont leurs obligations ?",
    "What are the important dates and deadlines?": "Quelles sont les dates et échéances importantes ?",
    "Identify any potential legal risks or problematic clauses": "Identifiez les risques juridiques potentiels ou les clauses problématiques",
    "What legal rights are established in this document?": "Quels droits juridiques sont établis dans ce document ?",
    "Is this document enforceable under Cameroonian law?": "Ce document est-il exécutoire selon le droit camerounais ?",
    "Custom Question": "Question personnalisée",
    "Ask a specific question about this document...": "Posez une question spécifique sur ce document...",
    "Tip": "Conseil",
    "to submit": "pour soumettre",
    "Analyzing…": "Analyse en cours…",
    "Analyze": "Analyser",
    "Analyzing your document with AI…": "Analyse de votre document avec l'IA en cours…",
    "Analysis History": "Historique d'analyse",
    "Document was truncated. Analysis based on first portion only.": "Le document a été tronqué. Analyse basée sur la première partie uniquement.",
    "Question": "Question",
    "Answer": "Réponse",
    "No document selected": "Aucun document sélectionné",
    "Upload a document above or select one from the list to start analyzing": "Téléchargez un document ci-dessus ou sélectionnez-en un dans la liste pour commencer l'analyse",
    "Quick Tips": "Conseils rapides",
    "Supported Formats": "Formats pris en charge",
    "PDF, DOCX, and TXT files up to 10MB each": "Fichiers PDF, DOCX et TXT jusqu'à 10 Mo chacun",
    "OCR Support": "Support OCR",
    "Scanned PDFs automatically fall back to Tesseract OCR": "Les PDF scannés basculent automatiquement vers Tesseract OCR",
    "AI Analysis": "Analyse IA",
    "Ask specific questions about your documents for detailed insights": "Posez des questions spécifiques sur vos documents pour des analyses détaillées",
    "Secure Processing": "Traitement sécurisé",
    "All documents are processed securely and confidentially": "Tous les documents sont traités de manière sécurisée et confidentielle",
    "Please select a document and enter a question": "Veuillez sélectionner un document et entrer une question",
    "Analysis failed": "Échec de l'analyse",
  }
}

// Dynamic import to avoid circular dependency with auth context
const useAuth = () => {
  try {
    const { useAuth } = require("@/contexts/auth-context")
    return useAuth()
  } catch {
    // Fallback if auth context is not available
    return { user: null, loading: false }
  }
}

// Helper functions for database operations
const saveLanguageToDatabase = async (userId: string, language: Language): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId)
    await updateDoc(userDocRef, {
      languagePreference: language,
      lastLanguageUpdate: new Date()
    })
  } catch (error) {
    // If document doesn't exist, create it
    try {
      const userDocRef = doc(db, "users", userId)
      await setDoc(userDocRef, {
        languagePreference: language,
        lastLanguageUpdate: new Date()
      }, { merge: true })
    } catch (setError) {
      console.error("Error saving language preference to database:", setError)
      throw new Error("Failed to save language preference")
    }
  }
}

const loadLanguageFromDatabase = async (userId: string): Promise<Language | null> => {
  try {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists() && userDoc.data()?.languagePreference) {
      const savedLanguage = userDoc.data().languagePreference
      if (savedLanguage === "en" || savedLanguage === "fr") {
        return savedLanguage as Language
      }
    }
    return null
  } catch (error) {
    console.error("Error loading language preference from database:", error)
    return null
  }
}

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with browser language or stored preference, defaulting to English
  const [language, setLanguageState] = useState<Language>("en")
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)

  // Get auth context
  const auth = useAuth()
  const { user, loading: authLoading } = auth || { user: null, loading: true }

  // Load language preference when user auth state changes
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (authLoading) return // Wait for auth to load
      
      setUserLoaded(false)
      
      if (user && !user.isAnonymous) {
        // For authenticated users, try to load from database first
        try {
          const savedLanguage = await loadLanguageFromDatabase(user.id)
          if (savedLanguage) {
            setLanguageState(savedLanguage)
            localStorage.setItem("language", savedLanguage)
            setUserLoaded(true)
            return
          }
        } catch (error) {
          console.error("Error loading user language preference:", error)
        }
      }
      
      // Fallback to localStorage and browser detection
      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguageState(storedLanguage)
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split("-")[0]
        if (browserLang === "fr") {
          setLanguageState("fr")
        }
      }
      
      setUserLoaded(true)
    }

    loadUserLanguagePreference()
  }, [user, authLoading])

  // Legacy effect for initial load when auth is not available
  useEffect(() => {
    if (!auth) {
      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguageState(storedLanguage)
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split("-")[0]
        if (browserLang === "fr") {
          setLanguageState("fr")
        }
      }
      setUserLoaded(true)
    }
  }, [auth])

  // Set language and save to localStorage with enhanced UX
  const setLanguage = async (lang: Language): Promise<void> => {
    if (lang === language) return
    
    setIsChanging(true)
    setError(null)
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Update state
      setLanguageState(lang)
      
      // Save to localStorage
      localStorage.setItem("language", lang)
      
      // Save to database for authenticated users
      if (user && !user.isAnonymous) {
        try {
          await saveLanguageToDatabase(user.id, lang)
        } catch (dbError) {
          console.error("Failed to save language preference to database:", dbError)
          // Don't fail the entire operation if database save fails
          toast.error("Language changed locally, but failed to sync with your account")
        }
      }
      
      // Show success toast
      const languageNames = { en: "English", fr: "Français" }
      toast.success(`Language switched to ${languageNames[lang]}`, {
        duration: 2000,
      })
      
    } catch (err) {
      setError("Failed to change language. Please try again.")
      toast.error("Failed to change language. Please try again.")
    } finally {
      setIsChanging(false)
    }
  }

  // Translation function
  const t = (key: string): string => {
    const translation = translations[language][key]
    return translation || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isChanging, error }}>{children}</LanguageContext.Provider>
}

// Hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
