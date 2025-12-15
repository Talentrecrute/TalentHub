'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Link } from '@/i18n/routing'
import { AlertTriangle, ArrowLeft, Trash2, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { data: session } = useSession()
  const t = useTranslations('common')
  const router = useRouter()
  
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Veuillez taper DELETE pour confirmer')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      toast.success('Compte supprimé avec succès')
      
      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' })

    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Erreur lors de la suppression du compte')
      setIsDeleting(false)
    }
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Paramètres du compte</h1>
          <p className="text-slate-600 mt-2">Gérez votre compte et vos préférences</p>
        </div>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'Profile'} 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600">
                    {session.user?.name?.[0] || session.user?.email?.[0] || '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-lg text-slate-900">{session.user?.name}</p>
                <p className="text-slate-600">{session.user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                  {session.user?.role === 'EMPLOYER' ? 'Employeur' : 'Candidat'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Supprimer le compte</p>
                  <p className="text-sm text-slate-600">
                    Supprime définitivement votre compte et toutes vos données
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-red-50 rounded-lg border-2 border-red-300">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Êtes-vous absolument sûr ?
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées :
                    </p>
                    <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                      <li>Votre profil et informations personnelles</li>
                      <li>Toutes vos candidatures</li>
                      <li>Vos offres sauvegardées</li>
                      {session.user?.role === 'EMPLOYER' && (
                        <>
                          <li>Votre entreprise et toutes ses offres d'emploi</li>
                          <li>Les candidatures reçues sur vos offres</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-900 mb-2">
                    Pour confirmer, tapez <strong>DELETE</strong> ci-dessous :
                  </label>
                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setConfirmText('')
                    }}
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== 'DELETE' || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer définitivement mon compte
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
