'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Trash2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DangerZoneProps {
  userRole?: string
}

export default function DangerZone({ userRole }: DangerZoneProps) {
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

  return (
    <Card className="border-red-200 bg-red-50/50">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-slate-900">Supprimer le compte</p>
              <p className="text-sm text-slate-600">
                Supprime définitivement votre compte et toutes vos données
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-lg border-2 border-red-300">
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
                  {userRole === 'EMPLOYER' ? (
                    <>
                      <li>Votre entreprise et toutes ses offres d'emploi</li>
                      <li>Les candidatures reçues sur vos offres</li>
                    </>
                  ) : (
                    <>
                      <li>Toutes vos candidatures</li>
                      <li>Vos offres sauvegardées</li>
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setConfirmText('')
                }}
                disabled={isDeleting}
                className="order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="order-1 sm:order-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
