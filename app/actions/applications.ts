'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function applyToJob(data: {
  jobId: string
  coverLetter?: string
  resume?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in to apply for jobs')
  }

  if (session.user.role === 'EMPLOYER') {
    throw new Error('Employers cannot apply to jobs')
  }

  // Check if already applied
  const existingApplication = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: data.jobId,
        candidateId: session.user.id
      }
    }
  })

  if (existingApplication) {
    throw new Error('You have already applied to this job')
  }

  const application = await prisma.application.create({
    data: {
      jobId: data.jobId,
      candidateId: session.user.id,
      coverLetter: data.coverLetter,
      resume: data.resume,
      status: 'PENDING'
    }
  })

  revalidatePath(`/jobs/${data.jobId}`)
  revalidatePath('/applications')
  revalidatePath('/dashboard')
  
  return application
}

export async function updateApplicationStatus(applicationId: string, status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can update application status')
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: true
        }
      }
    }
  })

  if (!application || application.job.company.employerId !== session.user.id) {
    throw new Error('Application not found or unauthorized')
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status }
  })

  revalidatePath('/employer/applications')
  revalidatePath('/employer/dashboard')
  
  return updated
}

export async function withdrawApplication(applicationId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in')
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId }
  })

  if (!application || application.candidateId !== session.user.id) {
    throw new Error('Application not found or unauthorized')
  }

  await prisma.application.delete({
    where: { id: applicationId }
  })

  revalidatePath('/applications')
  revalidatePath('/dashboard')
  
  return { success: true }
}
