'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function saveJob(jobId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in to save jobs')
  }

  const existingSave = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId: session.user.id,
        jobId: jobId
      }
    }
  })

  if (existingSave) {
    await prisma.savedJob.delete({
      where: { id: existingSave.id }
    })
    revalidatePath('/jobs')
    revalidatePath('/dashboard')
    return { saved: false, message: 'Job removed from saved' }
  } else {
    await prisma.savedJob.create({
      data: {
        userId: session.user.id,
        jobId: jobId
      }
    })
    revalidatePath('/jobs')
    revalidatePath('/dashboard')
    return { saved: true, message: 'Job saved successfully' }
  }
}

export async function getSavedJobs(userId: string) {
  const savedJobs = await prisma.savedJob.findMany({
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
    }
  })

  return savedJobs
}

export async function createJob(data: {
  title: string
  description: string
  category: string
  location: string
  locationType: string
  employmentType: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  companyId: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can create jobs')
  }

  const job = await prisma.job.create({
    data: {
      ...data,
      requirements: data.requirements ? JSON.stringify(data.requirements) : null,
      responsibilities: data.responsibilities ? JSON.stringify(data.responsibilities) : null,
      benefits: data.benefits ? JSON.stringify(data.benefits) : null,
      status: 'DRAFT'
    }
  })

  revalidatePath('/employer/dashboard')
  return job
}

export async function updateJob(jobId: string, data: Partial<{
  title: string
  description: string
  category: string
  location: string
  locationType: string
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
}>) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can update jobs')
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true }
  })

  if (!job || job.company.employerId !== session.user.id) {
    throw new Error('Job not found or unauthorized')
  }

  const updateData: any = { ...data }
  if (data.requirements) {
    updateData.requirements = JSON.stringify(data.requirements)
  }
  if (data.responsibilities) {
    updateData.responsibilities = JSON.stringify(data.responsibilities)
  }
  if (data.benefits) {
    updateData.benefits = JSON.stringify(data.benefits)
  }

  const updatedJob = await prisma.job.update({
    where: { id: jobId },
    data: updateData
  })

  revalidatePath('/employer/dashboard')
  revalidatePath(`/jobs/${jobId}`)
  return updatedJob
}

export async function deleteJob(jobId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can delete jobs')
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true }
  })

  if (!job || job.company.employerId !== session.user.id) {
    throw new Error('Job not found or unauthorized')
  }

  await prisma.job.delete({
    where: { id: jobId }
  })

  revalidatePath('/employer/dashboard')
  return { success: true }
}
