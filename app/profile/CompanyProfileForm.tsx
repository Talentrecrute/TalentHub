'use client'

import { updateProfile } from '@/app/actions/profile'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface CompanyProfileFormProps {
  user: any
  initialData: any
}

const companySizes = [
  "1-10 employés",
  "11-50 employés",
  "51-200 employés",
  "201-500 employés",
  "501-1000 employés",
  "1000+ employés"
]

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

export default function CompanyProfileForm({ user, initialData }: CompanyProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Auto-enable edit mode if profile is incomplete
  const isProfileIncomplete = !initialData?.companyName || !initialData?.companyDescription
  const [editMode, setEditMode] = useState(isProfileIncomplete)

  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    companyDescription: initialData?.companyDescription || '',
    companyWebsite: initialData?.companyWebsite || '',
    companyIndustry: initialData?.companyIndustry || '',
    companySize: initialData?.companySize || '',
    location: initialData?.location || '',
    phone: initialData?.phone || '',
  })

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile(formData)
        toast.success('Profil d\'entreprise mis à jour avec succès!')
        setEditMode(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Échec de la mise à jour du profil')
      }
    })
  }

  const handleCancel = () => {
    setFormData({
      companyName: initialData?.companyName || '',
      companyDescription: initialData?.companyDescription || '',
      companyWebsite: initialData?.companyWebsite || '',
      companyIndustry: initialData?.companyIndustry || '',
      companySize: initialData?.companySize || '',
      location: initialData?.location || '',
      phone: initialData?.phone || '',
    })
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Alert for incomplete profile */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 font-medium mb-1">
            ⚠️ Profil incomplet
          </p>
          <p className="text-xs text-amber-700">
            Veuillez remplir au minimum le nom et la description de votre entreprise pour compléter votre profil.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} className="bg-teal-600 hover:bg-teal-700">
            Modifier le profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled className="bg-slate-50" />
        </div>

        <div>
          <Label>Nom de l'entreprise</Label>
          <Input
            placeholder="Nom de votre entreprise"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            disabled={!editMode}
            className={!editMode ? "bg-white" : ""}
          />
        </div>

        <div>
          <Label>Description de l'entreprise</Label>
          <Textarea
            placeholder="Décrivez votre entreprise, sa mission et ses valeurs..."
            value={formData.companyDescription}
            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
            disabled={!editMode}
            rows={5}
            className={!editMode ? "bg-white" : ""}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Site web</Label>
            <Input
              placeholder="https://www.exemple.com"
              value={formData.companyWebsite}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
              disabled={!editMode}
              className={!editMode ? "bg-white" : ""}
            />
          </div>

          <div>
            <Label>Secteur d'activité</Label>
            <select
              className={`flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!editMode ? "bg-white" : "bg-white"}`}
              value={formData.companyIndustry}
              onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
              disabled={!editMode}
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
            <Label>Taille de l'entreprise</Label>
            <select
              className={`flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!editMode ? "bg-white" : "bg-white"}`}
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              disabled={!editMode}
            >
              <option value="">Sélectionner la taille</option>
              {companySizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Localisation</Label>
            <Input
              placeholder="Ville, Pays"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!editMode}
              className={!editMode ? "bg-white" : ""}
            />
          </div>

          <div>
            <Label>Téléphone</Label>
            <Input
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editMode}
              className={!editMode ? "bg-white" : ""}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
