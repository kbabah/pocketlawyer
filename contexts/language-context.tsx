"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define available languages
export type Language = "en" | "fr"

// Define the context type
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations = {
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
    "chat.search.placeholder": "Search the web...",
    "chat.search": "Search",

    // Document analysis
    "document.select": "Select Document",
    "document.signin.prompt": "Sign in for enhanced document analysis and to save your results",
    "document.preview": "Document Preview",
    "document.question.prompt": "Ask a question about this document",
    "document.question.placeholder":
      "E.g., What are the key legal points in this document? Or, Can you summarize this document?",
    "document.analyze": "Analyze Document",
    "document.analyzing": "Analyzing...",

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
    "chat.search.placeholder": "Rechercher sur le web...",
    "chat.search": "Rechercher",

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
  }
}

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with browser language or stored preference, defaulting to English
  const [language, setLanguageState] = useState<Language>("en")

  // Load language preference from localStorage on mount
  useEffect(() => {
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
  }, [])

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  // Translation function
  const t = (key: string): string => {
    const translation = translations[language][key]
    return translation || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
