'use server'

import { authOptions } from '@/lib/auth'
import { sendInterviewInvitation, sendRejectionEmail } from '@/lib/mail'
import { notifyNewApplication, notifyStatusChange } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(
  applicationId: string,
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED',
  note?: string
) {
  return updateApplicationDetails(applicationId, { status, note })
}

export async function rejectApplicationWithEmail(
  applicationId: string
) {
  // First update the status
  await updateApplicationDetails(applicationId, { 
    status: 'REJECTED',
    internalNotes: 'Refus : Email envoyé automatiquement.'
  })

  // Fetch application with all necessary details for the email
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: true,
      job: {
        select: { title: true }
      }
    }
  })

  if (!application) return null

  if (application.candidate.email) {
    try {
      await sendRejectionEmail(
        application.candidate.email,
        application.candidate.name || 'Candidate',
        application.job.title,
        'fr' // Default to FR for now as requested
      )
    } catch (e) {
      console.error('Failed to send rejection email', e)
    }
  }

  return application
}

export async function scheduleInterviewWithEmail(applicationId: string, bookingLink: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: true,
      job: true
    }
  })

  if (!application) throw new Error('Application not found')

  // Send Email
  await sendInterviewInvitation(
    application.candidate.email, 
    application.candidate.name, 
    application.job.title, 
    bookingLink,
    'fr' // Default to FR for now
  )

  // Update Status & Add Note
  // We use updateApplicationDetails to handle everything (status update + timeline event + notification)
  // However, we need to append to internal notes specifically about the invitation.
  
  const newNote = application.internalNotes 
    ? `${application.internalNotes}\n\n[System] Invitation entretien envoyée: ${bookingLink}` 
    : `[System] Invitation entretien envoyée: ${bookingLink}`

  await updateApplicationDetails(applicationId, {
    status: 'REVIEWED',
    internalNotes: newNote,
    note: `Interview invitation sent via email`
  })

  revalidatePath('/employer/dashboard')
  revalidatePath('/employer/applications')
}

export async function updateApplicationDetails(
  applicationId: string,
  data: {
    status?: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED'
    score?: number
    internalNotes?: string
    tags?: string[] // Application Tags
    note?: string // For backward compatibility / timeline events
  }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can update application details')
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

  // Check if status changed
  const statusChanged = data.status && application.status !== data.status

  // Prepare update data
  const updateData: any = {}
  if (data.status) updateData.status = data.status
  if (data.score !== undefined) updateData.score = data.score
  if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes
  if (data.tags !== undefined) updateData.tags = data.tags

  // Update application and create timeline event in a transaction
  const [updatedApplication] = await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: updateData
    }),
    ...(statusChanged ? [
      prisma.applicationEvent.create({
        data: {
          applicationId,
          status: data.status!,
          note: data.note || null
        }
      })
    ] : [])
  ])

  // Send notification to candidate if status changed
  if (statusChanged && data.status) {
    await notifyStatusChange(
      application.candidateId,
      application.job.title,
      data.status,
      application.job.id
    )
  }

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
