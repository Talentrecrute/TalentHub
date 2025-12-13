'use client'

import RecommendedJobs from '@/components/candidate/RecommendedJobs'
import JobCard from '@/components/jobs/JobCard'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import type { Application, Company, Job, SavedJob, User } from '@prisma/client'
import { ArrowRight, Bookmark, FileText, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ApplicationWithJob = Application & {
  job: Job & { company: Company }
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

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {t('welcome')}, {user?.name || t('jobSeeker')}!
          </h1>
          <p className="text-lg text-slate-600">
            {t('overview')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('totalApplications')}
              </CardTitle>
              <FileText className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('pendingApplications')}
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.pendingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('savedJobs')}
              </CardTitle>
              <Bookmark className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">{stats.savedJobs}</div>
            </CardContent>
          </Card>
        </div>

        {profileCompletion < 100 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {t('completeProfile')}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {t('profileCompletion', { percent: profileCompletion })}
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
                    {t('completeProfile')}
                  </Badge>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <RecommendedJobs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('recentApplications')}
              </h2>
              <Link href="/applications" className="text-sm text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                {tCommon('viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

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
                    <Badge className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
                      {t('browseJobs')}
                    </Badge>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/jobs/${app.job.id}`} className="hover:text-teal-600">
                            <h3 className="font-semibold text-slate-900 mb-1">{app.job.title}</h3>
                          </Link>
                          <p className="text-sm text-slate-600 mb-2">{app.job.company.name}</p>
                          <Badge className={statusColors[app.status]}>
                            {tStatus(app.status.toLowerCase() as any)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block mb-2">
                            {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <Link 
                            href="/applications" 
                            className="text-xs text-teal-600 hover:text-teal-700"
                          >
                            {tCommon('viewDetails')} →
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('savedJobs')}
              </h2>
            </div>

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
                    <Badge className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
                      {t('browseJobs')}
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
