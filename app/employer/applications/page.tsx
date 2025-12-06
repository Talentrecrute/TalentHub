import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, FileText, User } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Company Found</h2>
            <p className="text-slate-600">
              You need to create a company first.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, applications } = data

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  }

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
            {applications.length} candidature{applications.length > 1 ? 's' : ''} pour {company.name}
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune candidature</h3>
              <p className="text-slate-600 mb-6">
                Les candidatures apparaîtront ici lorsque des candidats postuleront à vos offres
              </p>
              <Link href="/employer/post-job">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Publier une offre
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {app.candidate.name || app.candidate.email}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Postule pour : <span className="font-medium">{app.job.title}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[app.status]} variant="outline">
                      {app.status}
                    </Badge>
                  </div>

                  {app.coverLetter && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Lettre de motivation</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Contact:</span> {app.candidate.email}
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Link href={`/employer/applications/${app.id}`}>
                        <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
                          Voir le profil complet
                        </Button>
                      </Link>
                      <Link href={`/jobs/${app.job.id}`}>
                        <Button variant="outline" size="sm">
                          Voir l'offre
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
