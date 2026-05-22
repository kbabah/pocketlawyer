"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { translations } from "@/locales"

export type Language = "en" | "fr"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  t: (key: string) => string
  isChanging: boolean
  error: string | null
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const useAuth = () => {
  try {
    const { useAuth } = require("@/contexts/auth-context")
    return useAuth()
  } catch {
    return { user: null, loading: false }
  }
}

const saveLanguageToDatabase = async (userId: string, language: Language): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId)
    await updateDoc(userDocRef, {
      languagePreference: language,
      lastLanguageUpdate: new Date()
    })
  } catch (error) {
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)

  const auth = useAuth()
  const { user, loading: authLoading } = auth || { user: null, loading: true }

  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (authLoading) return

      setUserLoaded(false)

      if (user && !user.isAnonymous) {
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

      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguageState(storedLanguage)
      } else {
        const browserLang = navigator.language.split("-")[0]
        if (browserLang === "fr") {
          setLanguageState("fr")
        }
      }

      setUserLoaded(true)
    }

    loadUserLanguagePreference()
  }, [user, authLoading])

  useEffect(() => {
    if (!auth) {
      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguageState(storedLanguage)
      } else {
        const browserLang = navigator.language.split("-")[0]
        if (browserLang === "fr") {
          setLanguageState("fr")
        }
      }
      setUserLoaded(true)
    }
  }, [auth])

  const setLanguage = async (lang: Language): Promise<void> => {
    if (lang === language) return

    setIsChanging(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setLanguageState(lang)
      localStorage.setItem("language", lang)

      if (user && !user.isAnonymous) {
        try {
          await saveLanguageToDatabase(user.id, lang)
        } catch (dbError) {
          console.error("Failed to save language preference to database:", dbError)
          toast.error("Language changed locally, but failed to sync with your account")
        }
      }

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

  const t = (key: string): string => {
    const translation = translations[language][key]
    return translation || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isChanging, error }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
