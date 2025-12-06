import CompanyAvatar from '@/components/CompanyAvatar'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
    ArrowLeft,
    Briefcase,
    Building2,
    CheckCircle2,
    DollarSign,
    MapPin
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import ApplyButton from './ApplyButton'
import EmployerJobActions from './EmployerJobActions'
import SaveButton from './SaveButton'

async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
    }
  })

  if (!job) return null

  // Parse JSON fields
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

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    notFound()
  }

  const [application, isSaved, similarJobs] = await Promise.all([
    getApplication(id, session?.user?.id),
    getSavedStatus(id, session?.user?.id),
    getSimilarJobs(job.category, id)
  ])

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    
    // Map common invalid currency names to valid ISO codes
    const currencyMap: Record<string, string> = {
      'Euros': 'EUR',
      'Dollars': 'USD',
      'euros': 'EUR',
      'dollars': 'USD'
    }
    
    // Normalize currency code
    const normalizedCurrency = currencyMap[job.salaryCurrency] || job.salaryCurrency || 'USD'
    
    // Validate currency code (should be 3 uppercase letters)
    const isValidCurrency = /^[A-Z]{3}$/.test(normalizedCurrency)
    const safeCurrency = isValidCurrency ? normalizedCurrency : 'USD'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0
    })
    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`
    }
    if (job.salaryMin) return `From ${formatter.format(job.salaryMin)}`
    return `Up to ${formatter.format(job.salaryMax!)}`
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

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
                        {job.locationType}
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
                      {job.employmentType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Role</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">Responsibilities</h3>
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
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">Requirements</h3>
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
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">Benefits</h3>
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About {job.company.name}</h2>
                    <p className="text-slate-600 mb-4">{job.company.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {job.company.industry && (
                        <div>
                          <span className="text-slate-500">Industry</span>
                          <p className="font-medium text-slate-900">{job.company.industry}</p>
                        </div>
                      )}
                      {job.company.size && (
                        <div>
                          <span className="text-slate-500">Company Size</span>
                          <p className="font-medium text-slate-900">{job.company.size}</p>
                        </div>
                      )}
                      {job.company.location && (
                        <div>
                          <span className="text-slate-500">Location</span>
                          <p className="font-medium text-slate-900">{job.company.location}</p>
                        </div>
                      )}
                      {job.company.website && (
                        <div>
                          <span className="text-slate-500">Website</span>
                          <a 
                            href={job.company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-teal-600 hover:text-teal-700"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
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
                    // Show employer actions for job owner
                    <EmployerJobActions
                      jobId={job.id}
                      jobStatus={job.status}
                      employerId={job.company.employerId}
                      currentUserId={session.user.id}
                    />
                  ) : session?.user?.role === 'EMPLOYER' ? (
                    // Hide apply button for employers viewing other jobs
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-600">
                        Les employeurs ne peuvent pas postuler aux offres.
                      </p>
                    </div>
                  ) : (
                    // Show apply/save buttons for candidates
                    <>
                      <ApplyButton
                        jobId={job.id}
                        hasApplied={!!application}
                        applicationStatus={application?.status}
                        isAuthenticated={!!session}
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
                </CardContent>
              </Card>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Similar Jobs</h3>
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
