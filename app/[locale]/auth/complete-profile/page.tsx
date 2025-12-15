'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { Briefcase, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CompleteProfilePage() {
  const { data: session, update } = useSession()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'CANDIDATE' | 'EMPLOYER' | null>(null)

  const handleRoleSelection = async (role: 'CANDIDATE' | 'EMPLOYER') => {
    setSelectedRole(role)
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      // Update the session to reflect the new role
      await update({ role })

      toast.success(t('welcomeBack'))

      // Redirect based on role
      if (role === 'EMPLOYER') {
        router.push('/employer/create-company')
      } else {
        router.push('/jobs')
      }
      router.refresh()

    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Une erreur est survenue')
      setIsLoading(false)
      setSelectedRole(null)
    }
  }

  // If user already has a role and it's not their first login, redirect
  useEffect(() => {
    if (session?.user?.role && session.user.role !== 'CANDIDATE') {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">🌊 OceanicJob</h1>
          </Link>
          <p className="text-slate-600">{t('welcomeBack')} 🎉</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenue sur OceanicJob !</CardTitle>
            <CardDescription className="text-base mt-2">
              {session?.user?.name ? `Bonjour ${session.user.name} ! ` : ''}
              Pour personnaliser votre expérience, dites-nous qui vous êtes :
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Candidate Option */}
            <button
              onClick={() => handleRoleSelection('CANDIDATE')}
              disabled={isLoading}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                selectedRole === 'CANDIDATE' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
              } ${isLoading && selectedRole !== 'CANDIDATE' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedRole === 'CANDIDATE' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-600'
              }`}>
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  {t('iAmCandidate')}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Je cherche un emploi et souhaite postuler à des offres
                </p>
                {selectedRole === 'CANDIDATE' && isLoading && (
                  <div className="flex items-center gap-2 mt-2 text-teal-600">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Configuration en cours...</span>
                  </div>
                )}
              </div>
            </button>

            {/* Employer Option */}
            <button
              onClick={() => handleRoleSelection('EMPLOYER')}
              disabled={isLoading}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                selectedRole === 'EMPLOYER' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              } ${isLoading && selectedRole !== 'EMPLOYER' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedRole === 'EMPLOYER' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  {t('iAmEmployer')}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Je recrute et souhaite publier des offres d'emploi
                </p>
                {selectedRole === 'EMPLOYER' && isLoading && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Configuration en cours...</span>
                  </div>
                )}
              </div>
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500">
                Vous pourrez modifier votre profil à tout moment dans les paramètres.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            ← {tCommon('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
