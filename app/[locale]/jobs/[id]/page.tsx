import CompanyAvatar from '@/components/CompanyAvatar'
import ExportPdfButton from '@/components/jobs/ExportPdfButton'
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    Briefcase,
    Building2,
    CheckCircle2,
    DollarSign,
    MapPin,
    Users
} from 'lucide-react'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import ApplyButton from './ApplyButton'
import EmployerJobActions from './EmployerJobActions'
import SaveButton from './SaveButton'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanic-job.com'

// Generate dynamic SEO metadata for each job
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}): Promise<Metadata> {
  const { id, locale } = await params
  
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true }
  })

  if (!job) {
    return {
      title: locale === 'fr' ? 'Offre non trouvée' : 'Job Not Found',
    }
  }

  const title = job.title
  const company = job.company?.name || 'Company'
  const description = job.description.substring(0, 160) + '...'
  const fullTitle = `${title} - ${company}`

  return {
    title: fullTitle,
    description,
    keywords: [job.category, job.location, job.employmentType, company, 'emploi', 'job'],
    openGraph: {
      type: 'article',
      title: fullTitle,
      description,
      url: `${siteUrl}/${locale}/jobs/${id}`,
      siteName: 'OceanicJob',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: job.company?.logo ? [
        {
          url: job.company.logo,
          width: 200,
          height: 200,
          alt: company,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/jobs/${id}`,
      languages: {
        fr: `${siteUrl}/fr/jobs/${id}`,
        en: `${siteUrl}/en/jobs/${id}`,
      },
    },
  }
}


async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
    }
  })

  if (!job) return null

  return {
    ...job,
    requirements: job.requirements ? JSON.parse(job.requirements) : [],
    responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
    benefits: job.benefits ? JSON.parse(job.benefits) : []
  }
}

async function getApplication(jobId: string, userId?: string) {
  if (!userId) return null
  
  return await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId,
        candidateId: userId
      }
    }
  })
}

async function getSavedStatus(jobId: string, userId?: string) {
  if (!userId) return false
  
  const saved = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId
      }
    }
  })
  
  return !!saved
}

async function getSimilarJobs(category: string, excludeId: string) {
  return await prisma.job.findMany({
    where: {
      status: 'OPEN',
      category,
      id: { not: excludeId }
    },
    include: {
      company: true
    },
    take: 3,
    orderBy: {
      createdAt: 'desc'
    }
  })
}

async function getJobApplications(jobId: string, employerId: string) {
  const job = await prisma.job.findFirst({
    where: { 
      id: jobId,
      company: { employerId }
    }
  })
  
  if (!job) return null
  
  return await prisma.application.findMany({
    where: { jobId },
    include: {
      candidate: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const session = await getServerSession(authOptions)
  const { id, locale } = await params
  const job = await getJob(id)
  
  const t = await getTranslations('jobs')
  const tCommon = await getTranslations('common')
  const tStatus = await getTranslations('status')
  const tApps = await getTranslations('applications')
  const tProfile = await getTranslations('profile')

  if (!job) {
    notFound()
  }

  const [application, isSaved, similarJobs] = await Promise.all([
    getApplication(id, session?.user?.id),
    getSavedStatus(id, session?.user?.id),
    getSimilarJobs(job.category, id)
  ])

  const isJobOwner = session?.user?.role === 'EMPLOYER' && session?.user?.id === job.company?.employerId
  const jobApplications = isJobOwner && session?.user?.id
    ? await getJobApplications(id, session.user.id)
    : null

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    
    const currencyMap: Record<string, string> = {
      'Euros': 'EUR',
      'Dollars': 'USD',
      'euros': 'EUR',
      'dollars': 'USD'
    }
    
    const normalizedCurrency = currencyMap[job.salaryCurrency] || job.salaryCurrency || 'EUR'
    const isValidCurrency = /^[A-Z]{3}$/.test(normalizedCurrency)
    const safeCurrency = isValidCurrency ? normalizedCurrency : 'EUR'
    
    const formatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0
    })
    
    const periodSuffix = (job as any).salaryPeriod === 'yearly'
      ? (locale === 'fr' ? '/an' : '/yr')
      : (locale === 'fr' ? '/mois' : '/mo')
    
    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}${periodSuffix}`
    }
    if (job.salaryMin) return `${formatter.format(job.salaryMin)}+${periodSuffix}`
    return `${t('upTo')} ${formatter.format(job.salaryMax!)}${periodSuffix}`
  }
  
  const getExperienceLabel = () => {
    const level = (job as any).experienceLevel
    if (!level) return null
    const labels: Record<string, { fr: string; en: string }> = {
      entry: { fr: 'Débutant', en: 'Entry Level' },
      mid: { fr: 'Intermédiaire', en: 'Mid-Level' },
      senior: { fr: 'Senior', en: 'Senior' },
      lead: { fr: 'Lead', en: 'Lead' },
      executive: { fr: 'Directeur', en: 'Executive' }
    }
    return labels[level] ? labels[level][locale as 'fr' | 'en'] : level
  }

  // JSON-LD structured data for job posting
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.expiresAt?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.employmentType.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.name || 'Company',
      logo: job.company?.logo || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
      }
    },
    ...(job.salaryMin || job.salaryMax ? {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency || 'EUR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: (job as any).salaryPeriod === 'yearly' ? 'YEAR' : 'MONTH',
        }
      }
    } : {}),
    jobLocationType: job.locationType === 'remote' ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: job.locationType === 'remote' ? {
      '@type': 'Country',
      name: 'Worldwide'
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs 
              items={[
                { label: t('findJob'), href: '/jobs' },
                { label: job.title }
              ]} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4 flex-1">
                      <CompanyAvatar 
                        companyName={job.company?.name || 'Company'}
                        logoUrl={job.company?.logo}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-5 h-5" />
                          <span className="text-lg font-medium">{job.company?.name || 'Company'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span>{job.location}</span>
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200 capitalize">
                        {job.locationType === 'remote' ? t('remote') : 
                         job.locationType === 'onsite' ? t('onsite') : t('hybrid')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                    </div>
                    {formatSalary() && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{formatSalary()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">{job.category}</Badge>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 capitalize">
                      {job.employmentType.replace('-', ' ')}
                    </Badge>
                    {getExperienceLabel() && (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                        {getExperienceLabel()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Details Card */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {locale === 'fr' ? 'Détails du poste' : 'Job Details'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {locale === 'fr' ? 'Lieu' : 'Location'}
                      </p>
                      <p className="font-medium text-slate-900">{job.location}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {locale === 'fr' ? 'Type de travail' : 'Work Type'}
                      </p>
                      <p className="font-medium text-slate-900">
                        {job.locationType === 'remote' ? (locale === 'fr' ? 'Télétravail' : 'Remote') :
                         job.locationType === 'hybrid' ? (locale === 'fr' ? 'Hybride' : 'Hybrid') :
                         (locale === 'fr' ? 'Sur site' : 'On-site')}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {locale === 'fr' ? 'Type de contrat' : 'Employment Type'}
                      </p>
                      <p className="font-medium text-slate-900 capitalize">
                        {job.employmentType.replace('-', ' ')}
                      </p>
                    </div>
                    {getExperienceLabel() && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          {locale === 'fr' ? 'Niveau d\'expérience' : 'Experience Level'}
                        </p>
                        <p className="font-medium text-slate-900">{getExperienceLabel()}</p>
                      </div>
                    )}
                    {formatSalary() && (
                      <div className="p-3 bg-teal-50 rounded-lg">
                        <p className="text-xs text-teal-600 uppercase tracking-wide mb-1">
                          {locale === 'fr' ? 'Salaire' : 'Salary'}
                        </p>
                        <p className="font-semibold text-teal-700">{formatSalary()}</p>
                      </div>
                    )}
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {locale === 'fr' ? 'Catégorie' : 'Category'}
                      </p>
                      <p className="font-medium text-slate-900">{job.category}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {locale === 'fr' ? 'Publié le' : 'Posted'}
                      </p>
                      <p className="font-medium text-slate-900">
                        {new Date(job.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('description')}</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('responsibilities')}</h3>
                      <ul className="space-y-2">
                        {job.responsibilities.map((resp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('requirements')}</h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('benefits')}</h3>
                      <ul className="space-y-2">
                        {job.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Info */}
              {job.company && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('about')} {job.company.name}</h2>
                    <p className="text-slate-600 mb-4">{job.company.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {job.company.industry && (
                        <div>
                          <span className="text-slate-500">{t('industry')}</span>
                          <p className="font-medium text-slate-900">{job.company.industry}</p>
                        </div>
                      )}
                      {job.company.size && (
                        <div>
                          <span className="text-slate-500">{t('companySize')}</span>
                          <p className="font-medium text-slate-900">{job.company.size}</p>
                        </div>
                      )}
                      {job.company.location && (
                        <div>
                          <span className="text-slate-500">{t('location')}</span>
                          <p className="font-medium text-slate-900">{job.company.location}</p>
                        </div>
                      )}
                      {job.company.website && (
                        <div>
                          <span className="text-slate-500">{tProfile('website')}</span>
                          <a 
                            href={job.company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-teal-600 hover:text-teal-700"
                          >
                            {t('visitWebsite')}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* View Company Profile Button */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <Link href={`/companies/${job.company.id}`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Building2 className="w-4 h-4" />
                          {locale === 'fr' ? 'Voir le profil de l\'entreprise' : 'View company profile'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Applications for this job (only for job owner) */}
              {isJobOwner && jobApplications && jobApplications.length > 0 && (
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        {tApps('title')} ({jobApplications.length})
                      </h2>
                      <Link href="/employer/applications">
                        <Button variant="outline" size="sm">
                          {tCommon('viewAll')}
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {jobApplications.map((app) => (
                        <Link 
                          key={app.id} 
                          href={`/employer/applications/${app.id}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {app.candidate.name?.[0]?.toUpperCase() || app.candidate.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {app.candidate.name || app.candidate.email}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {new Date(app.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusColors[app.status]} variant="outline">
                              {tStatus(app.status.toLowerCase() as any)}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply/Employer Actions Card */}
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  {session?.user?.role === 'EMPLOYER' && session.user.id === job.company.employerId ? (
                    <EmployerJobActions
                      jobId={job.id}
                      jobStatus={job.status}
                      employerId={job.company.employerId}
                      currentUserId={session.user.id}
                    />
                  ) : session?.user?.role === 'EMPLOYER' ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-600">
                        {locale === 'fr' 
                          ? "Les employeurs ne peuvent pas postuler aux offres."
                          : "Employers cannot apply to job listings."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <ApplyButton
                        jobId={job.id}
                        jobTitle={job.title}
                        companyName={job.company.name}
                        hasApplied={!!application}
                        applicationStatus={application?.status}
                        isAuthenticated={!!session}
                        candidateName={session?.user?.name || undefined}
                      />
                      {!application && (
                        <div className="mt-4">
                          <SaveButton
                            jobId={job.id}
                            isSaved={isSaved}
                            isAuthenticated={!!session}
                          />
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* PDF Export */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <ExportPdfButton 
                      job={{
                        title: job.title,
                        company: job.company?.name || 'Company',
                        location: job.location,
                        locationType: job.locationType,
                        employmentType: job.employmentType,
                        category: job.category,
                        experienceLevel: (job as any).experienceLevel,
                        salaryMin: job.salaryMin,
                        salaryMax: job.salaryMax,
                        salaryCurrency: job.salaryCurrency,
                        description: job.description,
                        requirements: job.requirements,
                        responsibilities: job.responsibilities,
                        benefits: job.benefits,
                        createdAt: job.createdAt
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">{t('similarJobs')}</h3>
                    <div className="space-y-3">
                      {similarJobs.map(similarJob => (
                        <Link
                          key={similarJob.id}
                          href={`/jobs/${similarJob.id}`}
                          className="block p-4 border border-slate-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                        >
                          <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                            {similarJob.title}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {similarJob.company?.name || 'Company'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{similarJob.location}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  )
}
