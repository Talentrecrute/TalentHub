import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanic-job.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/employer/',
          '/applications/',
          '/profile/',
          '/admin/',
          '/actions/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/jobs/',
          '/companies/',
          '/blog/',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/employer/',
          '/applications/',
          '/profile/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/jobs/',
          '/companies/',
          '/blog/',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/employer/',
          '/applications/',
          '/profile/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
