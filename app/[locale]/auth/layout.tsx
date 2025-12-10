import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talenthub.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  const title = locale === 'fr' ? 'Connexion & Inscription' : 'Login & Register'
  const description = locale === 'fr'
    ? 'Connectez-vous ou créez un compte OceanicJob pour accéder à des milliers d\'offres d\'emploi ou poster vos annonces.'
    : 'Log in or create a OceanicJob account to access thousands of job offers or post your listings.'

  return {
    title,
    description,
    openGraph: {
      title: `${title} | OceanicJob`,
      description,
      url: `${siteUrl}/${locale}/auth`,
      type: 'website',
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/auth`,
      languages: {
        fr: `${siteUrl}/fr/auth`,
        en: `${siteUrl}/en/auth`,
      },
    },
  }
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
