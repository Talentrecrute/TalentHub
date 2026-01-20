import { getAllCategories, getAllPosts } from '@/lib/blog'
import { getTranslations } from 'next-intl/server'
import BlogClient from './BlogClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  }
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params
  const posts = await getAllPosts(locale)
  const categories = await getAllCategories(locale)
  
  return <BlogClient posts={posts} categories={categories} />
}
