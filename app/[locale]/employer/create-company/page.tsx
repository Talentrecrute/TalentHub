import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CreateCompanyForm from './CreateCompanyForm'

export default async function CreateCompanyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  // Check if employer already has a company
  const existingCompany = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (existingCompany) {
    redirect('/employer/dashboard')
  }

  // Get user profile data to pre-fill form
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Créer votre entreprise
          </h1>
          <p className="text-lg text-slate-600">
            Commencez par créer le profil de votre entreprise pour pouvoir poster des offres d'emploi
          </p>
        </div>

        <CreateCompanyForm initialData={user ? {
          companyName: user.companyName || undefined,
          companyDescription: user.companyDescription || undefined,
          companyWebsite: user.companyWebsite || undefined,
          companyIndustry: user.companyIndustry || undefined,
          companySize: user.companySize || undefined,
          location: user.location || undefined,
        } : undefined} />
      </div>
    </div>
  )
}
