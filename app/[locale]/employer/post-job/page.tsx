import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Building2 } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PostJobForm from './PostJobForm'

export default async function PostJobPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  // Check if employer has a company
  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune entreprise trouvée</h2>
            <p className="text-slate-600 mb-6">
              Vous devez créer votre profil d'entreprise avant de pouvoir poster des offres d'emploi.
            </p>
            <Link href="/employer/create-company">
              <Button className="bg-teal-600 hover:bg-teal-700">
                Créer mon entreprise
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Publier une offre d'emploi
          </h1>
          <p className="text-lg text-slate-600">
            Créez une nouvelle offre pour {company.name}
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <PostJobForm companyId={company.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
