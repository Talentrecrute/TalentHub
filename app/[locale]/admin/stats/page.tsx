'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import {
    BookOpen,
    Briefcase,
    Building2,
    CheckCircle,
    Clock,
    FileText,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../AdminLayout'

interface StatsData {
  counts: {
    totalUsers: number
    totalCandidates: number
    totalEmployers: number
    totalJobs: number
    openJobs: number
    closedJobs: number
    totalApplications: number
    pendingApplications: number
    acceptedApplications: number
    rejectedApplications: number
    totalCompanies: number
    totalBlogPosts: number
    publishedBlogPosts: number
  }
  growth: {
    usersThisWeek: number
    userGrowth: number
    jobsThisWeek: number
    jobGrowth: number
  }
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
    image: string | null
  }>
  recentJobs: Array<{
    id: string
    title: string
    createdAt: string
    status: string
    company: { name: string; logo: string | null }
  }>
  recentApplications: Array<{
    id: string
    createdAt: string
    status: string
    user: { name: string | null; email: string }
    job: { title: string }
  }>
  topCompanies: Array<{
    id: string
    name: string
    logo: string | null
    jobCount: number
  }>
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError('Erreur lors du chargement des statistiques')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      EMPLOYER: 'bg-blue-100 text-blue-700',
      CANDIDATE: 'bg-green-100 text-green-700'
    }
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      EMPLOYER: 'Employeur',
      CANDIDATE: 'Candidat'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      REVIEWED: 'bg-blue-100 text-blue-700'
    }
    const labels: Record<string, string> = {
      OPEN: 'Ouverte',
      CLOSED: 'Fermée',
      PENDING: 'En attente',
      ACCEPTED: 'Acceptée',
      REJECTED: 'Refusée',
      REVIEWED: 'Examinée'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
          <p className="text-slate-600">Vue d'ensemble de la plateforme</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-slate-200 rounded w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        ) : stats ? (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Users */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Utilisateurs</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.counts.totalUsers}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growth.userGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${stats.growth.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.growth.userGrowth >= 0 ? '+' : ''}{stats.growth.userGrowth}% cette semaine
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                    <span className="text-slate-600">{stats.counts.totalCandidates} candidats</span>
                    <span className="text-slate-600">{stats.counts.totalEmployers} employeurs</span>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Offres d'emploi</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.counts.totalJobs}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growth.jobGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${stats.growth.jobGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.growth.jobGrowth >= 0 ? '+' : ''}{stats.growth.jobGrowth}% cette semaine
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                    <span className="text-green-600">{stats.counts.openJobs} ouvertes</span>
                    <span className="text-slate-600">{stats.counts.closedJobs} fermées</span>
                  </div>
                </CardContent>
              </Card>

              {/* Applications */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Candidatures</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.counts.totalApplications}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span>{stats.counts.pendingApplications}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{stats.counts.acceptedApplications}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span>{stats.counts.rejectedApplications}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Companies */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Entreprises</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.counts.totalCompanies}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      <span>{stats.counts.publishedBlogPosts}/{stats.counts.totalBlogPosts} articles publiés</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Utilisateurs récents</CardTitle>
                  <Link href="/admin/users" className="text-sm text-teal-600 hover:underline">
                    Voir tout →
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.name?.charAt(0) || user.email.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{user.name || user.email}</p>
                          <p className="text-sm text-slate-500">{formatDate(user.createdAt)}</p>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Offres récentes</CardTitle>
                  <Link href="/admin/jobs" className="text-sm text-teal-600 hover:underline">
                    Voir tout →
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentJobs.map(job => (
                      <div key={job.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                          {job.company.logo ? (
                            <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{job.title}</p>
                          <p className="text-sm text-slate-500">{job.company.name}</p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidatures récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentApplications.map(app => (
                      <div key={app.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{app.user.name || app.user.email}</p>
                          <p className="text-sm text-slate-500 truncate">{app.job.title}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top entreprises</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topCompanies.map((company, index) => (
                      <div key={company.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                          {company.logo ? (
                            <img src={company.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{company.name}</p>
                        </div>
                        <span className="text-sm text-slate-600">{company.jobCount} offres</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}
