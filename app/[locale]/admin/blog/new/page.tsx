'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Dynamic import for MDEditor (no SSR)
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

const categories = [
  'Conseils CV',
  'Entretien',
  'Marché de l\'emploi',
  'Développement personnel',
  'Télétravail',
  'Salaires',
  'Formation',
  'Autre'
]

export default function NewArticlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '## Votre article\n\nCommencez à écrire ici...',
    category: 'Conseils CV',
    tags: '',
    image: '',
    locale: 'fr',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  })

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title || !formData.description || !formData.content) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: publish ? 'PUBLISHED' : 'DRAFT',
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (res.ok) {
        router.push('/admin/blog')
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">Nouvel article</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer brouillon
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Publier
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Le titre de votre article"
                className="text-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Une courte description pour le SEO"
              />
            </div>

            {/* Markdown Editor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contenu *
              </label>
              <div data-color-mode="light" className="rounded-lg overflow-hidden border border-slate-200">
                <MDEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val || '' })}
                  height={500}
                  preview="live"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Utilisez Markdown pour formater: **gras**, *italique*, ## Titres, - listes...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tags (séparés par des virgules)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="CV, Carrière, Emploi"
              />
            </div>

            {/* Image */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Image (URL)
              </label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              {formData.image && (
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="mt-3 rounded-lg w-full h-32 object-cover"
                />
              )}
            </div>

            {/* Locale */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Langue
              </label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Tips */}
            <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
              <h3 className="font-medium text-teal-900 mb-2">💡 Conseils</h3>
              <ul className="text-sm text-teal-700 space-y-1">
                <li>• Utilisez des titres (##) pour structurer</li>
                <li>• Ajoutez des listes pour la lisibilité</li>
                <li>• Incluez des emojis pour dynamiser 🎯</li>
                <li>• Prévisualisez avant de publier</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
