'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { JobTemplate } from '@prisma/client'
import { Edit2, FileText, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface JobTemplateManagerProps {
  onSelectTemplate: (template: JobTemplate) => void
  currentJobData?: {
    title: string
    description: string
    category: string
    locationType: string
    employmentType: string
    experienceLevel: string
    requirements: string
    responsibilities: string
    benefits: string
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
  }
}

export default function JobTemplateManager({ 
  onSelectTemplate,
  currentJobData 
}: JobTemplateManagerProps) {
  const locale = useLocale()
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/employer/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error(locale === 'fr' ? 'Nom du template requis' : 'Template name required')
      return
    }

    if (!currentJobData?.title || !currentJobData?.description) {
      toast.error(locale === 'fr' ? 'Remplissez le titre et la description d\'abord' : 'Fill in title and description first')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/employer/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          ...currentJobData
        })
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Template sauvegardé !' : 'Template saved!')
        setShowSaveForm(false)
        setNewTemplateName('')
        fetchTemplates()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la sauvegarde' : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTemplateName = async (id: string) => {
    if (!editName.trim()) {
      toast.error(locale === 'fr' ? 'Nom requis' : 'Name required')
      return
    }

    try {
      const template = templates.find(t => t.id === id)
      const response = await fetch(`/api/employer/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          name: editName
        })
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Nom mis à jour !' : 'Name updated!')
        setEditingTemplateId(null)
        setEditName('')
        fetchTemplates()
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Update failed')
    }
  }

  const handleUpdateTemplateContent = async (id: string) => {
    if (!currentJobData?.title || !currentJobData?.description) {
      toast.error(locale === 'fr' ? 'Remplissez le formulaire d\'abord' : 'Fill in the form first')
      return
    }

    const template = templates.find(t => t.id === id)
    if (!template) return

    try {
      const response = await fetch(`/api/employer/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          ...currentJobData
        })
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Contenu du template mis à jour !' : 'Template content updated!')
        fetchTemplates()
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Update failed')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm(locale === 'fr' ? 'Supprimer ce template ?' : 'Delete this template?')) {
      return
    }

    try {
      const response = await fetch(`/api/employer/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Template supprimé' : 'Template deleted')
        fetchTemplates()
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed')
    }
  }

  const startEditingName = (template: JobTemplate) => {
    setEditingTemplateId(template.id)
    setEditName(template.name)
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            {locale === 'fr' ? 'Chargement des templates...' : 'Loading templates...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-teal-200 bg-teal-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900">
              {locale === 'fr' ? 'Templates d\'offres' : 'Job Templates'}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="text-teal-600 border-teal-300 hover:bg-teal-100"
          >
            <Save className="w-4 h-4 mr-1" />
            {locale === 'fr' ? 'Nouveau template' : 'New template'}
          </Button>
        </div>

        {/* Save Template Form */}
        {showSaveForm && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-teal-200">
            <p className="text-xs text-slate-600 mb-2">
              {locale === 'fr' 
                ? '💡 Remplissez le formulaire ci-dessous, puis entrez un nom et sauvegardez.'
                : '💡 Fill in the form below, then enter a name and save.'}
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={locale === 'fr' ? 'Nom du template (ex: Dev Senior)...' : 'Template name (ex: Senior Dev)...'}
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    {locale === 'fr' ? 'Créer' : 'Create'}
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveForm(false)
                  setNewTemplateName('')
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Templates List */}
        {templates.length === 0 ? (
          <p className="text-sm text-slate-600">
            {locale === 'fr' 
              ? 'Aucun template sauvegardé. Remplissez le formulaire et cliquez sur "Nouveau template".'
              : 'No saved templates. Fill the form and click "New template".'}
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map(template => (
              <div
                key={template.id}
                className="p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-300 transition-colors"
              >
                {editingTemplateId === template.id ? (
                  // Edit name mode
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTemplateName(template.id)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingTemplateId(null)
                        setEditName('')
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                      <p className="text-xs text-slate-500">{template.title}</p>
                    </button>
                    <div className="flex items-center gap-1">
                      {/* Update content button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateTemplateContent(template.id)}
                        className="h-8 px-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        title={locale === 'fr' ? 'Mettre à jour avec le formulaire actuel' : 'Update with current form'}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        <span className="text-xs hidden sm:inline">
                          {locale === 'fr' ? 'Mettre à jour' : 'Update'}
                        </span>
                      </Button>
                      {/* Edit name button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingName(template)}
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        title={locale === 'fr' ? 'Modifier le nom' : 'Edit name'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title={locale === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help text */}
        {templates.length > 0 && (
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
            💡 {locale === 'fr' 
              ? 'Cliquez sur un template pour pré-remplir le formulaire. Utilisez "Mettre à jour" pour sauvegarder les modifications du formulaire dans le template.'
              : 'Click a template to fill the form. Use "Update" to save form changes to the template.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
