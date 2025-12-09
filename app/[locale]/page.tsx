import {
    AnimatedButton,
    AnimatedCTA,
    AnimatedHero,
    AnimatedJobCard,
    AnimatedJobsGrid,
    AnimatedStat,
    AnimatedTitle,
    FloatingShapes
} from '@/components/animations/HomeAnimations'
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
      {/* Hero Section with Animations */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-20 overflow-hidden">
        <FloatingShapes />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedHero>
            <div className="text-center max-w-3xl mx-auto">
              <AnimatedTitle className="text-4xl md:text-6xl font-bold mb-6">
                {t('heroTitle')}
              </AnimatedTitle>
              <p className="text-xl text-blue-100 mb-8">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton>
                  <Link href="/jobs">
                    <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 shadow-lg shadow-blue-900/30">
                      {tJobs('findJob')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </AnimatedButton>
                {!isCandidate && (
                  <AnimatedButton>
                    <Link href="/employer/post-job">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                        {t('startHiring')}
                      </Button>
                    </Link>
                  </AnimatedButton>
                )}
              </div>
            </div>
          </AnimatedHero>
        </div>
        
        {/* Animated wave at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path 
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats with Animations */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedStat 
              icon={<Briefcase className="w-10 h-10 text-teal-600 mb-3" />}
              value={stats.jobCount}
              label={t('stats.jobs')}
              delay={0}
            />
            <AnimatedStat 
              icon={<Building2 className="w-10 h-10 text-teal-600 mb-3" />}
              value={stats.companyCount}
              label={t('stats.companies')}
              delay={0.1}
            />
            <AnimatedStat 
              icon={<Users className="w-10 h-10 text-teal-600 mb-3" />}
              value={stats.candidateCount}
              label={t('stats.candidates')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Latest Jobs with Animations */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">{t('latestJobs')}</h2>
            <Link href="/jobs" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 group">
              {t('viewAllJobs')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <AnimatedJobsGrid>
            {jobs.map(job => (
              <AnimatedJobCard key={job.id}>
                <JobCard
                  job={job}
                  company={job.company}
                  applicationCount={job._count.applications}
                  showActions={true}
                />
              </AnimatedJobCard>
            ))}
          </AnimatedJobsGrid>
          
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">{tJobs('noJobsFound')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Animations */}
      <section className="relative py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedCTA>
            {isCandidate ? (
              <>
                <h2 className="text-3xl font-bold mb-4">{tJobs('findJob')}</h2>
                <p className="text-xl text-teal-100 mb-8">{t('heroSubtitle')}</p>
                <AnimatedButton className="inline-block">
                  <Link href="/jobs">
                    <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8 shadow-lg">
                      <Search className="mr-2 w-5 h-5" />
                      {tJobs('findJob')}
                    </Button>
                  </Link>
                </AnimatedButton>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">{t('forEmployers')}</h2>
                <p className="text-xl text-teal-100 mb-8">{t('postJobCta')}</p>
                <AnimatedButton className="inline-block">
                  <Link href="/employer/post-job">
                    <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8 shadow-lg">
                      {t('startHiring')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </AnimatedButton>
              </>
            )}
          </AnimatedCTA>
        </div>
      </section>
    </div>
  )
}
