import { prisma } from '@/lib/prisma'

export type NotificationType = 
  | 'APPLICATION_RECEIVED'    // Employer: new application
  | 'APPLICATION_STATUS'      // Candidate: status changed
  | 'NEW_MESSAGE'             // Both: new message
  | 'JOB_ALERT'               // Candidate: matching job
  | 'PROFILE_VIEWED'          // Candidate: employer viewed profile
  | 'APPLICATION_REMINDER'    // Employer: pending applications

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: CreateNotificationParams) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link
    }
  })
}

// Notify employer when a candidate applies
export async function notifyNewApplication(
  employerId: string,
  candidateName: string,
  jobTitle: string,
  applicationId: string
) {
  return await createNotification({
    userId: employerId,
    type: 'APPLICATION_RECEIVED',
    title: 'Nouvelle candidature',
    message: `${candidateName} a postulé pour "${jobTitle}"`,
    link: `/employer/applications/${applicationId}`
  })
}

// Notify candidate when their application status changes
export async function notifyStatusChange(
  candidateId: string,
  jobTitle: string,
  newStatus: string,
  jobId: string
) {
  const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    REVIEWED: 'Vue par l\'employeur',
    ACCEPTED: 'Acceptée',
    REJECTED: 'Refusée'
  }

  return await createNotification({
    userId: candidateId,
    type: 'APPLICATION_STATUS',
    title: 'Mise à jour de candidature',
    message: `Votre candidature pour "${jobTitle}" est maintenant: ${statusLabels[newStatus] || newStatus}`,
    link: `/applications`
  })
}

// Notify when new message received
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  conversationId: string
) {
  return await createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'Nouveau message',
    message: `${senderName} vous a envoyé un message`,
    link: `/messages/${conversationId}`
  })
}
