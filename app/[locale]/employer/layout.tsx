import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talenthub.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  const title = locale === 'fr' ? 'Espace Employeur' : 'Employer Dashboard'
  const description = locale === 'fr'
    ? 'Gérez vos offres d\'emploi, suivez les candidatures et trouvez les meilleurs talents. Espace employeur TalentHub.'
    : 'Manage your job postings, track applications and find the best talent. TalentHub employer dashboard.'

  return {
    title,
    description,
    robots: {
      index: false, // Dashboard pages should not be indexed
      follow: false,
    },
    openGraph: {
      title: `${title} | TalentHub`,
      description,
      url: `${siteUrl}/${locale}/employer`,
      type: 'website',
    },
  }
}

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
