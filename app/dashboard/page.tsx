import JobCard from '@/components/jobs/JobCard'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowRight, Bookmark, FileText, TrendingUp } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getDashboardData(userId: string) {
  const [applications, savedJobs, user] = await Promise.all([
    prisma.application.findMany({
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
      },
      take: 5
    }),
    prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    }),
    prisma.user.findUnique({
      where: { id: userId }
    })
  ])

  const stats = {
    totalApplications: await prisma.application.count({ where: { candidateId: userId } }),
    pendingApplications: await prisma.application.count({ where: { candidateId: userId, status: 'PENDING' } }),
    savedJobs: await prisma.savedJob.count({ where: { userId } }),
  }

  return { applications, savedJobs, user, stats }
}

function calculateProfileCompletion(user: any) {
  const fields = [
    user.name,
    user.phone,
    user.location,
    user.bio,
    user.skills,
    user.experience,
    user.education,
    user.resume
  ]
  const filledFields = fields.filter(f => f && (typeof f === 'string' ? f.length > 0 : true)).length
  return Math.round((filledFields / fields.length) * 100)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role === 'EMPLOYER') {
    redirect('/')
  }

  const { applications, savedJobs, user, stats } = await getDashboardData(session.user.id)
  const profileCompletion = calculateProfileCompletion(user)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name || 'Job Seeker'}!
          </h1>
          <p className="text-lg text-slate-600">
            Here's your job search overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Applications</CardTitle>
              <FileText className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.pendingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Saved Jobs</CardTitle>
              <Bookmark className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">{stats.savedJobs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Your profile is {profileCompletion}% complete. A complete profile increases your chances of getting hired!
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
                <Link href="/profile">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                    Complete Profile
                  </Badge>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-slate-600 mb-4">Start applying to jobs to see them here</p>
                  <Link href="/jobs">
                    <Badge className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
                      Browse Jobs
                    </Badge>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Link key={app.id} href={`/jobs/${app.job.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{app.job.title}</h3>
                            <p className="text-sm text-slate-600 mb-2">{app.job.company.name}</p>
                            <Badge variant={
                              app.status === 'ACCEPTED' ? 'success' :
                              app.status === 'REJECTED' ? 'destructive' :
                              app.status === 'REVIEWED' ? 'info' :
                              'secondary'
                            } className="capitalize">
                              {app.status.toLowerCase()}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Saved Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Saved Jobs</h2>
            </div>

            {savedJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved jobs</h3>
                  <p className="text-slate-600 mb-4">Save jobs you're interested in to view them here</p>
                  <Link href="/jobs">
                    <Badge className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
                      Browse Jobs
                    </Badge>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedJobs.slice(0, 3).map(saved => (
                  <JobCard
                    key={saved.id}
                    job={saved.job}
                    company={saved.job.company}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
