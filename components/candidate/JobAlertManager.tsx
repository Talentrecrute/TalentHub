'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { JobAlert } from '@prisma/client'
import { Bell, BellOff, Plus, Trash2, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function JobAlertManager() {
  const locale = useLocale()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    category: '',
    location: '',
    locationType: ''
  })

  const categories = [
    { value: '', label: locale === 'fr' ? 'Toutes' : 'All' },
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'design', label: 'Design' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'RH' },
    { value: 'engineering', label: 'Engineering' },
  ]

  const locationTypes = [
    { value: '', label: locale === 'fr' ? 'Tous' : 'All' },
    { value: 'remote', label: locale === 'fr' ? 'Remote' : 'Remote' },
    { value: 'onsite', label: locale === 'fr' ? 'Sur site' : 'On-site' },
    { value: 'hybrid', label: 'Hybride' },
  ]

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/candidate/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error(locale === 'fr' ? 'Nom requis' : 'Name required')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/candidate/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Alerte créée !' : 'Alert created!')
        setShowForm(false)
        setFormData({ name: '', keywords: '', category: '', location: '', locationType: '' })
        fetchAlerts()
      } else {
        throw new Error('Failed to create')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur lors de la création' : 'Creation failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (alert: JobAlert) => {
    try {
      const response = await fetch(`/api/candidate/alerts/${alert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...alert, isActive: !alert.isActive })
      })

      if (response.ok) {
        toast.success(alert.isActive 
          ? (locale === 'fr' ? 'Alerte désactivée' : 'Alert disabled')
          : (locale === 'fr' ? 'Alerte activée' : 'Alert enabled')
        )
        fetchAlerts()
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fr' ? 'Supprimer cette alerte ?' : 'Delete this alert?')) {
      return
    }

    try {
      const response = await fetch(`/api/candidate/alerts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(locale === 'fr' ? 'Alerte supprimée' : 'Alert deleted')
        fetchAlerts()
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            {locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">
              {locale === 'fr' ? 'Alertes emploi' : 'Job Alerts'}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            <Plus className="w-4 h-4 mr-1" />
            {locale === 'fr' ? 'Nouvelle alerte' : 'New alert'}
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="p-4 bg-white rounded-lg border border-blue-200 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">{locale === 'fr' ? "Nom de l'alerte" : 'Alert name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={locale === 'fr' ? 'Ex: Dev Remote' : 'Ex: Remote Dev'}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">{locale === 'fr' ? 'Mots-clés' : 'Keywords'}</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="React, Node.js..."
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">{locale === 'fr' ? 'Catégorie' : 'Category'}</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">{locale === 'fr' ? 'Type de lieu' : 'Location type'}</Label>
                <select
                  value={formData.locationType}
                  onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                  className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md"
                >
                  {locationTypes.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  locale === 'fr' ? 'Créer' : 'Create'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-600">
            {locale === 'fr' 
              ? 'Aucune alerte. Créez une alerte pour être notifié des nouvelles offres.'
              : 'No alerts. Create an alert to be notified of new jobs.'}
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-colors ${
                  alert.isActive ? 'border-blue-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm">{alert.name}</p>
                    {!alert.isActive && (
                      <span className="text-xs text-slate-500">
                        ({locale === 'fr' ? 'désactivée' : 'disabled'})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {alert.keywords && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        🔍 {alert.keywords}
                      </span>
                    )}
                    {alert.category && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        📁 {alert.category}
                      </span>
                    )}
                    {alert.locationType && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        📍 {alert.locationType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(alert)}
                    className={`h-8 w-8 p-0 ${alert.isActive ? 'text-blue-500' : 'text-slate-400'}`}
                    title={alert.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {alert.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(alert.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
          💡 {locale === 'fr' 
            ? 'Les alertes vérifient automatiquement les nouvelles offres correspondantes.'
            : 'Alerts automatically check for new matching jobs.'}
        </p>
      </CardContent>
    </Card>
  )
}
