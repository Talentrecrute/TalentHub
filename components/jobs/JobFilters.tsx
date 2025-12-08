'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface JobFiltersProps {
  filters: {
    location: string
    remote: boolean
    types: string[]
    experienceLevels: string[]
    categories: string[]
    salaryMin: number
  }
  onChange: (filters: any) => void
  onClear: () => void
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive']
const categories = [
  'Technology', 'Marketing', 'Sales', 'Design', 'Finance',
  'Human Resources', 'Operations', 'Customer Support', 'Engineering',
  'Product', 'Legal', 'Other'
]

export default function JobFilters({ filters, onChange, onClear }: JobFiltersProps) {
  const t = useTranslations('jobs')
  const tCommon = useTranslations('common')

  const handleLocationChange = (location: string) => {
    onChange({ ...filters, location })
  }

  const handleRemoteToggle = () => {
    onChange({ ...filters, remote: !filters.remote })
  }

  const toggleArrayFilter = (key: 'types' | 'experienceLevels' | 'categories', value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: updated })
  }

  const handleSalaryChange = (salaryMin: number) => {
    onChange({ ...filters, salaryMin })
  }

  const hasActiveFilters = 
    filters.location ||
    filters.remote ||
    filters.types.length > 0 ||
    filters.experienceLevels.length > 0 ||
    filters.categories.length > 0 ||
    filters.salaryMin > 0

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{tCommon('filter')}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-1" />
            {t('clearFilters')}
          </Button>
        </div>
      )}

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('location')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={t('location')}
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={handleRemoteToggle}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">{t('remote')}</span>
          </label>
        </CardContent>
      </Card>

      {/* Job Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('jobType')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {jobTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleArrayFilter('types', type)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{type}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('experience')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {experienceLevels.map(level => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.experienceLevels.includes(level)}
                onChange={() => toggleArrayFilter('experienceLevels', level)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{level}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('category')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map(category => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleArrayFilter('categories', category)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{category}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('minimumSalary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="number"
            placeholder={t('minimumSalary')}
            value={filters.salaryMin || ''}
            onChange={(e) => handleSalaryChange(Number(e.target.value))}
            min="0"
            step="1000"
          />
          {filters.salaryMin > 0 && (
            <p className="text-xs text-slate-600">
              ${filters.salaryMin.toLocaleString()}+
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
