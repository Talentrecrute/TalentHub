import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            My Applications
          </h1>
          <p className="text-lg text-slate-600">
            {applications.length} total applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600 mb-6">
                You haven't applied to any jobs yet. Start browsing and applying!
              </p>
              <Link href="/jobs">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Browse Jobs
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
                    <div className="flex-1">
                      <Link href={`/jobs/${app.job.id}`} className="hover:text-teal-600">
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">
                          {app.job.title}
                        </h3>
                      </Link>
                      <p className="text-lg text-slate-600 mb-2">{app.job.company.name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={statusColors[app.status]} variant="outline">
                      {app.status}
                    </Badge>
                  </div>

                  {app.coverLetter && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Cover Letter</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="capitalize">{app.job.employmentType.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>{app.job.location}</span>
                    </div>
                    <Link href={`/jobs/${app.job.id}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
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
