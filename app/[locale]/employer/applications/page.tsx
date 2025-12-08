import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import EmployerApplicationsClient from './EmployerApplicationsClient'

async function getApplications(userId: string) {
  // Get employer's company
  const company = await prisma.company.findFirst({
    where: { employerId: userId }
  })

  if (!company) return null

  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId: company.id
      }
    },
    include: {
      job: true,
      candidate: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { company, applications }
}

export default async function EmployerApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  const data = await getApplications(session.user.id)

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune entreprise trouvée</h2>
            <p className="text-slate-600">
              Vous devez d'abord créer une entreprise.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, applications } = data

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Candidatures
          </h1>
          <p className="text-lg text-slate-600">
            {applications.length} candidature{applications.length !== 1 ? 's' : ''} pour {company.name}
          </p>
        </div>

        <EmployerApplicationsClient 
          applications={applications} 
          companyName={company.name}
        />
      </div>
    </div>
  )
}

