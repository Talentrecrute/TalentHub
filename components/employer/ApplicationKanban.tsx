'use client'

import { rejectApplicationWithEmail, scheduleInterviewWithEmail, updateApplicationDetails } from '@/app/actions/applications'
import StartConversationButton from '@/components/messaging/StartConversationButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, Eye, Filter, FolderDown, LayoutGrid, List, Plus, Search, Star, StickyNote, Trash2, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface Application {
  id: string
  status: string
  score: number | null
  internalNotes: string | null
  coverLetter: string | null
  resume: string | null
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
  tags: string[]
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

function KanbanCard({ 
  app, 
  column, 
  onMove, 
  onReject, 
  onView,
  onArchive,
  onUpdate,
  isMoving 
}: { 
  app: Application
  column: typeof COLUMNS[0]
  onMove: (app: Application) => void
  onReject: (app: Application) => void
  onView: (app: Application) => void
  onArchive: (app: Application) => void
  onUpdate: (app: Application, data: Partial<Application>) => void
  isMoving: boolean
}) {
  const locale = useLocale()
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState(app.internalNotes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const handleScore = async (newScore: number) => {
    onUpdate(app, { score: newScore })
    try {
      await updateApplicationDetails(app.id, { score: newScore })
    } catch (error) {
      toast.error('Failed to update score')
      onUpdate(app, { score: app.score })
    }
  }

  const saveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await updateApplicationDetails(app.id, { internalNotes: notes })
      onUpdate(app, { internalNotes: notes })
      setIsNotesOpen(false)
      toast.success(locale === 'fr' ? 'Note enregistrée' : 'Note saved')
    } catch (error) {
      toast.error('Failed to save note')
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <Card 
      className={`bg-white shadow-sm hover:shadow-md transition-all ${
        isMoving ? 'opacity-50 scale-95' : ''
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

        <div className="flex items-center justify-between mb-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation()
                  handleScore(star)
                }}
                className={`focus:outline-none transition-transform hover:scale-110 ${
                  (app.score || 0) >= star ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${(app.score || 0) >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsNotesOpen(!isNotesOpen)
            }}
            className={`p-1 rounded-md transition-colors ${
              app.internalNotes 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
        </div>

        {isNotesOpen && (
          <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={locale === 'fr' ? "Note interne..." : "Internal note..."}
              className="text-xs min-h-[60px] mb-2"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsNotesOpen(false)
                }}
              >
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                size="sm" 
                className="h-6 text-xs bg-teal-600 hover:bg-teal-700"
                onClick={(e) => {
                  e.stopPropagation()
                  saveNotes()
                }}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? '...' : (locale === 'fr' ? 'Sauver' : 'Save')}
              </Button>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="flex flex-wrap gap-1 mb-3">
          {app.tags?.map((tag, i) => (
             <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors"
                onClick={async (e) => {
                  e.stopPropagation()
                  const newTags = app.tags.filter(t => t !== tag)
                  onUpdate(app, { tags: newTags })
                  try {
                    await updateApplicationDetails(app.id, { tags: newTags })
                  } catch {
                     toast.error('Failed to remove tag')
                     onUpdate(app, { tags: app.tags })
                  }
                }}
                title={locale === 'fr' ? "Cliquer pour supprimer" : "Click to remove"}
             >
                {tag}
             </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-teal-600 hover:border-teal-600"
            onClick={(e) => {
               e.stopPropagation()
               const tag = prompt(locale === 'fr' ? "Nouveau tag :" : "New tag:")
               if (tag && tag.trim()) {
                 const newTags = [...(app.tags || []), tag.trim()]
                 onUpdate(app, { tags: newTags })
                 updateApplicationDetails(app.id, { tags: newTags }).catch(() => {
                    toast.error('Failed to add tag')
                    onUpdate(app, { tags: app.tags })
                 })
               }
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
          <span className="text-[10px] text-slate-400">
            {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>

          <div className="flex gap-1">
             <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation()
                onView(app)
              }}
              title={locale === 'fr' ? "Voir détails" : "View details"}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={(e) => {
                e.stopPropagation()
                onArchive(app)
              }}
              title={locale === 'fr' ? "Archiver dans le vivier" : "Archive to Talent Pool"}
            >
              <FolderDown className="w-4 h-4" />
            </Button>

            <StartConversationButton
              receiverId={app.candidate.id}
              applicationId={app.id}
              jobId={app.job.id}
              variant="ghost"
              size="sm"
            />

            {(column.id === 'PENDING' || column.id === 'REVIEWED') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove(app)
                  }}
                  disabled={isMoving}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReject(app)
                  }}
                  disabled={isMoving}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ApplicationKanban({ applications: initialApplications }: ApplicationKanbanProps) {
  const locale = useLocale()
  const router = useRouter()
  
  const [applications, setApplications] = useState(initialApplications)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [rejectionApp, setRejectionApp] = useState<Application | null>(null)
  const [viewApp, setViewApp] = useState<Application | null>(null)
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null)
  const [bookingLink, setBookingLink] = useState('')
  const [isProcessingRejection, setIsProcessingRejection] = useState(false)
  const [isProcessingSchedule, setIsProcessingSchedule] = useState(false)
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('')
  const [minScore, setMinScore] = useState<number>(0)
  const [selectedTag, setSelectedTag] = useState<string>('') 
  
  // View & Selection State
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const columnLabels = {
    fr: { PENDING: 'En attente', REVIEWED: 'Entretien', ACCEPTED: 'Accepté', REJECTED: 'Refusé', ARCHIVED: 'Archivé' },
    en: { PENDING: 'Pending', REVIEWED: 'Interview', ACCEPTED: 'Accepted', REJECTED: 'Rejected', ARCHIVED: 'Archived' }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(applications.flatMap(app => app.tags || []))).sort()

  // Filter Logic
  const filteredApplications = applications.filter(app => {
    // 1. Search Filter (Name, Email, Job Title)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      !searchQuery ||
      app.candidate.name?.toLowerCase().includes(searchLower) ||
      app.candidate.email.toLowerCase().includes(searchLower) ||
      app.job.title.toLowerCase().includes(searchLower)

    // 2. Score Filter
    const matchesScore = (app.score || 0) >= minScore

    // 3. Tag Filter
    const matchesTag = !selectedTag || (app.tags || []).includes(selectedTag)

    return matchesSearch && matchesScore && matchesTag
  })

  const getColumnApplications = (status: string) => 
    filteredApplications.filter(app => app.status === status)

  const handleUpdateApplication = (app: Application, data: Partial<Application>) => {
    setApplications(prev => 
      prev.map(a => a.id === app.id ? { ...a, ...data } : a)
    )
  }

  const handleMoveToNext = async (app: Application) => {
    const statusOrder = ['PENDING', 'REVIEWED', 'ACCEPTED']
    const currentIndex = statusOrder.indexOf(app.status)
    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) return

    const newStatus = statusOrder[currentIndex + 1]

    // Intercept if moving to REVIEWED (Interview)
    if (newStatus === 'REVIEWED') {
      setSchedulingApp(app)
      return
    }

    setMovingId(app.id)
    
    try {
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a)
      )

      await updateApplicationDetails(app.id, { status: newStatus as any })
      toast.success(locale === 'fr' ? 'Statut mis à jour' : 'Status updated')
      router.refresh()
    } catch (error) {
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: app.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Failed to update')
    } finally {
      setMovingId(null)
    }
  }

  const handleRejectClick = (app: Application) => {
    setRejectionApp(app)
  }

  const handleArchive = async (app: Application) => {
    setMovingId(app.id)
    try {
      // Optimistic update - app will disappear from filtered list because status becomes ARCHIVED
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: 'ARCHIVED' } : a)
      )

      await updateApplicationDetails(app.id, { status: 'ARCHIVED' as any })
      toast.success(locale === 'fr' ? 'Candidat archivé dans le vivier' : 'Candidate archived to talent pool')
      router.refresh()
    } catch (error) {
      // Rollback
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: app.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur lors de l\'archivage' : 'Error archiving')
    } finally {
      setMovingId(null)
    }
  }

  const confirmReject = async (withEmail: boolean) => {
    if (!rejectionApp) return
    
    setIsProcessingRejection(true)
    setMovingId(rejectionApp.id)
    
    try {
      setApplications(prev => 
        prev.map(a => a.id === rejectionApp.id ? { ...a, status: 'REJECTED' } : a)
      )

      if (withEmail) {
        await rejectApplicationWithEmail(rejectionApp.id)
        toast.success(locale === 'fr' ? 'Refusé et email envoyé' : 'Rejected and email sent')
      } else {
        await updateApplicationDetails(rejectionApp.id, { status: 'REJECTED' })
        toast.success(locale === 'fr' ? 'Candidature refusée' : 'Application rejected')
      }
      
      router.refresh()
    } catch (error) {
      setApplications(prev => 
        prev.map(a => a.id === rejectionApp.id ? { ...a, status: rejectionApp.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
    } finally {
      setIsProcessingRejection(false)
      setMovingId(null)
      setRejectionApp(null)
    }
  }

  const confirmSchedule = async (withEmail: boolean) => {
    if (!schedulingApp) return
    
    setIsProcessingSchedule(true)
    setMovingId(schedulingApp.id)

    try {
      setApplications(prev => 
        prev.map(a => a.id === schedulingApp.id ? { ...a, status: 'REVIEWED' } : a)
      )

      if (withEmail && bookingLink) {
        await scheduleInterviewWithEmail(schedulingApp.id, bookingLink)
        toast.success(locale === 'fr' ? 'Invitation envoyée' : 'Invitation sent')
      } else {
        await updateApplicationDetails(schedulingApp.id, { status: 'REVIEWED' })
        toast.success(locale === 'fr' ? 'Déplacé en entretien' : 'Moved to interview')
      }
      router.refresh()
    } catch (error) {
      setApplications(prev => 
        prev.map(a => a.id === schedulingApp.id ? { ...a, status: schedulingApp.status } : a)
      )
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
      setBookingLink('')
    }
  }

  // Bulk Actions
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredApplications.map(app => app.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkArchive = async () => {
    if (!confirm(locale === 'fr' ? 'Archiver la sélection ?' : 'Archive selected?')) return
    
    const ids = Array.from(selectedIds)
    try {
      // Optimistic update
      setApplications(prev => prev.map(app => ids.includes(app.id) ? { ...app, status: 'ARCHIVED' } : app))
      setSelectedIds(new Set())
      
      // Execute sequentially to avoid payload limits/race conditions (or use a bulk action)
      await Promise.all(ids.map(id => updateApplicationDetails(id, { status: 'ARCHIVED' })))
      
      toast.success(locale === 'fr' ? `${ids.length} archivés` : `${ids.length} archived`)
      router.refresh()
    } catch {
      toast.error('Error executing bulk action')
      router.refresh() 
    }
  }
  
  const handleBulkReject = async () => {
    if (!confirm(locale === 'fr' ? 'Refuser la sélection (sans email) ?' : 'Reject selected (no email)?')) return
     
    const ids = Array.from(selectedIds)
    try {
      setApplications(prev => prev.map(app => ids.includes(app.id) ? { ...app, status: 'REJECTED' } : app))
      setSelectedIds(new Set())
      
      await Promise.all(ids.map(id => updateApplicationDetails(id, { status: 'REJECTED' })))
      
      toast.success(locale === 'fr' ? `${ids.length} refusés` : `${ids.length} rejected`)
      router.refresh()
    } catch {
      toast.error('Error executing bulk action')
      router.refresh()
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {locale === 'fr' ? 'Pipeline de recrutement' : 'Recruitment Pipeline'}
        </h2>
        
        {/* Filtering Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder={locale === 'fr' ? "Rechercher un candidat..." : "Search candidates..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px] bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 border border-slate-200 rounded-md h-10">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value={0}>{locale === 'fr' ? 'Tous les scores' : 'All scores'}</option>
              <option value={3}>{locale === 'fr' ? '3+ Étoiles' : '3+ Stars'}</option>
              <option value={4}>{locale === 'fr' ? '4+ Étoiles' : '4+ Stars'}</option>
              <option value={5}>{locale === 'fr' ? '5 Étoiles uniquement' : '5 Stars only'}</option>
            </select>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 border border-slate-200 rounded-md h-10">
              <span className="text-slate-500 text-xs font-medium">#</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-sm focus:outline-none text-slate-700 cursor-pointer min-w-[100px]"
              >
                <option value="">{locale === 'fr' ? 'Tous les tags' : 'All tags'}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
          
          {(searchQuery || minScore > 0 || selectedTag) && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearchQuery(''); setMinScore(0); setSelectedTag('') }}
              className="text-slate-500"
            >
              {locale === 'fr' ? 'Réinitialiser' : 'Reset'}
            </Button>
          )}
          
          {(searchQuery || minScore > 0 || selectedTag) && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearchQuery(''); setMinScore(0); setSelectedTag('') }}
              className="text-slate-500"
            >
              {locale === 'fr' ? 'Réinitialiser' : 'Reset'}
            </Button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-2" />

          {/* View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded ${viewMode === 'board' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold px-2 border-r border-slate-700">
              {selectedIds.size} {locale === 'fr' ? 'sélectionné(s)' : 'selected'}
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-slate-800 hover:text-white h-8"
              onClick={handleBulkArchive}
            >
              <FolderDown className="w-4 h-4 mr-2" />
              {locale === 'fr' ? 'Archiver' : 'Archive'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-red-900/50 hover:text-red-200 h-8"
              onClick={handleBulkReject}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {locale === 'fr' ? 'Refuser' : 'Reject'}
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400 hover:text-white h-8"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={`flex items-center gap-2 p-3 rounded-t-lg ${column.lightColor} border-b-2`}>
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <span className="font-semibold text-slate-700">
                  {columnLabels[locale as 'fr' | 'en'][column.id as keyof typeof columnLabels['fr']]}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {getColumnApplications(column.id).length}
                </Badge>
              </div>

              <div className={`flex-1 min-h-[300px] p-2 ${column.lightColor} rounded-b-lg border border-t-0 space-y-2`}>
                {getColumnApplications(column.id).map(app => (
                  <KanbanCard
                    key={app.id}
                    app={app}
                    column={column}
                    onMove={handleMoveToNext}
                    onReject={handleRejectClick}
                    onView={(app) => setViewApp(app)}
                    onArchive={handleArchive}
                    onUpdate={handleUpdateApplication}
                    isMoving={movingId === app.id}
                  />
                ))}

                {getColumnApplications(column.id).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-center px-4">
                    <p className="text-sm">
                      {filteredApplications.length === 0 && (searchQuery || minScore > 0)
                        ? (locale === 'fr' ? 'Aucun résultat pour ce filtre' : 'No matches for filters')
                        : (locale === 'fr' ? 'Aucune candidature' : 'No applications')
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                     checked={selectedIds.size === filteredApplications.length && filteredApplications.length > 0}
                     indeterminate={selectedIds.size > 0 && selectedIds.size < filteredApplications.length}
                     onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>{locale === 'fr' ? 'Candidat' : 'Candidate'}</TableHead>
                <TableHead>{locale === 'fr' ? 'Offre' : 'Job'}</TableHead>
                <TableHead>{locale === 'fr' ? 'Statut' : 'Status'}</TableHead>
                <TableHead>{locale === 'fr' ? 'Score' : 'Score'}</TableHead>
                <TableHead>{locale === 'fr' ? 'Tags' : 'Tags'}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map(app => (
                <TableRow key={app.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setViewApp(app)}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={() => toggleSelection(app.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {app.candidate.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{app.candidate.name || app.candidate.email}</div>
                        <div className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{app.job.title}</TableCell>
                  <TableCell>
                    <Badge variant={
                      app.status === 'ACCEPTED' ? 'success' : 
                      app.status === 'REJECTED' ? 'destructive' : 
                      app.status === 'REVIEWED' ? 'default' : 
                      app.status === 'ARCHIVED' ? 'secondary' : 'outline'
                    }>
                      {columnLabels[locale as keyof typeof columnLabels][app.status as keyof typeof columnLabels['fr']] || app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     {(app.score || 0) > 0 ? (
                       <div className="flex text-amber-400 gap-0.5">
                         {Array.from({length: app.score || 0}).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                       </div>
                     ) : (
                       <span className="text-slate-300">-</span>
                     )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {app.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
                      ))}
                      {(app.tags?.length || 0) > 2 && (
                        <span className="text-xs text-slate-500">+{app.tags!.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                       <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setViewApp(app); }}>
                         <Eye className="w-4 h-4" />
                       </Button>
                       <StartConversationButton
                          receiverId={app.candidate.id}
                          applicationId={app.id}
                          jobId={app.job.id}
                          variant="ghost"
                          size="sm"
                       />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredApplications.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      {locale === 'fr' ? 'Aucune candidature trouvée' : 'No applications found'}
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Quick View Dialog */}
      <Dialog open={!!viewApp} onOpenChange={(open) => !open && setViewApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-br from-teal-500 to-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {viewApp?.candidate.name?.[0]?.toUpperCase() || 'C'}
              </span>
              <span>{viewApp?.candidate.name || viewApp?.candidate.email}</span>
            </DialogTitle>
            <DialogDescription>
              {locale === 'fr' ? 'Postule pour ' : 'Applied for '} 
              <span className="font-medium text-slate-900">{viewApp?.job.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 my-4">
            {/* Information Section */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-slate-500 text-xs mb-1">Email</p>
                <p className="font-medium">{viewApp?.candidate.email}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-slate-500 text-xs mb-1">Date</p>
                <p className="font-medium">
                  {viewApp && new Date(viewApp.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    dateStyle: 'long'
                  })}
                </p>
              </div>
            </div>

            {/* Resume Section */}
            {viewApp?.resume ? (
               <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">CV / Resume</h4>
                  <p className="text-xs text-slate-500">
                    {locale === 'fr' ? 'Document téléchargé' : 'Uploaded document'}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={viewApp.resume} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    {locale === 'fr' ? 'Voir le CV' : 'View Resume'}
                  </a>
                </Button>
               </div>
            ) : (
              <div className="border border-slate-200 border-dashed rounded-lg p-6 text-center text-slate-500 text-sm">
                {locale === 'fr' ? 'Aucun CV fourni' : 'No resume provided'}
              </div>
            )}

            {/* Cover Letter Section */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                {locale === 'fr' ? 'Lettre de motivation' : 'Cover Letter'}
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 max-h-[200px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {viewApp?.coverLetter || (
                  <span className="italic text-slate-400">
                    {locale === 'fr' ? 'Aucune lettre de motivation' : 'No cover letter'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={() => setViewApp(null)}>
               {locale === 'fr' ? 'Fermer' : 'Close'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!rejectionApp} onOpenChange={(open) => !open && setRejectionApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'fr' ? 'Refuser la candidature' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'fr' 
                ? `Voulez-vous envoyer un email de refus automatique à ${rejectionApp?.candidate.name || 'ce candidat'} ?`
                : `Do you want to send an automatic rejection email to ${rejectionApp?.candidate.name || 'this candidate'}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-200 my-4">
            <p className="font-medium mb-2 text-slate-900">
              {locale === 'fr' ? 'Aperçu du message :' : 'Email preview:'}
            </p>
            <p className="italic">
              {locale === 'fr' 
                ? `"Bonjour ${rejectionApp?.candidate.name || '...'}, merci d'avoir postulé pour le poste de ${rejectionApp?.job.title}... Bien que votre profil soit intéressant, nous avons décidé de ne pas donner suite..."`
                : `"Hello ${rejectionApp?.candidate.name || '...'}, thank you for applying for the ${rejectionApp?.job.title} position... Although your profile is impressive, we have decided not to proceed..."`
              }
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => confirmReject(false)}
              disabled={isProcessingRejection}
            >
              {locale === 'fr' ? 'Refuser sans email' : 'Reject without email'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmReject(true)}
              disabled={isProcessingRejection}
            >
              {isProcessingRejection 
                ? (locale === 'fr' ? 'Envoi...' : 'Sending...') 
                : (locale === 'fr' ? 'Refuser et envoyer email' : 'Reject & Send Email')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
