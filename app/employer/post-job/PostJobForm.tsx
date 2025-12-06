'use client'

import { createJob, updateJob } from '@/app/actions/jobs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import CurrencySelector from './CurrencySelector'

interface PostJobFormProps {
  companyId: string
  initialData?: any
  jobId?: string
}

const categories = [
  "Technologie", "Marketing", "Ventes", "Design", "Finance",
  "Ressources Humaines", "Opérations", "Support Client", "Ingénierie",
  "Produit", "Juridique", "Autre"
]

const locationTypes = [
  { value: "onsite", label: "Sur site" },
  { value: "remote", label: "Télétravail" },
  { value: "hybrid", label: "Hybride" }
]

const employmentTypes = [
  { value: "full-time", label: "Temps plein" },
  { value: "part-time", label: "Temps partiel" },
  { value: "contract", label: "Contrat" },
  { value: "internship", label: "Stage" }
]

export default function PostJobForm({ companyId, initialData, jobId }: PostJobFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
    salaryMin: initialData?.salaryMin || '',
    salaryMax: initialData?.salaryMax || '',
    salaryCurrency: initialData?.salaryCurrency || 'USD',
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
      toast.error('Veuillez remplir tous les champs requis')
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
          toast.success(status === 'OPEN' ? 'Offre publiée avec succès!' : 'Offre mise à jour!')
        } else {
          const job = await createJob(jobData)
          if (status === 'OPEN') {
            await updateJob(job.id, { status: 'OPEN' })
          }
          toast.success(status === 'OPEN' ? 'Offre publiée avec succès!' : 'Brouillon sauvegardé!')
        }
        
        router.push('/employer/dashboard')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la création de l\'offre')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du poste <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="Ex: Développeur Full Stack Senior"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Décrivez le poste en détail..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie <span className="text-red-500">*</span></Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="location">Localisation <span className="text-red-500">*</span></Label>
            <Input
              id="location"
              placeholder="Ex: Paris, France"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="locationType">Type de localisation</Label>
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
            <Label htmlFor="employmentType">Type d'emploi</Label>
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
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Salaire (optionnel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salaryMin">Salaire minimum</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="50000"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="salaryMax">Salaire maximum</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder="80000"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
            />
          </div>
          <CurrencySelector
            value={formData.salaryCurrency}
            onChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Exigences</h3>
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
            placeholder="Ajouter une exigence"
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
        <h3 className="text-lg font-semibold text-slate-900">Responsabilités</h3>
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
            placeholder="Ajouter une responsabilité"
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
        <h3 className="text-lg font-semibold text-slate-900">Avantages</h3>
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
            placeholder="Ajouter un avantage"
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
          Annuler
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('DRAFT')}
          disabled={isPending}
        >
          Sauvegarder comme brouillon
        </Button>
        <Button
          type="button"
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => handleSubmit('OPEN')}
          disabled={isPending}
        >
          {isPending ? 'Publication...' : 'Publier l\'offre'}
        </Button>
      </div>
    </div>
  )
}
