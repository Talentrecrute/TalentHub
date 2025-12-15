'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Link } from '@/i18n/routing'
import type { Application, Job, User } from '@prisma/client'
import { Calendar, Download, FileText, Filter, Search, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type ApplicationWithDetails = Application & {
  job: Job
  candidate: User
}

interface EmployerApplicationsClientProps {
  applications: ApplicationWithDetails[]
  companyName: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200'
}

export default function EmployerApplicationsClient({ 
  applications, 
  companyName 
}: EmployerApplicationsClientProps) {
  const t = useTranslations('applications')
  const tStatus = useTranslations('status')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [jobFilter, setJobFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const statusOptions = [
    { value: 'ALL', label: t('all'), color: 'bg-slate-100 text-slate-700' },
    { value: 'PENDING', label: tStatus('pending'), color: 'bg-yellow-100 text-yellow-700' },
    { value: 'REVIEWED', label: tStatus('reviewed'), color: 'bg-blue-100 text-blue-700' },
    { value: 'ACCEPTED', label: tStatus('accepted'), color: 'bg-green-100 text-green-700' },
    { value: 'REJECTED', label: tStatus('rejected'), color: 'bg-red-100 text-red-700' },
  ]

  const dateOptions = [
    { value: 'ALL', label: locale === 'fr' ? 'Toutes les dates' : 'All dates' },
    { value: '7', label: locale === 'fr' ? '7 derniers jours' : 'Last 7 days' },
    { value: '30', label: locale === 'fr' ? '30 derniers jours' : 'Last 30 days' },
    { value: '90', label: locale === 'fr' ? '3 derniers mois' : 'Last 3 months' },
  ]

  const statusLabels: Record<string, string> = {
    PENDING: tStatus('pending'),
    REVIEWED: tStatus('reviewed'),
    ACCEPTED: tStatus('accepted'),
    REJECTED: tStatus('rejected')
  }

  // Get unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const jobMap = new Map<string, string>()
    applications.forEach(app => {
      if (!jobMap.has(app.job.id)) {
        jobMap.set(app.job.id, app.job.title)
      }
    })
    return Array.from(jobMap).map(([id, title]) => ({ id, title }))
  }, [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false
      
      // Date filter
      if (dateFilter !== 'ALL') {
        const days = parseInt(dateFilter)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        if (new Date(app.createdAt) < cutoff) return false
      }
      
      // Job filter
      if (jobFilter !== 'ALL' && app.job.id !== jobFilter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const candidateName = (app.candidate.name || '').toLowerCase()
        const candidateEmail = app.candidate.email.toLowerCase()
        if (!candidateName.includes(query) && !candidateEmail.includes(query)) return false
      }
      
      return true
    })
  }, [applications, statusFilter, dateFilter, jobFilter, searchQuery])

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    REVIEWED: applications.filter(a => a.status === 'REVIEWED').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }

  const activeFiltersCount = [
    statusFilter !== 'ALL',
    dateFilter !== 'ALL',
    jobFilter !== 'ALL',
    searchQuery !== ''
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setStatusFilter('ALL')
    setDateFilter('ALL')
    setJobFilter('ALL')
    setSearchQuery('')
  }

  // Export to CSV
  const handleExportCsv = () => {
    setIsExporting(true)
    
    try {
      const headers = ['Nom', 'Email', 'Poste', 'Statut', 'Date de candidature', 'Lettre de motivation']
      const rows = filteredApplications.map(app => [
        app.candidate.name || 'N/A',
        app.candidate.email,
        app.job.title,
        statusLabels[app.status],
        new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US'),
        (app.coverLetter || '').replace(/"/g, '""').substring(0, 500)
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `candidatures_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(locale === 'fr' ? 'Export CSV réussi !' : 'CSV export successful!')
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de l\'export' : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      {/* Filters Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-slate-900">
                {locale === 'fr' ? 'Filtres' : 'Filters'}
              </h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {locale === 'fr' ? 'Effacer' : 'Clear'}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCsv}
                disabled={isExporting || filteredApplications.length === 0}
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {locale === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Search className="w-4 h-4 inline mr-1" />
                {locale === 'fr' ? 'Rechercher' : 'Search'}
              </label>
              <Input
                type="text"
                placeholder={locale === 'fr' ? 'Nom ou email...' : 'Name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                {locale === 'fr' ? 'Période' : 'Period'}
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                {locale === 'fr' ? 'Offre d\'emploi' : 'Job Posting'}
              </label>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">{locale === 'fr' ? 'Toutes les offres' : 'All jobs'}</option>
                {uniqueJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (mini) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {locale === 'fr' ? 'Statut' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Pills (quick toggle) */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === option.value
                    ? `${option.color} ring-2 ring-offset-1 ring-teal-500`
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-slate-600 mb-4">
        {filteredApplications.length === applications.length 
          ? t('total', { count: filteredApplications.length })
          : (locale === 'fr' 
              ? `${filteredApplications.length} résultat(s) sur ${applications.length}` 
              : `${filteredApplications.length} of ${applications.length} results`)
        }
      </p>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {statusFilter === 'ALL' && !searchQuery ? t('noApplications') : t('noMatchingFilter')}
            </h3>
            <p className="text-slate-600 mb-6">
              {statusFilter === 'ALL' && !searchQuery
                ? (locale === 'fr' 
                    ? "Les candidatures apparaîtront ici lorsque des candidats postuleront à vos offres" 
                    : "Applications will appear here when candidates apply to your jobs")
                : (locale === 'fr'
                    ? "Essayez de modifier vos critères de recherche"
                    : "Try adjusting your search criteria")}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-2" />
                {locale === 'fr' ? 'Effacer les filtres' : 'Clear filters'}
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
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {app.candidate.name?.[0]?.toUpperCase() || app.candidate.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {app.candidate.name || app.candidate.email}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {t('appliesFor')}: <span className="font-medium">{app.job.title}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
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

                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{tCommon('contact')}:</span> {app.candidate.email}
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Link href={`/employer/applications/${app.id}`}>
                      <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
                        {t('viewFullProfile')}
                      </Button>
                    </Link>
                    <Link href={`/jobs/${app.job.id}`}>
                      <Button variant="outline" size="sm">
                        {t('viewJob')}
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
  )
}
