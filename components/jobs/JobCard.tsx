import CompanyAvatar from '@/components/CompanyAvatar'
import { Button } from '@/components/ui/button'
import type { Company, Job } from '@prisma/client'
import { Bookmark, Clock, DollarSign, MapPin } from 'lucide-react'
import Link from 'next/link'

interface JobCardProps {
  job: Job
  company?: Company | null
  showActions?: boolean
  isSaved?: boolean
  onSave?: () => void
  applicationCount?: number
}

export default function JobCard({ job, company, showActions = true, isSaved = false, onSave, applicationCount }: JobCardProps) {
  const formatSalary = (min?: number | null, max?: number | null, currency: string = 'USD') => {
    if (!min && !max) return 'Competitive'
    
    // Map common invalid currency names to valid ISO codes
    const currencyMap: Record<string, string> = {
      'Euros': 'EUR',
      'Dollars': 'USD',
      'euros': 'EUR',
      'dollars': 'USD'
    }
    
    // Normalize currency code
    const normalizedCurrency = currencyMap[currency] || currency || 'USD'
    
    // Validate currency code (should be 3 uppercase letters)
    const isValidCurrency = /^[A-Z]{3}$/.test(normalizedCurrency)
    const safeCurrency = isValidCurrency ? normalizedCurrency : 'USD'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0
    })
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    return min ? `${formatter.format(min)}+` : `Up to ${formatter.format(max!)}`
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-teal-300 transition-all duration-300 h-full relative group">
      {onSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-teal-600 text-teal-600' : 'text-slate-400'}`} />
        </Button>
      )}
      
      <Link href={`/jobs/${job.id}`} className="block">
        <div className="flex items-start gap-4 mb-4">
          <CompanyAvatar 
            companyName={company?.name || 'Company'}
            logoUrl={company?.logo}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 mb-1 truncate">
              {job.title}
            </h3>
            <p className="text-sm text-slate-600 truncate">
              {company?.name || 'Company'}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs capitalize flex-shrink-0">
              {job.locationType}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {job.category}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {getTimeAgo(job.createdAt)}
              </span>
              {applicationCount !== undefined && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  {applicationCount} candidature{applicationCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-teal-600 hover:text-teal-700">
              Voir détails →
            </span>
          </div>
        )}
      </Link>
    </div>
  )
}
