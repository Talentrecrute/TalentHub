'use client'

import { applyToJob } from '@/app/actions/applications'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ApplyButtonProps {
  jobId: string
  hasApplied: boolean
  applicationStatus?: string
  isAuthenticated: boolean
}

export default function ApplyButton({ jobId, hasApplied, applicationStatus, isAuthenticated }: ApplyButtonProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApply = () => {
    startTransition(async () => {
      try {
        await applyToJob({ jobId, coverLetter })
        toast.success('Application submitted successfully!')
        setShowApplicationForm(false)
        setCoverLetter('')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to submit application')
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = '/api/auth/signin'}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold"
      >
        Sign In to Apply
      </Button>
    )
  }

  if (hasApplied) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Application Submitted</h3>
        <p className="text-sm text-slate-600 mb-4">
          Status: <span className="font-medium capitalize">{applicationStatus}</span>
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.push('/applications')}>
          View My Applications
        </Button>
      </div>
    )
  }

  if (showApplicationForm) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Apply for this position</h3>
        <Textarea
          placeholder="Write a cover letter (optional)"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 bg-teal-600 hover:bg-teal-700"
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowApplicationForm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => setShowApplicationForm(true)}
      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold"
    >
      Apply Now
    </Button>
  )
}
