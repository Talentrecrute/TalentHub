'use client'

import { toggleJobStatus } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Edit, Lock, LockOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface JobActionsProps {
  jobId: string
  jobStatus: 'DRAFT' | 'OPEN' | 'CLOSED'
}

export default function JobActions({ jobId, jobStatus }: JobActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(jobStatus)
  const router = useRouter()

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    startTransition(async () => {
      try {
        const result = await toggleJobStatus(jobId)
        setCurrentStatus(result.newStatus as 'DRAFT' | 'OPEN' | 'CLOSED')
        toast.success(`Offre ${result.newStatus === 'OPEN' ? 'ouverte' : 'fermée'} avec succès`)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la mise à jour')
      }
    })
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/employer/edit-job/${jobId}`)
  }

  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleEdit}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleToggleStatus}
        disabled={isPending}
        title={currentStatus === 'OPEN' ? 'Fermer l\'offre' : 'Ouvrir l\'offre'}
      >
        {currentStatus === 'OPEN' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <LockOpen className="w-4 h-4" />
        )}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          router.push(`/jobs/${jobId}`)
        }}
      >
        Voir
      </Button>
    </div>
  )
}
