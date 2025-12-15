'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface PublicProfileToggleProps {
  userId: string
  initialValue?: boolean
}

export default function PublicProfileToggle({ userId, initialValue = false }: PublicProfileToggleProps) {
  const locale = useLocale()
  const [isPublic, setIsPublic] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const newValue = !isPublic

    try {
      const response = await fetch('/api/user/public-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublicProfile: newValue })
      })

      if (response.ok) {
        setIsPublic(newValue)
        toast.success(
          newValue 
            ? (locale === 'fr' ? 'Profil rendu public !' : 'Profile is now public!')
            : (locale === 'fr' ? 'Profil rendu privé' : 'Profile is now private')
        )
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Failed to update')
    } finally {
      setIsLoading(false)
    }
  }

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${locale}/candidates/${userId}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success(locale === 'fr' ? 'Lien copié !' : 'Link copied!')
  }

  return (
    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {locale === 'fr' ? 'Profil public' : 'Public Profile'}
          </h3>
          <p className="text-sm text-slate-600">
            {locale === 'fr' 
              ? 'Permettre aux recruteurs de voir votre profil'
              : 'Allow recruiters to view your profile'}
          </p>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? 'bg-teal-600' : 'bg-slate-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Share Link */}
      {isPublic && (
        <div className="mt-3 pt-3 border-t border-teal-200">
          <p className="text-xs text-slate-600 mb-2">
            {locale === 'fr' ? 'Lien de partage :' : 'Share link:'}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg truncate"
            />
            <button
              onClick={copyLink}
              className="px-3 py-2 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {locale === 'fr' ? 'Copier' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
