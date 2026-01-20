import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanic-job.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['fr', 'en']
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Get all open jobs
  const jobs = await prisma.job.findMany({
    where: { status: 'OPEN' },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Get all companies
  const companies = await prisma.company.findMany({
    select: { id: true, updatedAt: true },
  })

  // Get all published blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  })

  // Static pages with priorities
  const staticPages = [
    { url: '', priority: 1.0, changeFreq: 'daily' as const },
    { url: '/jobs', priority: 0.9, changeFreq: 'hourly' as const },
    { url: '/companies', priority: 0.8, changeFreq: 'daily' as const },
    { url: '/blog', priority: 0.8, changeFreq: 'daily' as const },
    { url: '/about', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/contact', priority: 0.6, changeFreq: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
    { url: '/auth/signin', priority: 0.5, changeFreq: 'monthly' as const },
    { url: '/auth/signup', priority: 0.5, changeFreq: 'monthly' as const },
  ]

  // Add static pages for both locales
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${page.url}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: {
            fr: `${siteUrl}/fr${page.url}`,
            en: `${siteUrl}/en${page.url}`,
          },
        },
      })
    }
  }

  // Add job pages (high priority - main content)
  for (const job of jobs) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/jobs/${job.id}`,
        lastModified: job.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
        alternates: {
          languages: {
            fr: `${siteUrl}/fr/jobs/${job.id}`,
            en: `${siteUrl}/en/jobs/${job.id}`,
          },
        },
      })
    }
  }

  // Add company pages
  for (const company of companies) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/companies/${company.id}`,
        lastModified: company.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            fr: `${siteUrl}/fr/companies/${company.id}`,
            en: `${siteUrl}/en/companies/${company.id}`,
          },
        },
      })
    }
  }

  // Add blog post pages
  for (const post of blogPosts) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            fr: `${siteUrl}/fr/blog/${post.slug}`,
            en: `${siteUrl}/en/blog/${post.slug}`,
          },
        },
      })
    }
  }

  return sitemapEntries
}
