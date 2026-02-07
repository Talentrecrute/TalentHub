'use server'

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: NotificationType = 'INFO',
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        read: false
      }
    })
    
    // We don't revalidate path here because this is usually called from another action
    // that will handle revalidation, or it's a background process.
    // However, if we want real-time updates without refresh, we rely on the client polling or websockets.
    // For this MVP, we rely on the user refreshing or navigating.
    // Actually, we can trigger revalidation of the layout if we knew where the bell is.
    
    return { success: true }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

export async function getUnreadNotifications() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to last 10 unread for the dropdown
    })
    return notifications
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return []
  }
}

export async function getAllNotifications() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })
    return notifications
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return []
  }
}

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false }

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id // Ensure ownership
      },
      data: {
        read: true
      }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return { success: false, error: "Failed to mark as read" }
  }
}

export async function markAllAsRead() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false }
  
    try {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      })
      revalidatePath('/')
      return { success: true }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      return { success: false, error: "Failed to mark all as read" }
    }
  }
