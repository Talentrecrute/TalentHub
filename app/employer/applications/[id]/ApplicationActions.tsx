'use client'

import { updateApplicationStatus } from '@/app/actions/applications'
import { Button } from "@/components/ui/button"
import { Check, Eye, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface ApplicationActionsProps {
  applicationId: string
  currentStatus: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
}

export default function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, status)
        const messages = {
          PENDING: 'Candidature remise en attente',
          REVIEWED: 'Candidature marquée comme examinée',
          ACCEPTED: 'Candidature acceptée !',
          REJECTED: 'Candidature rejetée'
        }
        toast.success(messages[status])
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la mise à jour')
      }
    })
  }

  return (
    <div className="flex gap-2 pt-4 border-t border-slate-200">
      {currentStatus !== 'REVIEWED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('REVIEWED')}
          disabled={isPending}
        >
          <Eye className="w-4 h-4 mr-2" />
          Marquer comme examinée
        </Button>
      )}
      {currentStatus !== 'ACCEPTED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('ACCEPTED')}
          disabled={isPending}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Check className="w-4 h-4 mr-2" />
          Accepter
        </Button>
      )}
      {currentStatus !== 'REJECTED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('REJECTED')}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          Rejeter
        </Button>
      )}
    </div>
  )
}
