import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Calendar, CreditCard, Users } from "lucide-react"
import { useTranslations } from "next-intl"

interface HRStatsOverviewProps {
    stats: {
        totalEmployees: number
        totalPayroll: number
        currency: string
        pendingLeaves: number
        openJobs: number
    }
}

export function HRStatsOverview({ stats }: HRStatsOverviewProps) {
    const t = useTranslations('analytics')
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('totalEmployees')}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('totalEmployeesDesc')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('activePayroll')}
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: stats.currency }).format(stats.totalPayroll)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('activePayrollDesc')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('pendingLeaves')}
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('pendingLeavesDesc')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('openJobs')}
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.openJobs}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('openJobsDesc')}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
