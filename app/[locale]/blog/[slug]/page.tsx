import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)
  
  if (!post) {
    return { title: 'Article not found' }
  }

  return {
    title: `${post.title} | OceanicJob Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

// Dynamic rendering for DB posts
export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: PageProps) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(slug, locale, 3)
  
  return <ArticleClient post={post} relatedPosts={relatedPosts} />
}
