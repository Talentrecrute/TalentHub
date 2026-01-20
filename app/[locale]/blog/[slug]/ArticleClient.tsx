'use client'

import ShareButton from '@/components/ShareButton'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import type { BlogPost, BlogPostMeta } from '@/lib/blog'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface ArticleClientProps {
  post: BlogPost
  relatedPosts: BlogPostMeta[]
}

export default function ArticleClient({ post, relatedPosts }: ArticleClientProps) {
  const t = useTranslations('blog')
  const [scrollProgress, setScrollProgress] = useState(0)
  
  // Reading progress bar with native scroll tracking
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
    }
    
    window.addEventListener('scroll', updateScrollProgress)
    updateScrollProgress() // Initial call
    
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 z-[9999] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      
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
            <Link href="/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToBlog')}
            </Link>
            
            <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-lg text-blue-100 mb-6">{post.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readingTime}
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
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-teal-600 prose-strong:text-slate-900">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-100">
                {post.tags.map(tag => (
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

            {/* Share */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100">
              <span className="text-sm text-slate-500">{t('shareArticle')}</span>
              <ShareButton 
                url={`/blog/${post.slug}`}
                title={post.title}
                description={post.description}
                variant="button"
              />
            </div>
          </motion.article>

          {/* Author Box */}
          <div className="bg-white rounded-xl p-6 mt-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{post.author}</p>
              <p className="text-sm text-slate-500">{t('authorBio')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">{t('relatedArticles')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <div className="bg-slate-50 rounded-xl p-5 hover:bg-slate-100 transition-colors group">
                    <span className="text-xs text-teal-600 font-medium">{relatedPost.category}</span>
                    <h3 className="font-semibold text-slate-900 mt-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {relatedPost.readingTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-teal-100 mb-6">{t('ctaSubtitle')}</p>
          <Link href="/jobs">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
              {t('browseJobs')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
