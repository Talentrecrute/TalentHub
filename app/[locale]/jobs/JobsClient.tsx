'use client'

import { saveJob } from '@/app/actions/jobs'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Company, Job } from '@prisma/client'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface JobsClientProps {
  initialJobs: (Job & { company: Company; _count?: { applications: number } })[]
  savedJobIds: string[]
  userId?: string
}

export default function JobsClient({ initialJobs, savedJobIds, userId }: JobsClientProps) {
  const t = useTranslations('jobs')
  const tMessages = useTranslations('messages')
  const tErrors = useTranslations('errors')
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    location: '',
    remote: false,
    types: [] as string[],
    experienceLevels: [] as string[],
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [] as string[],
    salaryMin: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [localSavedJobs, setLocalSavedJobs] = useState<Set<string>>(new Set(savedJobIds))

  // Filter jobs based on search and filters
  const filteredJobs = initialJobs.filter(job => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch = 
        job.title?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search) ||
        job.company?.name?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }
    
    // Location filter
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    
    // Remote filter
    if (filters.remote && job.locationType !== 'remote') return false
    
    // Job type filter
    if (filters.types.length > 0 && !filters.types.includes(job.employmentType)) return false
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(job.category)) return false
    
    // Salary filter
    if (filters.salaryMin > 0 && (job.salaryMax || 0) < filters.salaryMin) return false
    
    return true
  })

  const handleSaveJob = async (jobId: string) => {
    if (!userId) {
      toast.error(tErrors('unauthorized'))
      return
    }

    try {
      const result = await saveJob(jobId)
      
      setLocalSavedJobs(prev => {
        const newSet = new Set(prev)
        if (result.saved) {
          newSet.add(jobId)
        } else {
          newSet.delete(jobId)
        }
        return newSet
      })
      
      toast.success(result.saved ? tMessages('jobSaved') : tMessages('jobUnsaved'))
    } catch (error: any) {
      toast.error(error.message || tErrors('somethingWrong'))
    }
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      remote: false,
      types: [] as string[],
      experienceLevels: [] as string[],
      categories: [] as string[],
      salaryMin: 0
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {t('findJob')}
          </h1>
          
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 bg-slate-50 rounded-lg border border-slate-300">
              <Search className="w-5 h-5 text-slate-400" />
              <Input 
                placeholder={t('searchPlaceholder')}
                className="border-0 bg-transparent focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-slate-300"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <JobFilters 
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </aside>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <p className="text-slate-600">
                {t('jobsFound', { count: filteredJobs.length })}
              </p>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('noJobsFound')}</h3>
                <p className="text-slate-600 mb-6">
                  {t('adjustFilters')}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  {t('clearFilters')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    company={job.company}
                    isSaved={localSavedJobs.has(job.id)}
                    onSave={() => handleSaveJob(job.id)}
                    applicationCount={job._count?.applications}
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
