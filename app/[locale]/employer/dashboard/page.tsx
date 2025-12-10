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
    },
    take: 5
  })

  const stats = {
    totalJobs: await prisma.job.count({ where: { companyId: company.id } }),
    openJobs: await prisma.job.count({ where: { companyId: company.id, status: 'OPEN' } }),
    totalApplications: await prisma.application.count({
      where: { job: { companyId: company.id } }
    }),
    pendingApplications: await prisma.application.count({
      where: { job: { companyId: company.id }, status: 'PENDING' }
    })
  }

  return { company, jobs, applications, stats }
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

  const { company, jobs, applications, stats } = data

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('activeJobs')}</CardTitle>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{tStatus('open')}</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.openJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('totalApplications')}</CardTitle>
              <FileText className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('newApplications')}</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

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

          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">{t('recentApplications')}</h2>
              {applications.length > 0 && (
                <Link href="/employer/applications" className="text-sm text-teal-600 hover:text-teal-700">
                  {tCommon('viewAll')}
                </Link>
              )}
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{tApps('noApplications')}</h3>
                  <p className="text-slate-600">
                    {t('overview')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{app.candidate.name}</h3>
                          <p className="text-sm text-slate-600 mb-2">{tApps('appliesFor')}: {app.job.title}</p>
                          <Badge variant={
                            app.status === 'ACCEPTED' ? 'success' :
                            app.status === 'REJECTED' ? 'destructive' :
                            app.status === 'REVIEWED' ? 'info' :
                            'secondary'
                          }>
                            {tStatus(app.status.toLowerCase() as any)}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
