import DangerZone from '@/components/account/DangerZone'
import ApplicationKanban from '@/components/employer/ApplicationKanban'
import DashboardStats from '@/components/employer/DashboardStats'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Briefcase, Building2, FileText, PlusCircle, TrendingUp, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import JobActions from './JobActions'

async function getEmployerData(userId: string) {
  const company = await prisma.company.findFirst({
    where: { employerId: userId }
  })

  if (!company) {
    return null
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  // All applications for Kanban and stats
  const allApplications = await prisma.application.findMany({
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

  // Stats
  const stats = {
    totalJobs: await prisma.job.count({ where: { companyId: company.id } }),
    openJobs: await prisma.job.count({ where: { companyId: company.id, status: 'OPEN' } }),
    totalApplications: allApplications.length,
    pendingApplications: allApplications.filter(a => a.status === 'PENDING').length
  }

  // Applications by status for pie chart
  const applicationsByStatus = {
    pending: allApplications.filter(a => a.status === 'PENDING').length,
    reviewed: allApplications.filter(a => a.status === 'REVIEWED').length,
    accepted: allApplications.filter(a => a.status === 'ACCEPTED').length,
    rejected: allApplications.filter(a => a.status === 'REJECTED').length,
  }

  // Applications by job for bar chart
  const jobApplicationCounts = jobs.map(job => ({
    jobTitle: job.title,
    count: job._count.applications
  })).filter(j => j.count > 0).sort((a, b) => b.count - a.count)

  // Weekly applications trend
  const now = new Date()
  const weeklyApplications = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const count = allApplications.filter(a => {
      const appDate = new Date(a.createdAt)
      return appDate >= dayStart && appDate <= dayEnd
    }).length

    weeklyApplications.push({
      day: dayStart.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count
    })
  }

  return { 
    company, 
    jobs, 
    applications: allApplications.slice(0, 5),
    allApplications,
    stats,
    applicationsByStatus,
    applicationsByJob: jobApplicationCounts,
    weeklyApplications
  }
}

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('employerDashboard')
  const tStatus = await getTranslations('status')
  const tCommon = await getTranslations('common')
  const tEmployer = await getTranslations('employer')
  const tNav = await getTranslations('nav')
  const tApps = await getTranslations('applications')
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  const data = await getEmployerData(session.user.id)

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{tEmployer('noCompany')}</h2>
            <p className="text-slate-600 mb-6">
              {tEmployer('createCompanyFirst')}
            </p>
            <Link href="/employer/create-company">
              <Button className="bg-teal-600 hover:bg-teal-700">
                {tEmployer('createCompany')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { 
    company, 
    jobs, 
    allApplications, 
    stats, 
    applicationsByStatus, 
    applicationsByJob, 
    weeklyApplications 
  } = data

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {tNav('dashboard')}
            </h1>
            <p className="text-lg text-slate-600">{company.name}</p>
          </div>
          <Link href="/employer/post-job">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              {tNav('postJob')}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('activeJobs')}</CardTitle>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalJobs}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.openJobs} {tStatus('open').toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">{tStatus('open')}</CardTitle>
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.openJobs}</div>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalJobs > 0 ? Math.round((stats.openJobs / stats.totalJobs) * 100) : 0}% actifs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t('totalApplications')}</CardTitle>
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.totalApplications}</div>
              <p className="text-xs text-blue-600 mt-1">
                {applicationsByStatus.accepted} acceptées
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">{t('newApplications')}</CardTitle>
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{stats.pendingApplications}</div>
              <p className="text-xs text-amber-600 mt-1">À traiter</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Charts */}
        <DashboardStats 
          applicationsByStatus={applicationsByStatus}
          applicationsByJob={applicationsByJob}
          weeklyApplications={weeklyApplications}
        />

        {/* Application Kanban Pipeline */}
        {allApplications.length > 0 && (
          <ApplicationKanban applications={allApplications} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('recentJobs')}</h2>
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('noJobs')}</h3>
                  <p className="text-slate-600 mb-4">{t('createFirst')}</p>
                  <Link href="/employer/post-job">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      {t('postJob')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{job.location}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.status === 'OPEN' ? 'success' : 'secondary'}>
                              {job.status === 'OPEN' ? tStatus('open') : tStatus('closed')}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {job._count.applications} {tApps('title').toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <JobActions jobId={job.id} jobStatus={job.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/employer/post-job">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-teal-200">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <PlusCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Publier une offre</h3>
                      <p className="text-sm text-slate-600">Créer une nouvelle offre d'emploi</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/employer/applications">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Voir toutes les candidatures</h3>
                      <p className="text-sm text-slate-600">{stats.totalApplications} candidatures au total</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">💡 Conseil du jour</h3>
                  <p className="text-sm opacity-90">
                    Les offres avec une description détaillée reçoivent en moyenne 3x plus de candidatures qualifiées.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Danger Zone - Account Deletion */}
        <div className="mt-12">
          <DangerZone userRole="EMPLOYER" />
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
