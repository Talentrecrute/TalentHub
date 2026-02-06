'use client'

import { Button } from "@/components/ui/button"
import type { Notification } from '@prisma/client'
import { Bell, Check, CheckCheck, ExternalLink, MessageSquare, Trash2, UserCheck, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function NotificationBell() {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] })
      })
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      const wasUnread = notifications.find(n => n.id === id && !n.isRead)
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return <UserCheck className="w-4 h-4 text-teal-500" />
      case 'APPLICATION_STATUS':
        return <Check className="w-4 h-4 text-blue-500" />
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-slate-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return locale === 'fr' ? 'À l\'instant' : 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}j`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              {locale === 'fr' ? 'Notifications' : 'Notifications'}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  {locale === 'fr' ? 'Tout lire' : 'Mark all read'}
                </Button>
              )}
              <button onClick={() => setIsOpen(false)} aria-label={locale === 'fr' ? "Fermer les notifications" : "Close notifications"}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  {locale === 'fr' ? 'Aucune notification' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      !notif.isRead ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatTime(notif.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {notif.link && (
                          <Link href={notif.link} onClick={() => markAsRead(notif.id)}>
                            <button className="p-1 text-slate-400 hover:text-teal-600" aria-label={locale === 'fr' ? "Ouvrir le lien" : "Open link"}>
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 text-slate-400 hover:text-teal-600"
                            aria-label={locale === 'fr' ? "Marquer comme lu" : "Mark as read"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                          aria-label={locale === 'fr' ? "Supprimer la notification" : "Delete notification"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button
                onClick={markAllAsRead}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {locale === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
