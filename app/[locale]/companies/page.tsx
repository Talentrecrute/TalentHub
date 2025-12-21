import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import CompaniesClient from './CompaniesClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'companies' })
  
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

async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: { 
          jobs: {
            where: { status: 'OPEN' }
          }
        }
      },
      jobs: {
        where: { status: 'OPEN' },
        select: {
          category: true,
          employmentType: true,
        },
        take: 5
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Filter to only show companies with at least 1 open job
  return companies.filter(c => c._count.jobs > 0)
}

export default async function CompaniesPage() {
  const companies = await getCompanies()
  
  return <CompaniesClient companies={companies} />
}
