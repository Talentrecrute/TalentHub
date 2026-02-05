import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Target, Timer, Users } from 'lucide-react'
import { useLocale } from 'next-intl'
import {
    Bar,
    BarChart,
    CartesianGrid,
    FunnelChart,
    LabelList,
    Funnel as RechartsFunnel,
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
  avgTimeToHire?: number
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
const FUNNEL_COLORS = ['#8884d8', '#83a6ed', '#82ca9d']
const STATUS_LABELS = {
  fr: ['En attente', 'Examinée', 'Acceptée', 'Refusée'],
  en: ['Pending', 'Reviewed', 'Accepted', 'Rejected']
}

export default function DashboardStats({ 
  applicationsByStatus, 
  applicationsByJob,
  weeklyApplications,
  totalJobs = 0,
  openJobs = 0,
  avgTimeToHire = 0
}: DashboardStatsProps) {
  const locale = useLocale() as 'fr' | 'en'

  const statusData = [
    { name: STATUS_LABELS[locale][0], value: applicationsByStatus.pending, color: '#f59e0b' },
    { name: STATUS_LABELS[locale][1], value: applicationsByStatus.reviewed, color: '#3b82f6' },
    { name: STATUS_LABELS[locale][2], value: applicationsByStatus.accepted, color: '#10b981' },
    { name: STATUS_LABELS[locale][3], value: applicationsByStatus.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Funnel Data Construction
  const totalApps = applicationsByStatus.pending + applicationsByStatus.reviewed + 
                   applicationsByStatus.accepted + applicationsByStatus.rejected
  
  const funnelData = [
    { 
      value: totalApps, 
      name: locale === 'fr' ? 'Candidatures' : 'Applied', 
      fill: FUNNEL_COLORS[0] 
    },
    { 
      value: applicationsByStatus.reviewed + applicationsByStatus.accepted, 
      name: locale === 'fr' ? 'Entretiens' : 'Interviews', 
      fill: FUNNEL_COLORS[1] 
    },
    { 
      value: applicationsByStatus.accepted, 
      name: locale === 'fr' ? 'Embauches' : 'Hired', 
      fill: FUNNEL_COLORS[2] 
    }
  ]

  const hasData = statusData.length > 0 || applicationsByJob.length > 0

  // Calculate advanced metrics
  const acceptanceRate = totalApps > 0 
    ? ((applicationsByStatus.accepted / totalApps) * 100).toFixed(1)
    : '0'
  
  const processedRate = totalApps > 0 
    ? (((totalApps - applicationsByStatus.pending) / totalApps) * 100).toFixed(0)
    : '0'

  const avgApplicationsPerJob = totalJobs > 0 
    ? (totalApps / totalJobs).toFixed(1)
    : '0'

  if (!hasData && totalApps === 0) {
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

        {/* Time to Hire */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {locale === 'fr' ? 'Temps moyen' : 'Time to Hire'}
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {avgTimeToHire} <span className="text-sm font-normal">{locale === 'fr' ? 'jours' : 'days'}</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-blue-600" />
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

        {/* Processing Rate */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  {locale === 'fr' ? 'Traitement' : 'Processing'}
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{processedRate}%</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recruitment Funnel */}
         <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === 'fr' ? 'Entonnoir de recrutement' : 'Recruitment Funnel'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <RechartsFunnel
                      data={funnelData}
                      dataKey="value"
                    >
                      <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    </RechartsFunnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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
