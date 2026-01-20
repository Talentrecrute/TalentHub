'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Eye, Loader2, Save, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

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

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Conseils CV',
    tags: '',
    image: '',
    locale: 'fr',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  })

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`)
      if (res.ok) {
        const data = await res.json()
        const post = data.post
        
        // Parse tags safely
        let tagsString = ''
        if (post.tags) {
          try {
            const parsed = JSON.parse(post.tags)
            tagsString = Array.isArray(parsed) ? parsed.join(', ') : ''
          } catch {
            tagsString = ''
          }
        }
        
        setFormData({
          title: post.title,
          description: post.description,
          content: post.content,
          category: post.category,
          tags: tagsString,
          image: post.image || '',
          locale: post.locale,
          status: post.status
        })
      } else {
        setError('Article non trouvé')
      }
    } catch (error) {
      console.error('Error loading post:', error)
      setError('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title || !formData.description || !formData.content) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: publish ? 'PUBLISHED' : formData.status,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (res.ok) {
        router.push('/admin/blog')
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/blog')
      }
    } catch (error) {
      setError('Erreur lors de la suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
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
              <h1 className="text-xl font-bold text-slate-900">Modifier l'article</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${
                formData.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {formData.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              {formData.status === 'DRAFT' && (
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => handleSubmit(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Publier
                </Button>
              )}
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Le titre de votre article"
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Une courte description pour le SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contenu *</label>
              <div data-color-mode="light" className="rounded-lg overflow-hidden border border-slate-200">
                <MDEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val || '' })}
                  height={500}
                  preview="live"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="CV, Carrière, Emploi"
              />
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Image (URL)</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-3 rounded-lg w-full h-32 object-cover" />
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">Langue</label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
