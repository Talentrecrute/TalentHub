import JobCard from '@/components/jobs/JobCard'
import { Button } from "@/components/ui/button"
import { Link } from '@/i18n/routing'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowRight, Briefcase, Building2, Search, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'

async function getLatestJobs() {
  return await prisma.job.findMany({
    where: { status: 'OPEN' },
    include: { 
      company: true,
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  })
}

async function getStats() {
  const [jobCount, companyCount, candidateCount] = await Promise.all([
    prisma.job.count({ where: { status: 'OPEN' } }),
    prisma.company.count(),
    prisma.user.count({ where: { role: 'CANDIDATE' } })
  ])
  return { jobCount, companyCount, candidateCount }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('homepage')
  const tJobs = await getTranslations('jobs')
  const tNav = await getTranslations('nav')
  const jobs = await getLatestJobs()
  const stats = await getStats()

  const isEmployer = session?.user?.role === 'EMPLOYER'
  const isCandidate = session?.user?.role === 'CANDIDATE'

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8">
                  {tJobs('findJob')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!isCandidate && (
                <Link href="/employer/post-job">
                  <Button size="lg" variant="outline" className="border-white text-blue-900 hover:bg-blue-50 px-8">
                    {t('startHiring')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Briefcase className="w-10 h-10 text-teal-600 mb-3" />
              <span className="text-4xl font-bold text-slate-900">{stats.jobCount}+</span>
              <span className="text-slate-600">{t('stats.jobs')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Building2 className="w-10 h-10 text-teal-600 mb-3" />
              <span className="text-4xl font-bold text-slate-900">{stats.companyCount}+</span>
              <span className="text-slate-600">{t('stats.companies')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-10 h-10 text-teal-600 mb-3" />
              <span className="text-4xl font-bold text-slate-900">{stats.candidateCount}+</span>
              <span className="text-slate-600">{t('stats.candidates')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">{t('latestJobs')}</h2>
            <Link href="/jobs" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1">
              {t('viewAllJobs')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                company={job.company}
                applicationCount={job._count.applications}
                showActions={true}
              />
            ))}
          </div>
          
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">{tJobs('noJobsFound')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Personalized based on user type */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isCandidate ? (
            // CTA for Candidates - Find jobs
            <>
              <h2 className="text-3xl font-bold mb-4">{tJobs('findJob')}</h2>
              <p className="text-xl text-teal-100 mb-8">{t('heroSubtitle')}</p>
              <Link href="/jobs">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8">
                  <Search className="mr-2 w-5 h-5" />
                  {tJobs('findJob')}
                </Button>
              </Link>
            </>
          ) : (
            // CTA for Employers or non-authenticated users
            <>
              <h2 className="text-3xl font-bold mb-4">{t('forEmployers')}</h2>
              <p className="text-xl text-teal-100 mb-8">{t('postJobCta')}</p>
              <Link href="/employer/post-job">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8">
                  {t('startHiring')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
