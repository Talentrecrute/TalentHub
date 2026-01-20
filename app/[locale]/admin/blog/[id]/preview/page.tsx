'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Edit2, Eye, Tag, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  content: string
  image?: string
  category: string
  tags: string | null
  locale: string
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
  author: { name: string; image?: string }
}

export default function AdminPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data.post)
      } else {
        setError('Article non trouvé')
      }
    } catch (error) {
      setError('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return []
    try {
      return JSON.parse(tags)
    } catch {
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || 'Article non trouvé'}</p>
        <Link href="/admin/blog">
          <Button variant="outline">Retour aux articles</Button>
        </Link>
      </div>
    )
  }

  const tags = parseTags(post.tags)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-medium sticky top-0 z-50">
        <Eye className="w-4 h-4 inline mr-2" />
        Mode prévisualisation - {post.status === 'DRAFT' ? 'BROUILLON' : 'PUBLIÉ'}
        <Link href={`/admin/blog/${post.id}/edit`} className="ml-4 underline hover:no-underline">
          <Edit2 className="w-3 h-3 inline mr-1" />
          Modifier
        </Link>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/admin/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux articles
            </Link>
            
            <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg text-blue-100 mb-6">{post.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author.name || 'Admin'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-sm"
          >
            {/* Featured Image */}
            {post.image && (
              <div className="relative h-64 md:h-80 -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8 rounded-t-2xl overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-teal-600 prose-strong:text-slate-900">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-100">
                {tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>

          {/* Author Box */}
          <div className="bg-white rounded-xl p-6 mt-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {(post.author.name || 'A').charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{post.author.name || 'Admin'}</p>
              <p className="text-sm text-slate-500">Auteur</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
