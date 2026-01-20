'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Bell,
    CheckCircle,
    Database,
    Globe,
    Mail,
    RefreshCw,
    Save,
    Server,
    Shield
} from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../AdminLayout'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Site settings (these would typically come from a database or config)
  const [settings, setSettings] = useState({
    siteName: 'OceanicJob',
    siteDescription: 'Trouvez le job de vos rêves à Madagascar',
    contactEmail: 'contact@oceanic-job.com',
    supportEmail: 'support@oceanic-job.com',
    maxApplicationsPerDay: 10,
    maxJobsPerEmployer: 50,
    enableEmailNotifications: true,
    enableAutoApproveJobs: false,
    maintenanceMode: false
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-600">Configuration de la plateforme</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? 'Enregistré !' : 'Enregistrer'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                Général
              </CardTitle>
              <CardDescription>Paramètres généraux du site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du site
                </label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <Input
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Emails
              </CardTitle>
              <CardDescription>Configuration des emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email de contact
                </label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email de support
                </label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Limits Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Limites
              </CardTitle>
              <CardDescription>Limites d'utilisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max candidatures/jour (par utilisateur)
                </label>
                <Input
                  type="number"
                  value={settings.maxApplicationsPerDay}
                  onChange={(e) => updateSetting('maxApplicationsPerDay', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max offres par employeur
                </label>
                <Input
                  type="number"
                  value={settings.maxJobsPerEmployer}
                  onChange={(e) => updateSetting('maxJobsPerEmployer', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Fonctionnalités
              </CardTitle>
              <CardDescription>Activer/désactiver des fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notifications email</p>
                  <p className="text-sm text-slate-500">Envoyer des emails de notification</p>
                </div>
                <button
                  onClick={() => updateSetting('enableEmailNotifications', !settings.enableEmailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.enableEmailNotifications ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span 
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.enableEmailNotifications ? 'translate-x-6' : ''
                    }`} 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Auto-approuver les offres</p>
                  <p className="text-sm text-slate-500">Publier les offres sans modération</p>
                </div>
                <button
                  onClick={() => updateSetting('enableAutoApproveJobs', !settings.enableAutoApproveJobs)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.enableAutoApproveJobs ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span 
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.enableAutoApproveJobs ? 'translate-x-6' : ''
                    }`} 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">Mode maintenance</p>
                  <p className="text-sm text-slate-500">Désactiver l'accès public au site</p>
                </div>
                <button
                  onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'
                  }`}
                >
                  <span 
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : ''
                    }`} 
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-slate-600" />
                Informations système
              </CardTitle>
              <CardDescription>État du système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Version</p>
                  <p className="text-lg font-semibold text-slate-900">1.0.0</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Environnement</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Développement'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Base de données</p>
                  <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Connectée
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Dernière mise à jour</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="lg:col-span-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Database className="w-5 h-5" />
                Zone dangereuse
              </CardTitle>
              <CardDescription>Actions irréversibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-900 mb-1">Vider le cache</h4>
                  <p className="text-sm text-red-700 mb-3">Supprimer tous les fichiers en cache</p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100">
                    Vider le cache
                  </Button>
                </div>
                <div className="flex-1 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-900 mb-1">Réinitialiser les statistiques</h4>
                  <p className="text-sm text-red-700 mb-3">Remettre à zéro tous les compteurs</p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
