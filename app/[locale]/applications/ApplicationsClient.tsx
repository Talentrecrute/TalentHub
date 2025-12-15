'use client'

import ApplicationTimeline from '@/components/candidate/ApplicationTimeline'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import type { Application, ApplicationEvent, Company, Job } from '@prisma/client'
import { Calendar, ChevronDown, ChevronUp, FileText, Filter, History } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

type ApplicationWithJob = Application & {
  job: Job & { company: Company }
  events: ApplicationEvent[]
}

interface ApplicationsClientProps {
  applications: ApplicationWithJob[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200'
}

export default function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const t = useTranslations('applications')
  const tStatus = useTranslations('status')
  const tCommon = useTranslations('common')
  const tDashboard = useTranslations('candidateDashboard')
  const locale = useLocale()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null)

  const statusOptions = [
    { value: 'ALL', label: t('all'), color: 'bg-slate-100 text-slate-700' },
    { value: 'PENDING', label: tStatus('pending'), color: 'bg-yellow-100 text-yellow-700' },
    { value: 'REVIEWED', label: tStatus('reviewed'), color: 'bg-blue-100 text-blue-700' },
    { value: 'ACCEPTED', label: tStatus('accepted'), color: 'bg-green-100 text-green-700' },
    { value: 'REJECTED', label: tStatus('rejected'), color: 'bg-red-100 text-red-700' },
  ]

  const statusLabels: Record<string, string> = {
    PENDING: tStatus('pending'),
    REVIEWED: tStatus('reviewed'),
    ACCEPTED: tStatus('accepted'),
    REJECTED: tStatus('rejected')
  }

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'ALL') return true
    return app.status === statusFilter
  })

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    REVIEWED: applications.filter(a => a.status === 'REVIEWED').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }

  const toggleTimeline = (appId: string) => {
    setExpandedTimeline(expandedTimeline === appId ? null : appId)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{t('filterByStatus')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === option.value
                  ? `${option.color} ring-2 ring-offset-2 ring-teal-500`
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        {t('total', { count: filteredApplications.length })}
      </p>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {statusFilter === 'ALL' ? t('noApplications') : t('noMatchingFilter')}
            </h3>
            <p className="text-slate-600 mb-6">
              {statusFilter === 'ALL' ? tDashboard('startApplying') : t('noMatchingFilter')}
            </p>
            {statusFilter === 'ALL' ? (
              <Link href="/jobs">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  {tDashboard('browseJobs')}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={() => setStatusFilter('ALL')}>
                {tCommon('viewAll')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
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
                      <span>{t('appliedOn')} {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[app.status]} variant="outline">
                    {statusLabels[app.status]}
                  </Badge>
                </div>

                {app.coverLetter && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('coverLetter')}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {/* Timeline Toggle Button */}
                <button
                  onClick={() => toggleTimeline(app.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors mb-4"
                >
                  <History className="w-4 h-4" />
                  {locale === 'fr' ? 'Historique du statut' : 'Status History'}
                  {expandedTimeline === app.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Timeline */}
                {expandedTimeline === app.id && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <ApplicationTimeline 
                      events={app.events} 
                      createdAt={app.createdAt} 
                    />
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
                      {t('viewJob')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
