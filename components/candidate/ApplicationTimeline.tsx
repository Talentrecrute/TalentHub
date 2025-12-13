'use client'

import type { ApplicationEvent, ApplicationStatus } from '@prisma/client'
import { Check, Clock, Eye, Send, X } from 'lucide-react'
import { useLocale } from 'next-intl'

interface ApplicationTimelineProps {
  events: ApplicationEvent[]
  createdAt: Date
}

const statusConfig: Record<ApplicationStatus, { 
  icon: typeof Clock
  color: string
  bgColor: string
  label: { fr: string; en: string }
}> = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: { fr: 'En attente', en: 'Pending' }
  },
  REVIEWED: {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: { fr: 'Examinée', en: 'Reviewed' }
  },
  ACCEPTED: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: { fr: 'Acceptée', en: 'Accepted' }
  },
  REJECTED: {
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: { fr: 'Refusée', en: 'Rejected' }
  }
}

export default function ApplicationTimeline({ events, createdAt }: ApplicationTimelineProps) {
  const locale = useLocale() as 'fr' | 'en'

  // Create timeline items: first is always "Candidature envoyée", then events
  const timelineItems = [
    {
      id: 'created',
      status: 'CREATED' as const,
      note: null,
      createdAt: createdAt
    },
    ...events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  ]

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          const isCreated = item.status === 'CREATED'
          const config = isCreated 
            ? { icon: Send, color: 'text-teal-600', bgColor: 'bg-teal-100', label: { fr: 'Candidature envoyée', en: 'Application sent' } }
            : statusConfig[item.status as ApplicationStatus]
          
          const Icon = config.icon
          const isLast = index === timelineItems.length - 1

          return (
            <div key={item.id} className="relative flex items-start gap-4 pl-0">
              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${isLast ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${!isLast ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${config.color}`}>
                    {config.label[locale]}
                  </p>
                  <span className="text-xs text-slate-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.note && (
                  <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    💬 {item.note}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <p className="mt-4 text-sm text-slate-500 pl-12">
          {locale === 'fr' 
            ? 'Aucune mise à jour pour le moment. Vous serez notifié des changements.'
            : 'No updates yet. You will be notified of any changes.'}
        </p>
      )}
    </div>
  )
}
