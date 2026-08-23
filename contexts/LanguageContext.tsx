'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { en } from '@/messages/en'
import { ar } from '@/messages/ar'

export type Language = 'en' | 'ar'
type Messages = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  messages: Messages
  dir: 'ltr' | 'rtl'
  isRTL: boolean
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('icss-lang') as Language | null
    if (saved === 'en' || saved === 'ar') {
      setLanguageState(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    localStorage.setItem('icss-lang', language)
  }, [language, mounted])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const messages = language === 'ar' ? (ar as unknown as Messages) : en

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        messages,
        dir: language === 'ar' ? 'rtl' : 'ltr',
        isRTL: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
