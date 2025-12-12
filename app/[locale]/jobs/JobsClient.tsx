'use client'

import { saveJob } from '@/app/actions/jobs'
import FadeIn from '@/components/animations/FadeIn'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import JobCardSkeleton from '@/components/skeletons/JobCardSkeleton'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Company, Job } from '@prisma/client'
import { ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface JobsClientProps {
  initialJobs: (Job & { company: Company; _count?: { applications: number } })[]
  savedJobIds: string[]
  userId?: string
}

// Popular search suggestions
const popularSearches = [
  'Développeur', 'Marketing', 'Designer', 'Commercial', 'Data', 
  'Full Stack', 'Product Manager', 'RH', 'Finance', 'DevOps'
]

export default function JobsClient({ initialJobs, savedJobIds, userId }: JobsClientProps) {
  const t = useTranslations('jobs')
  const tMessages = useTranslations('messages')
  const tErrors = useTranslations('errors')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [locationSearch, setLocationSearch] = useState(searchParams.get('location') || '')
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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true) // Initial load state

  // Simulate loading on mount and filter change
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // 500ms delay for smooth UX
    return () => clearTimeout(timer)
  }, [searchTerm, locationSearch, filters])
  
  // Pagination
  const JOBS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)
  
  // Sidebar collapsed state (for desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentJobSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  // Save search to recent searches
  const saveToRecentSearches = useCallback((term: string) => {
    if (!term.trim()) return
    const current = JSON.parse(localStorage.getItem('recentJobSearches') || '[]')
    const updated = [term, ...current.filter((s: string) => s !== term)].slice(0, 5)
    localStorage.setItem('recentJobSearches', JSON.stringify(updated))
    setRecentSearches(updated)
  }, [])

  // Advanced search function with scoring
  const searchJobs = useCallback((jobs: typeof initialJobs, term: string, location: string) => {
    if (!term && !location) return jobs

    return jobs
      .map(job => {
        let score = 0
        const searchLower = term.toLowerCase()
        const locationLower = location.toLowerCase()

        // Title match (highest priority)
        if (term && job.title?.toLowerCase().includes(searchLower)) {
          score += job.title.toLowerCase().startsWith(searchLower) ? 100 : 50
        }

        // Company name match
        if (term && job.company?.name?.toLowerCase().includes(searchLower)) {
          score += 40
        }

        // Category match
        if (term && job.category?.toLowerCase().includes(searchLower)) {
          score += 35
        }

        // Description match
        if (term && job.description?.toLowerCase().includes(searchLower)) {
          score += 20
        }

        // Employment type match
        if (term && job.employmentType?.toLowerCase().includes(searchLower)) {
          score += 15
        }

        // Location search
        if (location) {
          if (job.location?.toLowerCase().includes(locationLower)) {
            score += 50
          }
          if (job.locationType?.toLowerCase().includes(locationLower)) {
            score += 30
          }
        }

        return { job, score }
      })
      .filter(item => item.score > 0 || (!term && !location))
      .sort((a, b) => b.score - a.score)
      .map(item => item.job)
  }, [])

  // Apply all filters
  const filteredJobs = searchJobs(initialJobs, searchTerm, locationSearch).filter(job => {
    // Location filter from sidebar
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    
    // Remote filter
    if (filters.remote && job.locationType !== 'remote') return false
    
    // Job type filter
    if (filters.types.length > 0 && !filters.types.includes(job.employmentType)) return false
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(job.category)) return false
    
    // Experience level filter
    if (filters.experienceLevels.length > 0 && !filters.experienceLevels.includes((job as any).experienceLevel)) return false
    
    // Salary filter - smart comparison considering currency and period
    if (filters.salaryMin > 0) {
      const jobSalary = job.salaryMax || job.salaryMin || 0
      const filterCurrency = (filters as any).salaryCurrency || 'EUR'
      const filterPeriod = (filters as any).salaryPeriod || 'monthly'
      const jobCurrency = (job.salaryCurrency || 'EUR').toUpperCase()
      const jobPeriod = (job as any).salaryPeriod || 'monthly'
      
      // Normalize currency names (Euros -> EUR, Dollars -> USD, etc.)
      const normalizedJobCurrency = 
        jobCurrency.includes('EUR') ? 'EUR' :
        jobCurrency.includes('USD') || jobCurrency.includes('DOLLAR') ? 'USD' :
        jobCurrency.includes('GBP') || jobCurrency.includes('POUND') ? 'GBP' :
        jobCurrency.includes('XAF') || jobCurrency.includes('CFA') ? 'XAF' :
        jobCurrency
      
      // Convert salaries to same period for comparison
      let normalizedJobSalary = jobSalary
      if (filterPeriod === 'monthly' && jobPeriod === 'yearly') {
        normalizedJobSalary = jobSalary / 12
      } else if (filterPeriod === 'yearly' && jobPeriod === 'monthly') {
        normalizedJobSalary = jobSalary * 12
      }
      
      // If currencies match, compare directly
      // If different currencies, still show the job (user can see the currency in the card)
      if (normalizedJobCurrency === filterCurrency || filterCurrency === 'ALL') {
        if (normalizedJobSalary < filters.salaryMin) return false
      }
      // For different currencies, we don't filter (show all to let user decide)
    }
    
    return true
  })

  const handleSearch = () => {
    if (searchTerm.trim()) {
      saveToRecentSearches(searchTerm.trim())
    }
    setShowSuggestions(false)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    saveToRecentSearches(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setLocationSearch('')
  }

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
    setSearchTerm('')
    setLocationSearch('')
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, locationSearch, filters])

  const hasActiveSearch = searchTerm || locationSearch
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {t('findJob')}
          </h1>
          
          {/* Professional Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-2">
            <div className="flex flex-col md:flex-row gap-2 items-center">
              {/* Job Title / Keyword Search */}
              <div className="flex-1 relative">
                <div className="flex items-center gap-2 px-4 py-3">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <Input 
                    placeholder={t('searchPlaceholder')}
                    className="border-0 bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-50 overflow-hidden">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-2">Recherches récentes</p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(search)}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Searches */}
                    <div className="p-3">
                      <p className="text-xs font-medium text-slate-500 mb-2">Recherches populaires</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(search)}
                            className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-slate-200 my-2" />

              {/* Location Search */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <Input 
                  placeholder={t('location')}
                  className="border-0 bg-transparent focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {locationSearch && (
                  <button onClick={() => setLocationSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700 px-8 py-6 md:py-3"
              >
                <Search className="w-5 h-5 mr-2" />
                {tCommon('search')}
              </Button>
            </div>
          </div>

          {/* Active Search Tags */}
          {hasActiveSearch && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-blue-200">Recherche:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {locationSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  📍 {locationSearch}
                  <button onClick={() => setLocationSearch('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={clearSearch}
                className="text-sm text-blue-200 hover:text-white underline"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-center"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            {tCommon('filter')} {filters.types.length + filters.categories.length > 0 && `(${filters.types.length + filters.categories.length})`}
          </Button>
        </div>

        <div className="flex gap-0 relative">
          {/* Toggle Button for Desktop - Always visible */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute left-0 top-0 z-20 items-center justify-center w-8 h-8 bg-teal-600 text-white rounded-r-lg shadow-lg hover:bg-teal-700 transition-all duration-300"
            style={{ transform: sidebarCollapsed ? 'translateX(0)' : `translateX(${320 - 8}px)` }}
            title={sidebarCollapsed ? 'Afficher les filtres' : 'Masquer les filtres'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Filters Sidebar - Collapsible with animation */}
          <aside 
            className={`
              ${showFilters ? 'block' : 'hidden'} 
              lg:block flex-shrink-0
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:w-80 lg:opacity-100'}
              w-full mr-4
            `}
          >
            <div className={`lg:sticky lg:top-4 w-80 transition-transform duration-300 ${sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}>
              <JobFilters 
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Job Listings - Expands when sidebar is collapsed */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-4' : 'lg:ml-8'}`}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-slate-600">
                {t('jobsFound', { count: filteredJobs.length })}
              </p>
              
              {/* Top Pagination - Compact */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 min-w-[80px] text-center">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {hasActiveSearch && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('clearFilters')}
                </Button>
              )}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
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
              <>
                <div className="space-y-4">
                  {isLoading ? (
                    // Show 3 skeletons during loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <JobCardSkeleton key={i} />
                    ))
                  ) : (
                    paginatedJobs.map((job, index) => (
                      <FadeIn key={job.id} delay={index * 0.05}>
                        <JobCard 
                          job={job}
                          company={job.company}
                          isSaved={localSavedJobs.has(job.id)}
                          onSave={() => handleSaveJob(job.id)}
                          applicationCount={job._count?.applications}
                        />
                      </FadeIn>
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {tCommon('previous')}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and neighbors
                          if (page === 1 || page === totalPages) return true
                          if (Math.abs(page - currentPage) <= 1) return true
                          return false
                        })
                        .map((page, idx, arr) => {
                          const showEllipsis = idx > 0 && arr[idx - 1] !== page - 1
                          return (
                            <span key={page} className="contents">
                              {showEllipsis && (
                                <span className="px-2 text-slate-400">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                {page}
                              </button>
                            </span>
                          )
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {tCommon('next')}
                    </Button>
                  </div>
                )}
                
                {/* Page info */}
                <p className="text-center text-sm text-slate-500 mt-4">
                  {t('jobsFound', { count: filteredJobs.length })} — Page {currentPage} / {totalPages}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
