'use client'

import { applyToJob } from '@/app/actions/applications'
import CoverLetterGenerator from '@/components/candidate/CoverLetterGenerator'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ApplyButtonProps {
  jobId: string
  jobTitle: string
  companyName: string
  hasApplied: boolean
  applicationStatus?: string
  isAuthenticated: boolean
  candidateName?: string
}

export default function ApplyButton({ 
  jobId, 
  jobTitle,
  companyName,
  hasApplied, 
  applicationStatus, 
  isAuthenticated,
  candidateName 
}: ApplyButtonProps) {
  const t = useTranslations('jobs')
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')
  const tErrors = useTranslations('errors')
  const tStatus = useTranslations('status')
  const tApps = useTranslations('applications')
  
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApply = () => {
    startTransition(async () => {
      try {
        await applyToJob({ jobId, coverLetter })
        toast.success(tMessages('applicationSubmitted'))
        setShowApplicationForm(false)
        setCoverLetter('')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || tErrors('somethingWrong'))
      }
    })
  }

  const handleGeneratedLetter = (letter: string) => {
    setCoverLetter(letter)
    setShowGenerator(false)
  }

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = '/api/auth/signin'}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold"
      >
        {tAuth('signInToApply')}
      </Button>
    )
  }

  if (hasApplied) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">{tApps('applicationSubmitted')}</h3>
        <p className="text-sm text-slate-600 mb-4">
          {tApps('status')}: <span className="font-medium capitalize">{applicationStatus ? tStatus(applicationStatus.toLowerCase() as any) : ''}</span>
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.push('/applications')}>
          {tApps('viewMyApplications')}
        </Button>
      </div>
    )
  }

  if (showApplicationForm) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">{t('applyForPosition')}</h3>
        
        {/* Cover Letter Generator Toggle */}
        {showGenerator ? (
          <CoverLetterGenerator
            jobTitle={jobTitle}
            companyName={companyName}
            candidateName={candidateName}
            onGenerate={handleGeneratedLetter}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                {tApps('coverLetter')}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGenerator(true)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Wand2 className="w-4 h-4 mr-1" />
                Auto-générer
              </Button>
            </div>
            <Textarea
              placeholder={t('coverLetterPlaceholder')}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 bg-teal-600 hover:bg-teal-700"
          >
            {isPending ? tCommon('loading') : t('submitApplication')}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setShowApplicationForm(false)
              setShowGenerator(false)
            }}
            disabled={isPending}
          >
            {tCommon('cancel')}
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
      {t('applyNow')}
    </Button>
  )
}
