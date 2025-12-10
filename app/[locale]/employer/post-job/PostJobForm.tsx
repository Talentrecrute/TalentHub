'use client'

import { createJob, updateJob } from '@/app/actions/jobs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import CurrencySelector from './CurrencySelector'

interface PostJobFormProps {
  companyId: string
  initialData?: any
  jobId?: string
}

export default function PostJobForm({ companyId, initialData, jobId }: PostJobFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('postJob')
  const tJobs = useTranslations('jobs')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')

  // Dynamic arrays with translations
  const categories = [
    { value: "technology", label: t('categories.technology') },
    { value: "marketing", label: t('categories.marketing') },
    { value: "sales", label: t('categories.sales') },
    { value: "design", label: t('categories.design') },
    { value: "finance", label: t('categories.finance') },
    { value: "hr", label: t('categories.hr') },
    { value: "operations", label: t('categories.operations') },
    { value: "support", label: t('categories.support') },
    { value: "engineering", label: t('categories.engineering') },
    { value: "product", label: t('categories.product') },
    { value: "legal", label: t('categories.legal') },
    { value: "other", label: t('categories.other') }
  ]

  const locationTypes = [
    { value: "onsite", label: tJobs('locationType.onsite') },
    { value: "remote", label: tJobs('locationType.remote') },
    { value: "hybrid", label: tJobs('locationType.hybrid') }
  ]

  const employmentTypes = [
    { value: "full-time", label: tJobs('employmentType.fullTime') },
    { value: "part-time", label: tJobs('employmentType.partTime') },
    { value: "contract", label: tJobs('employmentType.contract') },
    { value: "internship", label: tJobs('employmentType.internship') }
  ]

  const experienceLevels = [
    { value: "entry", label: tJobs('experienceLevel.entry') },
    { value: "mid", label: tJobs('experienceLevel.mid') },
    { value: "senior", label: tJobs('experienceLevel.senior') },
    { value: "lead", label: tJobs('experienceLevel.lead') },
    { value: "executive", label: tJobs('experienceLevel.executive') }
  ]

  const parseJSON = (data: string | null) => {
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    location: initialData?.location || '',
    locationType: initialData?.locationType || 'onsite',
    employmentType: initialData?.employmentType || 'full-time',
    experienceLevel: initialData?.experienceLevel || 'mid',
    salaryMin: initialData?.salaryMin || '',
    salaryMax: initialData?.salaryMax || '',
    salaryCurrency: initialData?.salaryCurrency || 'EUR',
    salaryPeriod: initialData?.salaryPeriod || 'monthly',
    requirements: parseJSON(initialData?.requirements),
    responsibilities: parseJSON(initialData?.responsibilities),
    benefits: parseJSON(initialData?.benefits),
  })

  const [newRequirement, setNewRequirement] = useState('')
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, newRequirement.trim()] })
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_: any, i: number) => i !== index) })
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({ ...formData, responsibilities: [...formData.responsibilities, newResponsibility.trim()] })
      setNewResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData({ ...formData, responsibilities: formData.responsibilities.filter((_: any, i: number) => i !== index) })
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] })
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_: any, i: number) => i !== index) })
  }

  const handleSubmit = async (status: 'DRAFT' | 'OPEN') => {
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error(tErrors('requiredFields'))
      return
    }

    startTransition(async () => {
      try {
        const jobData = {
          ...formData,
          companyId,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        }

        if (jobId) {
          await updateJob(jobId, { ...jobData, status })
          toast.success(status === 'OPEN' ? t('jobPublished') : t('jobUpdated'))
        } else {
          const job = await createJob(jobData)
          if (status === 'OPEN') {
            await updateJob(job.id, { status: 'OPEN' })
          }
          toast.success(status === 'OPEN' ? t('jobPublished') : t('draftSaved'))
        }
        
        router.push('/employer/dashboard')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || tErrors('createJobFailed'))
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">{t('jobTitle')} <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder={t('jobTitlePlaceholder')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">{t('jobDescription')} <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder={t('jobDescriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">{t('category')} <span className="text-red-500">*</span></Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="location">{t('location')} <span className="text-red-500">*</span></Label>
            <Input
              id="location"
              placeholder={t('locationPlaceholder')}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="locationType">{t('locationType')}</Label>
            <select
              id="locationType"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              value={formData.locationType}
              onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
            >
              {locationTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="employmentType">{t('employmentType')}</Label>
            <select
              id="employmentType"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            >
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="experienceLevel">{t('experienceLevel')}</Label>
            <select
              id="experienceLevel"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">{t('salary')}</h3>
        
        {/* Salary Period Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, salaryPeriod: 'monthly' })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              formData.salaryPeriod === 'monthly'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Par mois
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, salaryPeriod: 'yearly' })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              formData.salaryPeriod === 'yearly'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Par an
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salaryMin">Salaire minimum ({formData.salaryPeriod === 'monthly' ? '/mois' : '/an'})</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder={formData.salaryPeriod === 'monthly' ? '3000' : '40000'}
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Salaire maximum ({formData.salaryPeriod === 'monthly' ? '/mois' : '/an'})</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder={formData.salaryPeriod === 'monthly' ? '5000' : '60000'}
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
            />
          </div>
          <CurrencySelector
            value={formData.salaryCurrency}
            onChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
          />
        </div>
        
        {/* Salary Preview */}
        {(formData.salaryMin || formData.salaryMax) && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <p className="text-sm text-teal-800">
              <span className="font-medium">Aperçu : </span>
              {formData.salaryMin && formData.salaryMax ? (
                <span>
                  {Number(formData.salaryMin).toLocaleString('fr-FR')} - {Number(formData.salaryMax).toLocaleString('fr-FR')} {formData.salaryCurrency}
                  {formData.salaryPeriod === 'monthly' ? ' / mois' : ' / an'}
                </span>
              ) : formData.salaryMin ? (
                <span>
                  À partir de {Number(formData.salaryMin).toLocaleString('fr-FR')} {formData.salaryCurrency}
                  {formData.salaryPeriod === 'monthly' ? ' / mois' : ' / an'}
                </span>
              ) : (
                <span>
                  Jusqu'à {Number(formData.salaryMax).toLocaleString('fr-FR')} {formData.salaryCurrency}
                  {formData.salaryPeriod === 'monthly' ? ' / mois' : ' / an'}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">{t('requirements')}</h3>
        <div className="space-y-2">
          {formData.requirements.map((req: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="flex-1 text-sm text-slate-700">{req}</span>
              <button
                type="button"
                onClick={() => removeRequirement(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('addRequirementPlaceholder')}
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
          />
          <Button type="button" onClick={addRequirement} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Responsibilities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">{t('responsibilities')}</h3>
        <div className="space-y-2">
          {formData.responsibilities.map((resp: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="flex-1 text-sm text-slate-700">{resp}</span>
              <button
                type="button"
                onClick={() => removeResponsibility(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('addResponsibilityPlaceholder')}
            value={newResponsibility}
            onChange={(e) => setNewResponsibility(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
          />
          <Button type="button" onClick={addResponsibility} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">{t('benefits')}</h3>
        <div className="space-y-2">
          {formData.benefits.map((benefit: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
              <span className="flex-1 text-sm text-slate-700">{benefit}</span>
              <button
                type="button"
                onClick={() => removeBenefit(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('addBenefitPlaceholder')}
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
          />
          <Button type="button" onClick={addBenefit} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('DRAFT')}
          disabled={isPending}
        >
          {t('saveDraft')}
        </Button>
        <Button
          type="button"
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => handleSubmit('OPEN')}
          disabled={isPending}
        >
          {isPending ? t('publishing') : t('publishJob')}
        </Button>
      </div>
    </div>
  )
}
