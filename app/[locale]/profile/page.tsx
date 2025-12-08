import { Card, CardContent } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import CompanyProfileForm from './CompanyProfileForm'
import ProfileForm from './ProfileForm'
import ProfilePhotoUpload from './ProfilePhotoUpload'
import ResumeUpload from './ResumeUpload'

async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId }
  })
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getServerSession(authOptions)
  const { locale } = await params
  const t = await getTranslations('profile')
  const tApps = await getTranslations('applications')
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await getUser(session.user.id)

  if (!user) {
    redirect('/')
  }

  const isEmployer = user.role === 'EMPLOYER'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {tApps('backToDashboard')}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {isEmployer ? t('companyProfile') : t('title')}
          </h1>
          <p className="text-lg text-slate-600">
            {isEmployer 
              ? (locale === 'fr' ? 'Gérez les informations de votre entreprise' : 'Manage your company information')
              : (locale === 'fr' ? 'Gérez vos informations professionnelles' : 'Manage your professional information')}
          </p>
        </div>

        {/* Profile Photo Section */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              {isEmployer 
                ? (locale === 'fr' ? "Logo de l'entreprise" : "Company Logo")
                : t('profilePhoto')}
            </h2>
            <ProfilePhotoUpload currentPhoto={user.image} />
          </CardContent>
        </Card>

        {/* Resume Section - Only for Candidates */}
        {!isEmployer && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('resume')}</h2>
            <ResumeUpload currentResume={user.resume} />
          </div>
        )}

        {/* Profile Form */}
        <Card>
          <CardContent className="p-8">
            {isEmployer ? (
              <CompanyProfileForm user={user} initialData={user} />
            ) : (
              <ProfileForm user={user} initialData={user} />
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('accountInfo')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('role')}
                </label>
                <p className="text-slate-900 capitalize">
                  {user.role === 'EMPLOYER' ? t('employer') : t('candidate')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('memberSince')}
                </label>
                <p className="text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
