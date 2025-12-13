'use server'

import { authOptions } from '@/lib/auth'
import { notifyNewApplication, notifyStatusChange } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(
  applicationId: string,
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED',
  note?: string
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can update application status')
  }

  // Get the application with job and company
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

  if (!application) {
    throw new Error('Application not found')
  }

  // Verify that the employer owns the job
  if (application.job.company.employerId !== session.user.id) {
    throw new Error('Unauthorized to update this application')
  }

  // Only create event if status actually changed
  const statusChanged = application.status !== status

  // Update application and create timeline event in a transaction
  const [updatedApplication] = await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status }
    }),
    ...(statusChanged ? [
      prisma.applicationEvent.create({
        data: {
          applicationId,
          status,
          note: note || null
        }
      })
    ] : [])
  ])

  // Send notification to candidate if status changed
  if (statusChanged) {
    await notifyStatusChange(
      application.candidateId,
      application.job.title,
      status,
      application.job.id
    )
  }

  revalidatePath('/employer/applications')
  revalidatePath(`/employer/applications/${applicationId}`)
  revalidatePath('/employer/dashboard')
  revalidatePath('/candidate/dashboard')
  revalidatePath('/candidate/applications')
  
  return updatedApplication
}

export async function getApplicationDetails(applicationId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can view application details')
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: true
        }
      },
      candidate: true
    }
  })

  if (!application) {
    throw new Error('Application not found')
  }

  // Verify that the employer owns the job
  if (application.job.company.employerId !== session.user.id) {
    throw new Error('Unauthorized to view this application')
  }

  return application
}

export async function applyToJob(data: {
  jobId: string
  coverLetter?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in to apply for jobs')
  }

  if (session.user.role === 'EMPLOYER') {
    throw new Error('Employers cannot apply for jobs')
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
    throw new Error('You have already applied for this job')
  }

  // Get user's resume and name
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { resume: true, name: true }
  })

  // Get job with company to find employer
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    include: {
      company: true
    }
  })

  if (!job) {
    throw new Error('Job not found')
  }

  const application = await prisma.application.create({
    data: {
      jobId: data.jobId,
      candidateId: session.user.id,
      coverLetter: data.coverLetter,
      resume: user?.resume,
      status: 'PENDING'
    }
  })

  // Notify employer of new application
  await notifyNewApplication(
    job.company.employerId,
    user?.name || 'Un candidat',
    job.title,
    application.id
  )

  revalidatePath('/applications')
  revalidatePath(`/jobs/${data.jobId}`)
  
  return application
}
