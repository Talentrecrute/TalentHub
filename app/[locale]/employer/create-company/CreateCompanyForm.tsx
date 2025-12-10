'use client'

import { createCompany } from '@/app/actions/company'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface CreateCompanyFormProps {
  initialData?: {
    companyName?: string
    companyDescription?: string
    companyWebsite?: string
    companyIndustry?: string
    companySize?: string
    location?: string
  }
}

const industries = [
  "Technologie",
  "Finance",
  "Santé",
  "Éducation",
  "Commerce de détail",
  "Fabrication",
  "Conseil",
  "Marketing & Publicité",
  "Immobilier",
  "Transport & Logistique",
  "Hôtellerie & Restauration",
  "Autre"
]

const companySizes = [
  "1-10 employés",
  "11-50 employés",
  "51-200 employés",
  "201-500 employés",
  "501-1000 employés",
  "1000+ employés"
]

export default function CreateCompanyForm({ initialData }: CreateCompanyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: initialData?.companyName || '',
    description: initialData?.companyDescription || '',
    website: initialData?.companyWebsite || '',
    industry: initialData?.companyIndustry || '',
    size: initialData?.companySize || '',
    location: initialData?.location || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error('Le nom de l\'entreprise est requis')
      return
    }

    startTransition(async () => {
      try {
        await createCompany(formData)
        toast.success('Entreprise créée avec succès!')
        router.push('/employer/dashboard')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la création de l\'entreprise')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Informations de l'entreprise</h2>
              <p className="text-sm text-slate-600">Créez votre profil d'entreprise pour commencer à poster des offres</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'entreprise <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Ex: TechCorp International"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre entreprise, sa mission et ses valeurs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  placeholder="https://www.exemple.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  placeholder="Ville, Pays"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="industry">Secteur d'activité</Label>
                <select
                  id="industry"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="">Sélectionner un secteur</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="size">Taille de l'entreprise</Label>
                <select
                  id="size"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                >
                  <option value="">Sélectionner la taille</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isPending}
            >
              {isPending ? 'Création...' : 'Créer l\'entreprise'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
