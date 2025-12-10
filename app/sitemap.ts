import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talenthub.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0 },
    { url: '/jobs', priority: 0.9 },
    { url: '/auth/login', priority: 0.7 },
    { url: '/auth/register', priority: 0.7 },
  ]

  // Generate sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static pages for both locales
  const locales = ['fr', 'en']
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${page.url}`,
        lastModified: new Date(),
        changeFrequency: page.url === '' ? 'daily' : 'weekly',
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

  // Add job pages
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

  return sitemapEntries
}
