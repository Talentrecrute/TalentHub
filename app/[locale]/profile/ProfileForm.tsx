'use client'

import { updateProfile } from '@/app/actions/profile'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ProfileFormProps {
  user: any
  initialData: any
}

export default function ProfileForm({ user, initialData }: ProfileFormProps) {
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const tMessages = useTranslations('messages')
  const tErrors = useTranslations('errors')
  const tApps = useTranslations('applications')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  
  const parseJSON = (data: string | null) => {
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    phone: initialData?.phone || '',
    skills: parseJSON(initialData?.skills),
    experience: parseJSON(initialData?.experience),
    education: parseJSON(initialData?.education),
  })

  const [newSkill, setNewSkill] = useState('')
  const [newExperience, setNewExperience] = useState({
    title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: ''
  })
  const [newEducation, setNewEducation] = useState({
    degree: '', institution: '', field: '', startDate: '', endDate: '', current: false
  })

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_: any, i: number) => i !== index) })
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData({ ...formData, experience: [...formData.experience, newExperience] })
      setNewExperience({
        title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: ''
      })
    }
  }

  const removeExperience = (index: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_: any, i: number) => i !== index) })
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData({ ...formData, education: [...formData.education, newEducation] })
      setNewEducation({
        degree: '', institution: '', field: '', startDate: '', endDate: '', current: false
      })
    }
  }

  const removeEducation = (index: number) => {
    setFormData({ ...formData, education: formData.education.filter((_: any, i: number) => i !== index) })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile(formData)
        toast.success(tMessages('profileUpdated'))
        setEditMode(false)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || tErrors('somethingWrong'))
      }
    })
  }

  const handleCancel = () => {
    setFormData({
      name: initialData?.name || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      phone: initialData?.phone || '',
      skills: parseJSON(initialData?.skills),
      experience: parseJSON(initialData?.experience),
      education: parseJSON(initialData?.education),
    })
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} className="bg-teal-600 hover:bg-teal-700">
            {t('editProfile')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
              {isPending ? tCommon('loading') : t('saveChanges')}
            </Button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label>{t('fullName')}</Label>
          <Input 
            placeholder={t('fullName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!editMode}
            className={!editMode ? "bg-white" : ""}
          />
        </div>
        
        <div>
          <Label>{t('email')}</Label>
          <Input value={user?.email || ''} disabled className="bg-slate-50" />
        </div>

        <div>
          <Label>{t('bio')}</Label>
          <Textarea
            placeholder={t('bioPlaceholder')}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!editMode}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t('location')}</Label>
            <Input
              placeholder={t('location')}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!editMode}
            />
          </div>
          
          <div>
            <Label>{t('phone')}</Label>
            <Input
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editMode}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('skills')}</h3>
        <div className="flex flex-wrap gap-2">
          {formData.skills?.map((skill: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {skill}
              {editMode && (
                <button onClick={() => removeSkill(idx)} className="ml-2 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              )}
           </Badge>
          ))}
        </div>
        
        {editMode && (
          <div className="flex gap-2">
            <Input
              placeholder={t('skillsPlaceholder')}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button onClick={addSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{tApps('experience')}</h3>
        {formData.experience?.map((exp: any, idx: number) => (
          <div key={idx} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                <p className="text-slate-600">{exp.company}</p>
              </div>
              {editMode && (
                <Button variant="ghost" size="sm" onClick={() => removeExperience(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {exp.startDate} - {exp.current ? tApps('present') : exp.endDate}
              {exp.location && ` • ${exp.location}`}
            </p>
            {exp.description && <p className="text-sm text-slate-600 mt-2">{exp.description}</p>}
          </div>
        ))}

        {editMode && (
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
            <h4 className="font-medium">{t('addExperience')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder={t('jobTitle')} value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} />
              <Input placeholder={t('company')} value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
              <Input placeholder={t('location')} value={newExperience.location} onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })} />
              <Input type="month" value={newExperience.startDate} onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })} />
              {!newExperience.current && (
                <Input type="month" value={newExperience.endDate} onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })} />
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newExperience.current} onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })} />
                <span className="text-sm">{t('currentlyWorking')}</span>
              </label>
            </div>
            <Textarea placeholder="Description" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} rows={3} />
            <Button onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" /> {t('addExperience')}
            </Button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{tApps('education')}</h3>
        {formData.education?.map((edu: any, idx: number) => (
          <div key={idx} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                <p className="text-slate-600">{edu.institution}</p>
                {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
              </div>
              {editMode && (
                <Button variant="ghost" size="sm" onClick={() => removeEducation(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {edu.startDate} - {edu.current ? tApps('inProgress') : edu.endDate}
            </p>
          </div>
        ))}

        {editMode && (
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
            <h4 className="font-medium">{t('addEducation')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder={t('degree')} value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
              <Input placeholder={t('institution')} value={newEducation.institution} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} />
              <Input placeholder={t('fieldOfStudy')} value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} />
              <Input type="month" value={newEducation.startDate} onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })} />
              {!newEducation.current && (
                <Input type="month" value={newEducation.endDate} onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })} />
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newEducation.current} onChange={(e) => setNewEducation({ ...newEducation, current: e.target.checked })} />
                <span className="text-sm">{t('currentlyStudying')}</span>
              </label>
            </div>
            <Button onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" /> {t('addEducation')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
