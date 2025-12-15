'use client'

import RecommendedJobs from '@/components/candidate/RecommendedJobs'
import JobCard from '@/components/jobs/JobCard'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import type { Application, ApplicationEvent, Company, Job, SavedJob, User } from '@prisma/client'
import { Bookmark, FileText, LayoutDashboard, Sparkles, TrendingUp } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

type ApplicationWithJob = Application & {
  job: Job & { company: Company }
  events?: ApplicationEvent[]
}

type SavedJobWithJob = SavedJob & {
  job: Job & { company: Company }
}

interface DashboardClientProps {
  applications: ApplicationWithJob[]
  savedJobs: SavedJobWithJob[]
  user: User | null
  stats: {
    totalApplications: number
    pendingApplications: number
    savedJobs: number
  }
  profileCompletion: number
}

type TabType = 'overview' | 'recommended' | 'applications' | 'saved'

export default function DashboardClient({
  applications,
  savedJobs,
  user,
  stats,
  profileCompletion
}: DashboardClientProps) {
  const t = useTranslations('candidateDashboard')
  const tStatus = useTranslations('status')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700'
  }

  const tabs = [
    { id: 'overview' as TabType, label: locale === 'fr' ? 'Vue d\'ensemble' : 'Overview', icon: LayoutDashboard, count: null },
    { id: 'recommended' as TabType, label: locale === 'fr' ? 'Recommandées' : 'Recommended', icon: Sparkles, count: null },
    { id: 'applications' as TabType, label: locale === 'fr' ? 'Candidatures' : 'Applications', icon: FileText, count: stats.totalApplications },
    { id: 'saved' as TabType, label: locale === 'fr' ? 'Sauvegardées' : 'Saved', icon: Bookmark, count: stats.savedJobs },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {t('welcome')}, {user?.name || t('jobSeeker')}!
          </h1>
          <p className="text-lg text-slate-600">
            {t('overview')}
          </p>
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
                {tab.count !== null && tab.count > 0 && (
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
        <div className="min-h-[400px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-teal-700">
                      {t('totalApplications')}
                    </CardTitle>
                    <FileText className="w-5 h-5 text-teal-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-teal-900">{stats.totalApplications}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">
                      {t('pendingApplications')}
                    </CardTitle>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{stats.pendingApplications}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">
                      {t('savedJobs')}
                    </CardTitle>
                    <Bookmark className="w-5 h-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900">{stats.savedJobs}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Completion */}
              {profileCompletion < 100 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {t('completeProfile')}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {t('profileCompletion', { percent: profileCompletion })}
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2.5 mb-3">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                      </div>
                      <Link href="/profile">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          {t('completeProfile')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Applications Quick View */}
              {applications.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t('recentApplications')}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('applications')}>
                      {tCommon('viewAll')} →
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applications.slice(0, 3).map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{app.job.title}</p>
                            <p className="text-sm text-slate-600">{app.job.company.name}</p>
                          </div>
                          <Badge className={statusColors[app.status]}>
                            {tStatus(app.status.toLowerCase() as any)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recommended Tab */}
          {activeTab === 'recommended' && (
            <RecommendedJobs />
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {t('noApplications')}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {t('startApplying')}
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        {t('browseJobs')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link href={`/jobs/${app.job.id}`} className="hover:text-teal-600">
                              <h3 className="font-semibold text-slate-900 mb-1">{app.job.title}</h3>
                            </Link>
                            <p className="text-sm text-slate-600 mb-2">{app.job.company.name}</p>
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[app.status]}>
                                {tStatus(app.status.toLowerCase() as any)}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <Link href={`/applications`}>
                            <Button variant="outline" size="sm">
                              {tCommon('viewDetails')}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Jobs Tab */}
          {activeTab === 'saved' && (
            <div>
              {savedJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {t('noSavedJobs')}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {t('saveTip')}
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        {t('browseJobs')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.map(saved => (
                    <JobCard
                      key={saved.id}
                      job={saved.job}
                      company={saved.job.company}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
