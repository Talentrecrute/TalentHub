'use client'

import ApplicationKanban from '@/components/employer/ApplicationKanban'
import DashboardStats from '@/components/employer/DashboardStats'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import type { Application, Company, Job, User } from '@prisma/client'
import { Briefcase, FileText, LayoutDashboard, PlusCircle, TrendingUp, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

type JobWithCount = Job & {
  _count: { applications: number }
}

type ApplicationWithDetails = Application & {
  job: Job
  candidate: User
}

interface EmployerDashboardClientProps {
  company: Company
  jobs: JobWithCount[]
  allApplications: ApplicationWithDetails[]
  stats: {
    totalJobs: number
    openJobs: number
    totalApplications: number
    pendingApplications: number
  }
  applicationsByStatus: {
    pending: number
    reviewed: number
    accepted: number
    rejected: number
  }
  applicationsByJob: { jobTitle: string; count: number }[]
  weeklyApplications: { day: string; count: number }[]
}

type TabType = 'overview' | 'jobs' | 'applications'

export default function EmployerDashboardClient({
  company,
  jobs,
  allApplications,
  stats,
  applicationsByStatus,
  applicationsByJob,
  weeklyApplications
}: EmployerDashboardClientProps) {
  const t = useTranslations('employerDashboard')
  const tStatus = useTranslations('status')
  const tNav = useTranslations('nav')
  const tApps = useTranslations('applications')
  const locale = useLocale()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview' as TabType, label: locale === 'fr' ? 'Vue d\'ensemble' : 'Overview', icon: LayoutDashboard },
    { id: 'jobs' as TabType, label: locale === 'fr' ? 'Mes offres' : 'My Jobs', icon: Briefcase, count: stats.totalJobs },
    { id: 'applications' as TabType, label: locale === 'fr' ? 'Candidatures' : 'Applications', icon: Users, count: stats.totalApplications },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
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

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-xs text-blue-600 mt-1">{applicationsByStatus.accepted} acceptées</p>
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
                totalJobs={stats.totalJobs}
                openJobs={stats.openJobs}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
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
                            <Link href={`/jobs/${job.id}`} className="hover:text-teal-600">
                              <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                            </Link>
                            <p className="text-sm text-slate-600 mb-2">{job.location}</p>
                            <div className="flex items-center gap-3">
                              <Badge variant={job.status === 'OPEN' ? 'success' : 'secondary'}>
                                {job.status === 'OPEN' ? tStatus('open') : tStatus('closed')}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {job._count.applications} {tApps('title').toLowerCase()}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(job.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/employer/applications?job=${job.id}`}>
                              <Button variant="outline" size="sm">
                                {tApps('title')}
                              </Button>
                            </Link>
                            <Link href={`/jobs/${job.id}`}>
                              <Button variant="outline" size="sm">
                                Voir
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
          )}

          {/* Applications Tab (Kanban) */}
          {activeTab === 'applications' && (
            <div>
              {allApplications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {locale === 'fr' ? 'Aucune candidature' : 'No applications'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {locale === 'fr' 
                        ? 'Publiez des offres pour recevoir des candidatures.'
                        : 'Post jobs to receive applications.'}
                    </p>
                    <Link href="/employer/post-job">
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        {t('postJob')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <ApplicationKanban applications={allApplications} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
