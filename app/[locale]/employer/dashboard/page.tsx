import DangerZone from '@/components/account/DangerZone'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Building2 } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import EmployerDashboardClient from './EmployerDashboardClient'

async function getEmployerData(userId: string) {
  const company = await prisma.company.findFirst({
    where: { employerId: userId }
  })

  if (!company) {
    return null
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // All applications for Kanban and stats
  const allApplications = await prisma.application.findMany({
    where: {
      job: {
        companyId: company.id
      }
    },
    include: {
      job: true,
      candidate: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Stats
  const stats = {
    totalJobs: await prisma.job.count({ where: { companyId: company.id } }),
    openJobs: await prisma.job.count({ where: { companyId: company.id, status: 'OPEN' } }),
    totalApplications: allApplications.length,
    pendingApplications: allApplications.filter(a => a.status === 'PENDING').length
  }

  // Applications by status for pie chart
  const applicationsByStatus = {
    pending: allApplications.filter(a => a.status === 'PENDING').length,
    reviewed: allApplications.filter(a => a.status === 'REVIEWED').length,
    accepted: allApplications.filter(a => a.status === 'ACCEPTED').length,
    rejected: allApplications.filter(a => a.status === 'REJECTED').length,
  }

  // Applications by job for bar chart
  const jobApplicationCounts = jobs.map(job => ({
    jobTitle: job.title,
    count: job._count.applications
  })).filter(j => j.count > 0).sort((a, b) => b.count - a.count)

  // Weekly applications trend
  const now = new Date()
  const weeklyApplications = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const count = allApplications.filter(a => {
      const appDate = new Date(a.createdAt)
      return appDate >= dayStart && appDate <= dayEnd
    }).length

    weeklyApplications.push({
      day: dayStart.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count
    })
  }

  return { 
    company, 
    jobs, 
    allApplications,
    stats,
    applicationsByStatus,
    applicationsByJob: jobApplicationCounts,
    weeklyApplications
  }
}

export default async function EmployerDashboardPage() {
  const session = await getServerSession(authOptions)
  const tEmployer = await getTranslations('employer')
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  const data = await getEmployerData(session.user.id)

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{tEmployer('noCompany')}</h2>
            <p className="text-slate-600 mb-6">
              {tEmployer('createCompanyFirst')}
            </p>
            <Link href="/employer/create-company">
              <Button className="bg-teal-600 hover:bg-teal-700">
                {tEmployer('createCompany')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <EmployerDashboardClient
        company={data.company}
        jobs={data.jobs}
        allApplications={data.allApplications.map(app => ({ ...app, tags: [] }))}
        stats={data.stats}
        applicationsByStatus={data.applicationsByStatus}
        applicationsByJob={data.applicationsByJob}
        weeklyApplications={data.weeklyApplications}
      />
      
      {/* Danger Zone - Account Deletion */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DangerZone userRole="EMPLOYER" />
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}
