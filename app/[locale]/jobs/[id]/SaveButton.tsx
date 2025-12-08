'use client'

import { saveJob } from '@/app/actions/jobs'
import { Button } from "@/components/ui/button"
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface SaveButtonProps {
  jobId: string
  isSaved: boolean
  isAuthenticated: boolean
}

export default function SaveButton({ jobId, isSaved, isAuthenticated }: SaveButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save jobs')
      return
    }

    startTransition(async () => {
      try {
        const result = await saveJob(jobId)
        toast.success(result.message)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to save job')
      }
    })
  }

  return (
    <Button 
      variant="outline"
      onClick={handleSave}
      disabled={isPending}
      className="w-full"
    >
      <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-teal-600' : ''}`} />
      {isSaved ? 'Saved' : 'Save Job'}
    </Button>
  )
}
