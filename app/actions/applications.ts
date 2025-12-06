'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(
  applicationId: string,
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
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

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: { status }
  })

  revalidatePath('/employer/applications')
  revalidatePath(`/employer/applications/${applicationId}`)
  revalidatePath('/employer/dashboard')
  
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

  // Get user's resume
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { resume: true }
  })

  const application = await prisma.application.create({
    data: {
      jobId: data.jobId,
      candidateId: session.user.id,
      coverLetter: data.coverLetter,
      resume: user?.resume,
      status: 'PENDING'
    }
  })

  revalidatePath('/applications')
  revalidatePath(`/jobs/${data.jobId}`)
  
  return application
}
