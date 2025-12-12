'use client'

import { updateApplicationStatus } from '@/app/actions/applications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Application {
  id: string
  status: string
  createdAt: Date
  candidate: {
    id: string
    name: string | null
    email: string
  }
  job: {
    id: string
    title: string
  }
}

interface ApplicationKanbanProps {
  applications: Application[]
}

const COLUMNS = [
  { id: 'PENDING', color: 'bg-amber-500', lightColor: 'bg-amber-50 border-amber-200' },
  { id: 'REVIEWED', color: 'bg-blue-500', lightColor: 'bg-blue-50 border-blue-200' },
  { id: 'ACCEPTED', color: 'bg-green-500', lightColor: 'bg-green-50 border-green-200' },
  { id: 'REJECTED', color: 'bg-red-500', lightColor: 'bg-red-50 border-red-200' },
]

export default function ApplicationKanban({ applications: initialApplications }: ApplicationKanbanProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('status')
  const tApps = useTranslations('applications')
  
  const [applications, setApplications] = useState(initialApplications)
  const [movingId, setMovingId] = useState<string | null>(null)

  const columnLabels = {
    fr: { PENDING: 'En attente', REVIEWED: 'Entretien', ACCEPTED: 'Accepté', REJECTED: 'Refusé' },
    en: { PENDING: 'Pending', REVIEWED: 'Interview', ACCEPTED: 'Accepted', REJECTED: 'Rejected' }
  }

  const getColumnApplications = (status: string) => 
    applications.filter(app => app.status === status)

  const handleMoveToNext = async (app: Application) => {
    const statusOrder = ['PENDING', 'REVIEWED', 'ACCEPTED']
    const currentIndex = statusOrder.indexOf(app.status)
    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) return

    const newStatus = statusOrder[currentIndex + 1]
    setMovingId(app.id)
    
    try {
      // Optimistic update
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a)
      )

      await updateApplicationStatus(app.id, newStatus as any)
      toast.success(locale === 'fr' ? 'Statut mis à jour' : 'Status updated')
      router.refresh()
    } catch (error) {
      // Rollback on error
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: app.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Failed to update')
    } finally {
      setMovingId(null)
    }
  }

  const handleReject = async (app: Application) => {
    setMovingId(app.id)
    
    try {
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: 'REJECTED' } : a)
      )

      await updateApplicationStatus(app.id, 'REJECTED')
      toast.success(locale === 'fr' ? 'Candidature refusée' : 'Application rejected')
      router.refresh()
    } catch (error) {
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: app.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        {locale === 'fr' ? 'Pipeline de recrutement' : 'Recruitment Pipeline'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className={`flex items-center gap-2 p-3 rounded-t-lg ${column.lightColor} border-b-2`}>
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <span className="font-semibold text-slate-700">
                {columnLabels[locale as 'fr' | 'en'][column.id as keyof typeof columnLabels['fr']]}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {getColumnApplications(column.id).length}
              </Badge>
            </div>

            {/* Column Content */}
            <div className={`flex-1 min-h-[300px] p-2 ${column.lightColor} rounded-b-lg border border-t-0 space-y-2`}>
              {getColumnApplications(column.id).map(app => (
                <Card 
                  key={app.id} 
                  className={`bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    movingId === app.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {app.candidate.name?.[0]?.toUpperCase() || app.candidate.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {app.candidate.name || app.candidate.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {app.job.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      <div className="flex gap-1">
                        {/* Move to next stage (only for PENDING and REVIEWED) */}
                        {(column.id === 'PENDING' || column.id === 'REVIEWED') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMoveToNext(app)
                            }}
                            disabled={movingId === app.id}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Reject button (for PENDING and REVIEWED) */}
                        {(column.id === 'PENDING' || column.id === 'REVIEWED') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(app)
                            }}
                            disabled={movingId === app.id}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getColumnApplications(column.id).length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-slate-400">
                  {locale === 'fr' ? 'Aucune candidature' : 'No applications'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
