import { prisma } from '@/lib/prisma'

import { NotificationType as PrismaNotificationType } from '@prisma/client'

export type NotificationType = 
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_STATUS'
  | 'NEW_MESSAGE'
  | 'JOB_ALERT'
  | 'PROFILE_VIEWED'
  | 'APPLICATION_REMINDER'

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
  let prismaType: PrismaNotificationType = 'INFO'

  switch (type) {
    case 'APPLICATION_RECEIVED':
      prismaType = 'SUCCESS'
      break
    case 'APPLICATION_REMINDER':
      prismaType = 'WARNING'
      break
    case 'APPLICATION_STATUS':
    case 'NEW_MESSAGE':
    case 'JOB_ALERT':
    case 'PROFILE_VIEWED':
    default:
      prismaType = 'INFO'
      break
  }

  return await prisma.notification.create({
    data: {
      userId,
      type: prismaType,
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
    REJECTED: 'Refusée',
    ARCHIVED: 'Archivée' // Should rarely happen for candidates, but good for completeness
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
