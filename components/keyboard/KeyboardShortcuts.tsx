'use client'

import { Command, FileText, Home, MessageSquare, Search, User, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Shortcut {
  key: string
  label: { fr: string; en: string }
  action: () => void
  icon: React.ReactNode
}

export default function KeyboardShortcuts() {
  const locale = useLocale()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const shortcuts: Shortcut[] = [
    {
      key: 'h',
      label: { fr: 'Accueil', en: 'Home' },
      action: () => router.push(`/${locale}`),
      icon: <Home className="w-4 h-4" />
    },
    {
      key: 'j',
      label: { fr: 'Offres d\'emploi', en: 'Jobs' },
      action: () => router.push(`/${locale}/jobs`),
      icon: <Search className="w-4 h-4" />
    },
    {
      key: 'a',
      label: { fr: 'Mes candidatures', en: 'My Applications' },
      action: () => router.push(`/${locale}/applications`),
      icon: <FileText className="w-4 h-4" />
    },
    {
      key: 'm',
      label: { fr: 'Messages', en: 'Messages' },
      action: () => router.push(`/${locale}/messages`),
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      key: 'p',
      label: { fr: 'Mon profil', en: 'My Profile' },
      action: () => router.push(`/${locale}/profile`),
      icon: <User className="w-4 h-4" />
    },
  ]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open command palette with Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(prev => !prev)
      return
    }

    // Close with Escape
    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }

    // Navigation shortcuts when palette is open
    if (isOpen) {
      const shortcut = shortcuts.find(s => s.key === e.key.toLowerCase())
      if (shortcut) {
        e.preventDefault()
        shortcut.action()
        setIsOpen(false)
      }
    }
  }, [isOpen, shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const filteredShortcuts = shortcuts.filter(s => {
    if (!searchQuery) return true
    const label = s.label[locale as 'fr' | 'en'].toLowerCase()
    return label.includes(searchQuery.toLowerCase())
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Command className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'fr' ? 'Rechercher une commande...' : 'Search for a command...'}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-80 overflow-y-auto p-2">
          <div className="text-xs font-medium text-slate-500 px-2 py-1 mb-1">
            {locale === 'fr' ? 'Navigation rapide' : 'Quick Navigation'}
          </div>
          
          {filteredShortcuts.map((shortcut) => (
            <button
              key={shortcut.key}
              onClick={() => {
                shortcut.action()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{shortcut.icon}</span>
                <span className="text-slate-900">
                  {shortcut.label[locale as 'fr' | 'en']}
                </span>
              </div>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
                {shortcut.key.toUpperCase()}
              </kbd>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">↑↓</kbd>
            <span>{locale === 'fr' ? 'naviguer' : 'navigate'}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono">Esc</kbd>
            <span>{locale === 'fr' ? 'fermer' : 'close'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
