'use client'

import JobCard from '@/components/jobs/JobCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Company, Job } from '@prisma/client'
import { Sparkles } from 'lucide-react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type JobWithCompany = Job & { company: Company; score?: number }

export default function RecommendedJobs() {
  const locale = useLocale()
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/jobs/recommendations')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      } else {
        setError('Failed to fetch recommendations')
      }
    } catch (err) {
      setError('Error fetching recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            {locale === 'fr' ? 'Recherche des offres...' : 'Finding jobs...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">
            {locale === 'fr' ? 'Pas encore de recommandations' : 'No recommendations yet'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {locale === 'fr' 
              ? 'Complétez votre profil et ajoutez vos compétences pour obtenir des recommandations personnalisées.'
              : 'Complete your profile and add your skills to get personalized recommendations.'}
          </p>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              {locale === 'fr' ? 'Compléter mon profil' : 'Complete my profile'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-teal-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          {locale === 'fr' ? 'Recommandées pour vous' : 'Recommended for you'}
        </h2>
        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
          {jobs.length} {locale === 'fr' ? 'offres' : 'jobs'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.slice(0, 4).map(job => (
          <JobCard
            key={job.id}
            job={job}
            company={job.company}
            showActions={false}
          />
        ))}
      </div>

      {jobs.length > 4 && (
        <div className="text-center mt-4">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              {locale === 'fr' ? 'Voir plus d\'offres' : 'See more jobs'} →
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
