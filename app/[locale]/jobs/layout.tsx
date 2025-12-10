import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talenthub.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  const title = locale === 'fr' ? 'Offres d\'emploi' : 'Job Offers'
  const description = locale === 'fr'
    ? 'Parcourez des milliers d\'offres d\'emploi. Filtrez par lieu, type de contrat, salaire et plus. Trouvez votre prochain emploi sur OceanicJob.'
    : 'Browse thousands of job offers. Filter by location, contract type, salary and more. Find your next job on OceanicJob.'

  return {
    title,
    description,
    keywords: locale === 'fr'
      ? ['offres emploi', 'recherche emploi', 'jobs', 'carrière', 'recrutement', 'embauche']
      : ['job offers', 'job search', 'jobs', 'career', 'recruitment', 'hiring'],
    openGraph: {
      title: `${title} | OceanicJob`,
      description,
      url: `${siteUrl}/${locale}/jobs`,
      type: 'website',
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/jobs`,
      languages: {
        fr: `${siteUrl}/fr/jobs`,
        en: `${siteUrl}/en/jobs`,
      },
    },
  }
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
