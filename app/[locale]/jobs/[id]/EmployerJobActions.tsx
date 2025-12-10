'use client'

import { toggleJobStatus } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Edit, Lock, LockOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface EmployerJobActionsProps {
  jobId: string
  jobStatus: 'DRAFT' | 'OPEN' | 'CLOSED'
  employerId: string
  currentUserId: string
}

export default function EmployerJobActions({ 
  jobId, 
  jobStatus, 
  employerId, 
  currentUserId 
}: EmployerJobActionsProps) {
  const t = useTranslations('employer')
  const tMessages = useTranslations('messages')
  const tErrors = useTranslations('errors')
  const tStatus = useTranslations('status')
  
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(jobStatus)
  const router = useRouter()

  // Only show if the current user is the employer who owns this job
  if (employerId !== currentUserId) {
    return null
  }

  const handleToggleStatus = () => {
    startTransition(async () => {
      try {
        const result = await toggleJobStatus(jobId)
        setCurrentStatus(result.newStatus as 'DRAFT' | 'OPEN' | 'CLOSED')
        toast.success(result.newStatus === 'OPEN' ? tMessages('jobOpened') : tMessages('jobClosed'))
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || tErrors('somethingWrong'))
      }
    })
  }

  const handleEdit = () => {
    router.push(`/employer/edit-job/${jobId}`)
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          {t('jobManagement')}
        </p>
        <p className="text-xs text-blue-600">
          {t('jobManagementDesc')}
        </p>
      </div>

      <Button 
        onClick={handleEdit}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        <Edit className="w-4 h-4 mr-2" />
        {t('editJob')}
      </Button>

      <Button 
        onClick={handleToggleStatus}
        disabled={isPending}
        variant="outline"
        className="w-full"
      >
        {currentStatus === 'OPEN' ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            {t('closeJob')}
          </>
        ) : (
          <>
            <LockOpen className="w-4 h-4 mr-2" />
            {t('openJob')}
          </>
        )}
      </Button>

      <div className="text-xs text-slate-500 text-center pt-2">
        {t('currentStatus')}: <span className="font-medium capitalize">{tStatus(currentStatus.toLowerCase() as any)}</span>
      </div>
    </div>
  )
}
