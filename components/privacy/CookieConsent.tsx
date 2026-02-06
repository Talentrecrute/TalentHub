'use client'

import { Button } from "@/components/ui/button"
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (consent === null) {
      // Show banner after a small delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  const content = {
    fr: {
      title: "Nous respectons votre vie privée",
      message: "Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. En cliquant sur « Tout accepter », vous consentez à notre utilisation des cookies.",
      accept: "Tout accepter",
      decline: "Continuer sans accepter",
      privacy: "Politique de confidentialité"
    },
    en: {
      title: "We respect your privacy",
      message: "We use cookies to improve your experience and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
      accept: "Accept All",
      decline: "Continue without accepting",
      privacy: "Privacy Policy"
    }
  }

  const t = locale === 'fr' ? content.fr : content.en

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-slate-200 shadow-lg md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{t.title}</h3>
          <p className="text-sm text-slate-600">
            {t.message}{' '}
            <a href={`/${locale}/legal/privacy`} className="text-teal-600 hover:underline">
              {t.privacy}
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1 md:flex-none whitespace-nowrap"
          >
            {t.decline}
          </Button>
          <Button 
            onClick={handleAccept} 
            className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
          >
            {t.accept}
          </Button>
        </div>
      </div>
    </div>
  )
}
