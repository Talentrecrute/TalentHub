import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ApplicationsClient from './ApplicationsClient'

async function getApplications(userId: string) {
  return await prisma.application.findMany({
    where: { candidateId: userId },
    include: {
      job: {
        include: {
          company: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role === 'EMPLOYER') {
    redirect('/')
  }

  const applications = await getApplications(session.user.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Mes candidatures
          </h1>
          <p className="text-lg text-slate-600">
            {applications.length} candidature{applications.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        <ApplicationsClient applications={applications} />
      </div>
    </div>
  )
}

