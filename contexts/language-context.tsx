"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations: Translations = {
  en: {
    // Common
    "app.name": "PocketLawyer",
    "app.tagline": "Your Legal Assistant Powered by AI for Cameroonian Law",
    "app.copyright": "© 2025 PocketLawyer. All rights reserved.",

    // Auth
    "auth.signin": "Sign in",
    "auth.signup": "Create account",
    "auth.signin.title": "Welcome Back",
    "auth.signup.title": "Create Your Account",
    "auth.signin.description": "Sign in to access your account",
    "auth.signup.description": "Join PocketLawyer to get personalized legal assistance",
    "auth.signin.google": "Sign in with Google",
    "auth.signup.google": "Sign up with Google",
    "auth.signin.email": "Sign in with email",
    "auth.signup.email": "Sign up with email",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.create.password": "Create Password",
    "auth.name": "Full Name",
    "auth.forgot.password": "Forgot your password?",
    "auth.no.account": "New to PocketLawyer?",
    "auth.has.account": "Already have an account?",
    "auth.creating": "Creating account...",
    "auth.signing.in": "Signing in...",
    "auth.create.button": "Create Account",
    "auth.signin.button": "Sign In",

    // Account Settings
    "profile.title": "Account Settings",
    "profile.description": "Manage your account information and security settings",
    "profile.tab.profile": "Profile",
    "profile.tab.password": "Password",
    "profile.email.google": "Email cannot be modified for Google-linked accounts",
    "profile.password.google": "Password management is handled through Google for Google-linked accounts",
    "profile.save.changes": "Save Changes",
    "profile.saving": "Saving...",
    "profile.updated": "Changes saved successfully",

    // Welcome Page
    "welcome.hero.title": "Your Legal Assistant Powered by AI",
    "welcome.hero.subtitle": "Get instant answers to your legal questions with our AI-powered platform specializing in Cameroonian law.",
    "welcome.features.title": "Key Features",
    "welcome.feature.chat.title": "AI Legal Assistant",
    "welcome.feature.chat.description": "Get expert guidance on Cameroonian law through our advanced AI system",
    "welcome.feature.search.title": "Legal Research",
    "welcome.feature.search.description": "Access comprehensive resources on Cameroonian law and legal procedures",
    "welcome.feature.personalized.title": "Personalized Support",
    "welcome.feature.personalized.description": "Get tailored legal guidance based on your specific situation",
    "welcome.feature.document.title": "Document Analysis",
    "welcome.feature.document.description": "Submit legal documents for AI-powered review and analysis",

    // Document Handling
    "document.question.prompt": "What would you like to know about this document?",
    "document.question.placeholder": "Ask about key legal points, requirements, or implications...",
    "document.analyzing": "Analyzing document...",
    "document.preview": "Document Preview",

    // Legal Content
    "legal.disclaimer.title": "Important Notice",
    "legal.disclaimer.content": "Information provided is for general reference only and should not be considered legal advice.",
    "legal.privacy.contact": "For privacy-related inquiries, contact us at privacy@pocketlawyer.com",
    "legal.terms.contact": "For questions about terms, contact us at legal@pocketlawyer.com"
  },
  fr: {
    // Common
    "app.name": "PocketLawyer",
    "app.tagline": "Votre Assistant Juridique Alimenté par l'IA pour le Droit Camerounais",
    "app.copyright": "© 2025 PocketLawyer. Tous droits réservés.",

    // Auth
    "auth.signin": "Se connecter",
    "auth.signup": "Créer un compte",
    "auth.signin.title": "Bon retour",
    "auth.signup.title": "Créez Votre Compte",
    "auth.signin.description": "Connectez-vous à votre compte",
    "auth.signup.description": "Rejoignez PocketLawyer pour obtenir une assistance juridique personnalisée",
    "auth.signin.google": "Se connecter avec Google",
    "auth.signup.google": "S'inscrire avec Google",
    "auth.signin.email": "Se connecter avec email",
    "auth.signup.email": "S'inscrire avec email",
    "auth.email": "Adresse Email",
    "auth.password": "Mot de passe",
    "auth.create.password": "Créer un mot de passe",
    "auth.name": "Nom complet",
    "auth.forgot.password": "Mot de passe oublié ?",
    "auth.no.account": "Nouveau sur PocketLawyer ?",
    "auth.has.account": "Déjà un compte ?",
    "auth.creating": "Création du compte...",
    "auth.signing.in": "Connexion en cours...",
    "auth.create.button": "Créer un compte",
    "auth.signin.button": "Se connecter",

    // Account Settings
    "profile.title": "Paramètres du Compte",
    "profile.description": "Gérez vos informations de compte et vos paramètres de sécurité",
    "profile.tab.profile": "Profil",
    "profile.tab.password": "Mot de passe",
    "profile.email.google": "L'email ne peut pas être modifié pour les comptes liés à Google",
    "profile.password.google": "La gestion des mots de passe est effectuée via Google pour les comptes liés",
    "profile.save.changes": "Enregistrer les modifications",
    "profile.saving": "Enregistrement...",
    "profile.updated": "Modifications enregistrées avec succès",

    // Welcome Page
    "welcome.hero.title": "Votre Assistant Juridique Alimenté par l'IA",
    "welcome.hero.subtitle": "Obtenez des réponses instantanées à vos questions juridiques avec notre plateforme IA spécialisée dans le droit camerounais.",
    "welcome.features.title": "Fonctionnalités Principales",
    "welcome.feature.chat.title": "Assistant Juridique IA",
    "welcome.feature.chat.description": "Obtenez des conseils d'expert sur le droit camerounais grâce à notre système IA avancé",
    "welcome.feature.search.title": "Recherche Juridique",
    "welcome.feature.search.description": "Accédez à des ressources complètes sur le droit et les procédures juridiques camerounais",
    "welcome.feature.personalized.title": "Support Personnalisé",
    "welcome.feature.personalized.description": "Recevez des conseils juridiques adaptés à votre situation spécifique",
    "welcome.feature.document.title": "Analyse de Documents",
    "welcome.feature.document.description": "Soumettez des documents juridiques pour une analyse assistée par IA",

    // Document Handling
    "document.question.prompt": "Que souhaitez-vous savoir sur ce document ?",
    "document.question.placeholder": "Posez des questions sur les points juridiques clés, les exigences ou les implications...",
    "document.analyzing": "Analyse du document en cours...",
    "document.preview": "Aperçu du Document",

    // Legal Content
    "legal.disclaimer.title": "Avis Important",
    "legal.disclaimer.content": "Les informations fournies sont uniquement à titre de référence générale et ne doivent pas être considérées comme des conseils juridiques.",
    "legal.privacy.contact": "Pour toute question concernant la confidentialité, contactez-nous à privacy@pocketlawyer.com",
    "legal.terms.contact": "Pour toute question concernant les conditions d'utilisation, contactez-nous à legal@pocketlawyer.com"
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
