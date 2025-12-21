'use client'

import { Link } from '@/i18n/routing'
import { BookOpen, Briefcase, FileText, TrendingUp, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Stats {
  totalJobs: number
  totalUsers: number
  totalApplications: number
  totalBlogPosts: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { icon: Briefcase, label: 'Offres d\'emploi', value: stats?.totalJobs || 0, href: '/admin/jobs', color: 'bg-blue-500' },
    { icon: Users, label: 'Utilisateurs', value: stats?.totalUsers || 0, href: '/admin/users', color: 'bg-green-500' },
    { icon: FileText, label: 'Candidatures', value: stats?.totalApplications || 0, href: '/admin/applications', color: 'bg-purple-500' },
    { icon: BookOpen, label: 'Articles', value: stats?.totalBlogPosts || 0, href: '/admin/blog', color: 'bg-teal-500' },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600">Bienvenue, {session?.user?.name || 'Admin'} 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-3 p-4 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Nouvel article</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Gérer utilisateurs</span>
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Voir les offres</span>
          </Link>
          <Link
            href="/admin/stats"
            className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Statistiques</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
