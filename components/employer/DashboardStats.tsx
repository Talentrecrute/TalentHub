'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
const STATUS_LABELS = {
  fr: ['En attente', 'Examinée', 'Acceptée', 'Refusée'],
  en: ['Pending', 'Reviewed', 'Accepted', 'Rejected']
}

export default function DashboardStats({ 
  applicationsByStatus, 
  applicationsByJob,
  weeklyApplications 
}: DashboardStatsProps) {
  const locale = useLocale() as 'fr' | 'en'

  const statusData = [
    { name: STATUS_LABELS[locale][0], value: applicationsByStatus.pending, color: '#f59e0b' },
    { name: STATUS_LABELS[locale][1], value: applicationsByStatus.reviewed, color: '#3b82f6' },
    { name: STATUS_LABELS[locale][2], value: applicationsByStatus.accepted, color: '#10b981' },
    { name: STATUS_LABELS[locale][3], value: applicationsByStatus.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const hasData = statusData.length > 0 || applicationsByJob.length > 0

  if (!hasData) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              {locale === 'fr' ? 'Candidatures par offre' : 'Applications by Job'}
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

      {/* Weekly Trend - Line/Area Chart */}
      {weeklyApplications.length > 0 && (
        <Card className="lg:col-span-2">
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
