'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, Clock, Target, TrendingUp, Users } from 'lucide-react'
import { useLocale } from 'next-intl'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts'

interface DashboardStatsProps {
  applicationsByStatus: {
    pending: number
    reviewed: number
    accepted: number
    rejected: number
  }
  applicationsByJob: {
    jobTitle: string
    count: number
  }[]
  weeklyApplications: {
    day: string
    count: number
  }[]
  totalJobs?: number
  openJobs?: number
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
const STATUS_LABELS = {
  fr: ['En attente', 'Examinée', 'Acceptée', 'Refusée'],
  en: ['Pending', 'Reviewed', 'Accepted', 'Rejected']
}

export default function DashboardStats({ 
  applicationsByStatus, 
  applicationsByJob,
  weeklyApplications,
  totalJobs = 0,
  openJobs = 0
}: DashboardStatsProps) {
  const locale = useLocale() as 'fr' | 'en'

  const statusData = [
    { name: STATUS_LABELS[locale][0], value: applicationsByStatus.pending, color: '#f59e0b' },
    { name: STATUS_LABELS[locale][1], value: applicationsByStatus.reviewed, color: '#3b82f6' },
    { name: STATUS_LABELS[locale][2], value: applicationsByStatus.accepted, color: '#10b981' },
    { name: STATUS_LABELS[locale][3], value: applicationsByStatus.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const hasData = statusData.length > 0 || applicationsByJob.length > 0

  // Calculate advanced metrics
  const totalApplications = applicationsByStatus.pending + applicationsByStatus.reviewed + 
                           applicationsByStatus.accepted + applicationsByStatus.rejected
  
  const acceptanceRate = totalApplications > 0 
    ? ((applicationsByStatus.accepted / totalApplications) * 100).toFixed(1)
    : '0'
  
  const processedRate = totalApplications > 0 
    ? (((totalApplications - applicationsByStatus.pending) / totalApplications) * 100).toFixed(0)
    : '0'

  const avgApplicationsPerJob = totalJobs > 0 
    ? (totalApplications / totalJobs).toFixed(1)
    : '0'

  // Calculate week-over-week change
  const thisWeekTotal = weeklyApplications.slice(-7).reduce((a, b) => a + b.count, 0)
  const lastWeekTotal = weeklyApplications.slice(0, 7).reduce((a, b) => a + b.count, 0) || thisWeekTotal
  const weekChange = lastWeekTotal > 0 
    ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(0)
    : '0'
  const isPositiveChange = parseInt(weekChange) >= 0

  if (!hasData && totalApplications === 0) {
    return null
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Advanced Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Conversion Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  {locale === 'fr' ? 'Taux d\'acceptation' : 'Acceptance Rate'}
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">{acceptanceRate}%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Rate */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {locale === 'fr' ? 'Taux de traitement' : 'Processing Rate'}
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{processedRate}%</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Applications per Job */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                  {locale === 'fr' ? 'Moy. / offre' : 'Avg / Job'}
                </p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{avgApplicationsPerJob}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week over Week Change */}
        <Card className={`bg-gradient-to-br ${isPositiveChange ? 'from-teal-50 to-cyan-50 border-teal-200' : 'from-orange-50 to-red-50 border-orange-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${isPositiveChange ? 'text-teal-600' : 'text-orange-600'}`}>
                  {locale === 'fr' ? 'Évolution / sem.' : 'Week Change'}
                </p>
                <p className={`text-2xl font-bold mt-1 flex items-center gap-1 ${isPositiveChange ? 'text-teal-700' : 'text-orange-700'}`}>
                  {isPositiveChange ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  {Math.abs(parseInt(weekChange))}%
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositiveChange ? 'bg-teal-100' : 'bg-orange-100'}`}>
                <TrendingUp className={`w-5 h-5 ${isPositiveChange ? 'text-teal-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status - Pie Chart */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === 'fr' ? 'Candidatures par statut' : 'Applications by Status'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, locale === 'fr' ? 'Candidatures' : 'Applications']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications by Job - Bar Chart */}
        {applicationsByJob.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === 'fr' ? 'Top 5 offres' : 'Top 5 Jobs'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={applicationsByJob.slice(0, 5)} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="jobTitle" 
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value, locale === 'fr' ? 'Candidatures' : 'Applications']}
                    />
                    <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Trend - Full Width */}
      {weeklyApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'fr' ? 'Tendance des 7 derniers jours' : 'Last 7 Days Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyApplications}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value: number) => [value, locale === 'fr' ? 'Candidatures' : 'Applications']}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
