'use client'

import { Button } from "@/components/ui/button"
import { usePWA } from '@/hooks/usePWA'
import { Download, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
  const locale = useLocale()
  const { isInstallable, install } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Show prompt after a delay
    const timer = setTimeout(() => {
      if (isInstallable && !dismissed) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isInstallable])

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setShowPrompt(false)
    }
  }

  if (!showPrompt || isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-slide-up">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-teal-600 rounded-xl flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-sm">
            {locale === 'fr' ? 'Installer l\'application' : 'Install the app'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {locale === 'fr' 
              ? 'Accédez rapidement à OceanicJob depuis votre écran d\'accueil'
              : 'Quick access to OceanicJob from your home screen'}
          </p>
          <Button 
            onClick={handleInstall}
            size="sm"
            className="mt-3 bg-teal-600 hover:bg-teal-700 text-white w-full"
          >
            <Download className="w-4 h-4 mr-1" />
            {locale === 'fr' ? 'Installer' : 'Install'}
          </Button>
        </div>
      </div>
    </div>
  )
}
