'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import {
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    MapPin,
    MoreVertical,
    Search,
    Trash2,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../AdminLayout'

interface JobData {
  id: string
  title: string
  location: string | null
  employmentType: string
  status: string
  createdAt: string
  company: { id: string; name: string; logo: string | null }
  _count: { applications: number }
}

interface CompanyOption {
  id: string
  name: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobData[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(companyFilter && { companyId: companyFilter })
      })
      const res = await fetch(`/api/admin/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      const data = await res.json()
      setJobs(data.jobs)
      setCompanies(data.companies)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [page, statusFilter, companyFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchJobs()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const updateJobStatus = async (jobId: string, status: string) => {
    setUpdating(jobId)
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status })
      })
      if (res.ok) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status } : j))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
      setActionMenuOpen(null)
    }
  }



  const deleteJob = async (jobId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Toutes les candidatures associées seront également supprimées.')) return
    
    setUpdating(jobId)
    try {
      const res = await fetch(`/api/admin/jobs?jobId=${jobId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== jobId))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
      setActionMenuOpen(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
      DRAFT: 'bg-yellow-100 text-yellow-700'
    }
    const labels: Record<string, string> = {
      OPEN: 'Ouverte',
      CLOSED: 'Fermée',
      DRAFT: 'Brouillon'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getEmploymentTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      'FULL_TIME': 'CDI',
      'PART_TIME': 'Temps partiel',
      'CONTRACT': 'CDD',
      'INTERNSHIP': 'Stage',
      'FREELANCE': 'Freelance'
    }
    return labels[type] || type
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Offres d'emploi</h1>
          <p className="text-slate-600">Gérer toutes les offres de la plateforme</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par titre ou entreprise..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('')}
                >
                  Toutes
                </Button>
                <Button
                  variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('OPEN')}
                  className={statusFilter === 'OPEN' ? '' : 'text-green-700'}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ouvertes
                </Button>
                <Button
                  variant={statusFilter === 'CLOSED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('CLOSED')}
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Fermées
                </Button>
                <Button
                  variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('DRAFT')}
                >
                  Brouillons
                </Button>
              </div>
              {companies.length > 0 && (
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Toutes les entreprises</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {pagination?.total || 0} offres
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucune offre trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-slate-600">Offre</th>
                      <th className="pb-3 font-medium text-slate-600 hidden md:table-cell">Entreprise</th>
                      <th className="pb-3 font-medium text-slate-600">Statut</th>
                      <th className="pb-3 font-medium text-slate-600 hidden lg:table-cell">Candidatures</th>
                      <th className="pb-3 font-medium text-slate-600 hidden lg:table-cell">Date</th>
                      <th className="pb-3 font-medium text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {job.company.logo ? (
                                <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:text-teal-600 truncate">
                                  {job.title}
                                </Link>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                  </span>
                                )}
                                <span>{getEmploymentTypeBadge(job.employmentType)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600">{job.company.name}</span>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-4 hidden lg:table-cell">
                          <span className="flex items-center gap-1 text-sm text-slate-600">
                            <Users className="w-4 h-4" />
                            {job._count.applications}
                          </span>
                        </td>
                        <td className="py-4 hidden lg:table-cell text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionMenuOpen(actionMenuOpen === job.id ? null : job.id)}
                              disabled={updating === job.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            {actionMenuOpen === job.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                                <div className="p-1">
                                  <Link
                                    href={`/jobs/${job.id}`}
                                    className="w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 hover:bg-slate-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir l'offre
                                  </Link>
                                  
                                  <div className="border-t my-1" />
                                  
                                  <p className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">Statut</p>
                                  {['OPEN', 'CLOSED'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => updateJobStatus(job.id, status)}
                                      className={`w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 ${
                                        job.status === status 
                                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                          : 'hover:bg-slate-50'
                                      }`}
                                      disabled={job.status === status}
                                    >
                                      {status === 'OPEN' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                      {status === 'OPEN' ? 'Ouvrir' : 'Fermer'}
                                    </button>
                                  ))}

                                  
                                  <div className="border-t my-1" />
                                  
                                  <button
                                    onClick={() => deleteJob(job.id)}
                                    className="w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
