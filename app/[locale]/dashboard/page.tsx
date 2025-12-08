import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

async function getDashboardData(userId: string) {
  const [applications, savedJobs, user] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    }),
    prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    }),
    prisma.user.findUnique({
      where: { id: userId }
    })
  ])

  const stats = {
    totalApplications: await prisma.application.count({ where: { candidateId: userId } }),
    pendingApplications: await prisma.application.count({ where: { candidateId: userId, status: 'PENDING' } }),
    savedJobs: await prisma.savedJob.count({ where: { userId } }),
  }

  return { applications, savedJobs, user, stats }
}

function calculateProfileCompletion(user: any) {
  const fields = [
    user.name,
    user.phone,
    user.location,
    user.bio,
    user.skills,
    user.experience,
    user.education,
    user.resume
  ]
  const filledFields = fields.filter(f => f && (typeof f === 'string' ? f.length > 0 : true)).length
  return Math.round((filledFields / fields.length) * 100)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role === 'EMPLOYER') {
    redirect('/')
  }

  const { applications, savedJobs, user, stats } = await getDashboardData(session.user.id)
  const profileCompletion = calculateProfileCompletion(user)

  return (
    <DashboardClient
      applications={applications}
      savedJobs={savedJobs}
      user={user}
      stats={stats}
      profileCompletion={profileCompletion}
    />
  )
}
