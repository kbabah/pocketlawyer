"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Define supported languages
const SUPPORTED_LANGUAGES = ["en", "fr", "es", "zh", "ar", "ru", "pt", "de"]

// Define translations - in a real app, these would be loaded from JSON files
// This is a simplified example with just a few translations
const translations: Record<string, Record<string, string>> = {
  en: {
    "chat.tab.chat": "Chat",
    "chat.tab.web": "Web Search",
    "chat.tab.document": "Document Analysis",
    "chat.welcome.title": "Welcome to Pocket Lawyer",
    "chat.welcome.subtitle": "Your AI-powered legal assistant",
    "chat.try.asking": "Try asking",
    "chat.example1": "What are my rights as a tenant?",
    "chat.example2": "Can you explain the process of filing for divorce?",
    "chat.example3": "What should I do after a car accident?",
    "chat.input.placeholder": "Ask a legal question...",
    "chat.send": "Send",
    "chat.sending": "Sending...",
    "chat.limit.reached": "Message limit reached. Sign in to continue.",
    "chat.remaining.messages": "{remaining} messages remaining",
    "chat.not.found": "Chat not found",
    "chat.unauthorized": "You are not authorized to view this chat",
    "chat.error.loading": "Error loading chat",
    "chat.error.sending": "Error sending message",
    "chat.error.saving": "Error saving chat",
    "chat.saved": "Chat saved successfully",
    "auth.signin": "Sign In",
    "chat.signin.prompt": "to save chats and access premium features",
    "document.analyze": "Document Analysis",
    "document.select": "Select Document",
    "document.extract": "Extract Text",
    "document.analyzing": "Analyzing...",
    "document.preview": "Document Preview",
    "document.question.prompt": "Ask a question about this document",
    "document.question.placeholder": "E.g., What are the key legal points in this document?",
    "document.answer": "Answer",
    "search.placeholder": "Search for legal information...",
    "search.no.results": "No results found. Try a different search term.",
    "sidebar.new.chat": "New Chat",
    "sidebar.no.history": "No chat history",
    "sidebar.start.conversation": "Start a new conversation to see it here",
    "sidebar.delete.chat": "Delete chat",
    "sidebar.delete.confirm": "Are you sure you want to delete this chat? This action cannot be undone.",
    "sidebar.cancel": "Cancel",
    "sidebar.delete": "Delete",
    "sidebar.signout": "Sign Out",
    "profile.title": "Profile",
    "filters.title": "Filters",
    "filters.reset": "Reset",
    "filters.specialties": "Practice Areas",
    "filters.languages": "Languages",
    "filters.rating": "Rating",
    "filters.experience": "Experience",
    "filters.hourly.rate": "Hourly Rate",
    "filters.location": "Location",
    "filters.minimum": "Minimum",
    "filters.maximum": "Maximum",
    "filters.years": "years",
    "filters.any": "Any",
    "filters.enter.location": "City, state, or country",
    "filters.location.placeholder": "Enter location",
    "filters.virtual.option": "Virtual consultations available",
    "filters.apply": "Apply Filters",
    "feedback.leave": "Leave Feedback",
    "feedback.title": "Feedback",
    "feedback.description": "Your feedback helps us improve our service",
    "feedback.helpful": "Helpful",
    "feedback.not.helpful": "Not Helpful",
    "feedback.comment.label": "Additional Comments",
    "feedback.comment.placeholder": "What did you like or dislike about the response?",
    "feedback.cancel": "Cancel",
    "feedback.submit": "Submit Feedback",
    "feedback.submitting": "Submitting...",
    "feedback.submit.success": "Thank you for your feedback!",
    "feedback.submit.error": "Failed to submit feedback",
    "feedback.rating.required": "Please select if the response was helpful or not"
  },
  fr: {
    "chat.tab.chat": "Discussion",
    "chat.tab.web": "Recherche Web",
    "chat.tab.document": "Analyse de Document",
    "chat.welcome.title": "Bienvenue sur Pocket Lawyer",
    "chat.welcome.subtitle": "Votre assistant juridique alimenté par l'IA"
    // Add more French translations as needed
  },
  es: {
    "chat.tab.chat": "Chat",
    "chat.tab.web": "Búsqueda Web",
    "chat.tab.document": "Análisis de Documentos",
    "chat.welcome.title": "Bienvenido a Pocket Lawyer",
    "chat.welcome.subtitle": "Su asistente legal con tecnología de IA"
    // Add more Spanish translations as needed
  }
  // Add more languages as needed
}

// Language context type
interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  supportedLanguages: string[]
  t: (key: string, params?: Record<string, string | number>) => string
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  supportedLanguages: SUPPORTED_LANGUAGES,
  t: (key) => key
})

export function useLanguage() {
  return useContext(LanguageContext)
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Set default language or get from local storage if available
  const [language, setLanguage] = useState<string>("en")
  
  useEffect(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem("preferred-language")
    
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // If no language is saved, try to detect from browser
      const browserLang = navigator.language.split("-")[0]
      const detectedLang = SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : "en"
      setLanguage(detectedLang)
    }
  }, [])
  
  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("preferred-language", language)
  }, [language])
  
  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Get translation for current language
    const translation = translations[language]?.[key] || translations["en"]?.[key] || key
    
    // Replace parameters if any
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, value]) => str.replace(`{${param}}`, String(value)),
        translation
      )
    }
    
    return translation
  }
  
  return (
    <LanguageContext.Provider value={{ 
      language,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  )
}
