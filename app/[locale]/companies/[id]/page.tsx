import JobCard from '@/components/jobs/JobCard'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Briefcase, Building2, ExternalLink, Globe, MapPin, Users } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

async function getCompanyWithJobs(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      jobs: {
        where: { status: 'OPEN' },
        include: {
          company: true,
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { jobs: true }
      }
    }
  })

  return company
}

export default async function CompanyProfilePage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations('companies')
  const tJobs = await getTranslations('jobs')

  const company = await getCompanyWithJobs(id)

  if (!company) {
    notFound()
  }

  // Company size labels
  const sizeLabels: Record<string, string> = {
    '1-10': locale === 'fr' ? '1-10 employés' : '1-10 employees',
    '11-50': locale === 'fr' ? '11-50 employés' : '11-50 employees',
    '51-200': locale === 'fr' ? '51-200 employés' : '51-200 employees',
    '201-500': locale === 'fr' ? '201-500 employés' : '201-500 employees',
    '501-1000': locale === 'fr' ? '501-1000 employés' : '501-1000 employees',
    '1000+': locale === 'fr' ? '1000+ employés' : '1000+ employees',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link 
            href="/companies" 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'fr' ? 'Retour aux entreprises' : 'Back to companies'}
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Company Logo */}
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="w-20 h-20 object-contain rounded-xl"
                />
              ) : (
                <Building2 className="w-12 h-12 text-blue-900" />
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-blue-100">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {company.industry}
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {sizeLabels[company.size] || company.size}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{company.jobs.length}</div>
                <div className="text-sm text-blue-200">
                  {locale === 'fr' ? 'Offres actives' : 'Active jobs'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{company._count.jobs}</div>
                <div className="text-sm text-blue-200">
                  {locale === 'fr' ? 'Total offres' : 'Total jobs'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'fr' ? 'À propos' : 'About'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p className="text-slate-600 whitespace-pre-line">{company.description}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    {locale === 'fr' ? 'Aucune description disponible' : 'No description available'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'fr' ? 'Informations' : 'Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.website && (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-teal-600 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}



                {company.location && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span>{company.location}</span>
                  </div>
                )}

                {company.industry && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <span>{company.industry}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Jobs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {locale === 'fr' 
                  ? `Offres d'emploi (${company.jobs.length})`
                  : `Job Openings (${company.jobs.length})`}
              </h2>
            </div>

            {company.jobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {locale === 'fr' ? 'Aucune offre active' : 'No active jobs'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {locale === 'fr' 
                      ? 'Cette entreprise n\'a pas d\'offres ouvertes pour le moment.'
                      : 'This company has no open positions at the moment.'}
                  </p>
                  <Link href="/jobs">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      {locale === 'fr' ? 'Explorer d\'autres offres' : 'Explore other jobs'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {company.jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    company={company}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
