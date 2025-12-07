'use client'

import { Language, t } from '@/lib/translations'
import { createContext, useContext, useEffect, useState } from 'react'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguageState(savedLang)
    }
    setIsLoaded(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const translate = (key: string) => t(key, language)

  // Don't render children until language is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
