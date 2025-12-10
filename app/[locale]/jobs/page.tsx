import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { Toaster } from 'sonner'
import JobsClient from './JobsClient'

async function getJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: 'OPEN' },
    include: {
      company: true,
      _count: {
        select: { applications: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  })
  
  return jobs
}

async function getSavedJobIds(userId: string) {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    select: { jobId: true }
  })
  
  return savedJobs.map(sj => sj.jobId)
}

export default async function JobsPage() {
  const session = await getServerSession(authOptions)
  const jobs = await getJobs()
  const savedJobIds = session?.user?.id ? await getSavedJobIds(session.user.id) : []

  return (
    <>
      <JobsClient 
        initialJobs={jobs}
        savedJobIds={savedJobIds}
        userId={session?.user?.id}
      />
      <Toaster position="top-right" />
    </>
  )
}
