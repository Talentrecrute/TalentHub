'use client'

import { updateApplicationStatus } from '@/app/actions/applications'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ApplicationStatusUpdateProps {
  applicationId: string
  currentStatus: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
}

const statusOptions = [
  { value: 'PENDING', label: 'En attente', color: 'bg-yellow-500' },
  { value: 'REVIEWED', label: 'Examinée', color: 'bg-blue-500' },
  { value: 'ACCEPTED', label: 'Acceptée', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Refusée', color: 'bg-red-500' },
]

export default function ApplicationStatusUpdate({ 
  applicationId, 
  currentStatus 
}: ApplicationStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusChange = (newStatus: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') => {
    if (newStatus === status) return

    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, newStatus)
        setStatus(newStatus)
        toast.success(`Statut mis à jour : ${statusOptions.find(s => s.value === newStatus)?.label}`)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la mise à jour du statut')
      }
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Mettre à jour le statut</h3>
      <div className="grid grid-cols-2 gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={status === option.value ? 'default' : 'outline'}
            className={status === option.value ? `${option.color} hover:${option.color}` : ''}
            onClick={() => handleStatusChange(option.value as any)}
            disabled={isPending}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Statut actuel : <span className="font-medium">{statusOptions.find(s => s.value === status)?.label}</span>
      </p>
    </div>
  )
}
