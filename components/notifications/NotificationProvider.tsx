'use client'

import { getUnreadNotifications, markAllAsRead, markAsRead } from '@/app/actions/notifications'
import { useSession } from 'next-auth/react'
import React, { createContext, useContext, useEffect, useState } from 'react'

export type Notification = {
    id: string
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
    read: boolean
    link?: string | null
    createdAt: Date
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    refreshNotifications: () => Promise<void>
    markRead: (id: string) => Promise<void>
    markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refreshNotifications = async () => {
        if (!session?.user) return
        try {
            const data = await getUnreadNotifications() // Helper action
            // @ts-ignore - Date serialization issue from server action
            setNotifications(data)
        } catch (error) {
            console.error("Failed to refresh notifications", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user) {
            refreshNotifications()
            // Poll every 30 seconds
            const interval = setInterval(refreshNotifications, 30000)
            return () => clearInterval(interval)
        } else {
            setNotifications([])
            setIsLoading(false)
        }
    }, [session])

    const markRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id))
        await markAsRead(id)
    }

    const markAllRead = async () => {
        setNotifications([])
        await markAllAsRead()
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount: notifications.length,
            isLoading,
            refreshNotifications,
            markRead,
            markAllRead
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
