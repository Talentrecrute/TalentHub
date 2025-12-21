'use client'

import { Button } from '@/components/ui/button'
import { Check, Copy, Linkedin, MessageCircle, Share2, Twitter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  variant?: 'icon' | 'button'
}

export default function ShareButton({ url, title, description = '', variant = 'icon' }: ShareButtonProps) {
  const t = useTranslations('share')
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : url

  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-50 hover:text-sky-500',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-50 hover:text-green-600',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
        return
      } catch (err) {
        // User cancelled or error, fall back to dropdown
      }
    }
    setShowDropdown(!showDropdown)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={`${variant === 'icon' ? 'p-2' : ''} text-slate-500 hover:text-teal-600 hover:bg-teal-50`}
      >
        <Share2 className="w-4 h-4" />
        {variant === 'button' && <span className="ml-2">{t('share')}</span>}
      </Button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-500">{t('shareVia')}</p>
            </div>
            
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-slate-700 transition-colors ${link.color}`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </a>
            ))}
            
            <div className="border-t border-slate-100 mt-2 pt-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('copyLink')}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
