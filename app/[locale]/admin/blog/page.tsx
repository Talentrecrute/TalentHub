'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { Calendar, Edit2, Eye, Loader2, PenSquare, Plus, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  content?: string
  image?: string
  category: string
  tags?: string
  status: 'DRAFT' | 'PUBLISHED'
  locale: string
  createdAt: string
  updatedAt: string
  author: { name: string; image?: string }
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all')
  
  // Preview Modal State
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status: newStatus })
      })
      
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === post.id ? { ...p, status: newStatus } : p
        ))
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handlePreview = async (postId: string) => {
    setIsLoadingPreview(true)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`)
      if (res.ok) {
        const data = await res.json()
        setPreviewPost(data.post)
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const closePreview = () => {
    setPreviewPost(null)
  }

  const parseTags = (tags: string | undefined): string[] => {
    if (!tags) return []
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.status === filter)

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
            <p className="text-slate-600">{posts.length} articles au total</p>
          </div>
          <Link href="/admin/blog/new">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'PUBLISHED', 'DRAFT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'PUBLISHED' ? 'Publiés' : 'Brouillons'}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <PenSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun article</h3>
            <p className="text-slate-600 mb-6">Commencez par créer votre premier article.</p>
            <Link href="/admin/blog/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Article</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Catégorie</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Statut</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-900">{post.title}</p>
                        <p className="text-sm text-slate-500 truncate max-w-md">{post.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview Modal */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Prévisualiser"
                          onClick={() => handlePreview(post.id)}
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        {/* Edit */}
                        <Link href={`/admin/blog/${post.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        {/* Toggle Status */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(post)}
                          title={post.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                        >
                          {post.status === 'PUBLISHED' ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-yellow-600" />
                          )}
                        </Button>
                        {/* Delete */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {(previewPost || isLoadingPreview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePreview}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-slate-900">Prévisualisation</span>
                {previewPost && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    previewPost.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {previewPost.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewPost && (
                  <Link href={`/admin/blog/${previewPost.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : previewPost ? (
                <div className="p-6 md:p-8">
                  {/* Image */}
                  {previewPost.image && (
                    <img 
                      src={previewPost.image} 
                      alt={previewPost.title}
                      className="w-full h-48 md:h-64 object-cover rounded-xl mb-6"
                    />
                  )}

                  {/* Category */}
                  <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
                    {previewPost.category}
                  </span>

                  {/* Title & Description */}
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    {previewPost.title}
                  </h1>
                  <p className="text-lg text-slate-600 mb-6">
                    {previewPost.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
                    <span>Par {previewPost.author.name || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(previewPost.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>

                  {/* Content */}
                  <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-teal-600">
                    <ReactMarkdown>{previewPost.content || ''}</ReactMarkdown>
                  </div>

                  {/* Tags */}
                  {parseTags(previewPost.tags).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200">
                      {parseTags(previewPost.tags).map(tag => (
                        <span 
                          key={tag}
                          className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
