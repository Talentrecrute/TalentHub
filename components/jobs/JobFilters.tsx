'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

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

// Job types matching database values (lowercase with hyphen)
const jobTypes = [
  { value: 'full-time', labelFr: 'Temps plein', labelEn: 'Full-time' },
  { value: 'part-time', labelFr: 'Temps partiel', labelEn: 'Part-time' },
  { value: 'contract', labelFr: 'Contrat', labelEn: 'Contract' },
  { value: 'freelance', labelFr: 'Freelance', labelEn: 'Freelance' },
  { value: 'internship', labelFr: 'Stage', labelEn: 'Internship' }
]

// Experience levels
const experienceLevels = [
  { value: 'entry', labelFr: 'Débutant', labelEn: 'Entry Level' },
  { value: 'mid', labelFr: 'Intermédiaire', labelEn: 'Mid Level' },
  { value: 'senior', labelFr: 'Senior', labelEn: 'Senior Level' },
  { value: 'lead', labelFr: 'Lead / Manager', labelEn: 'Lead / Manager' },
  { value: 'executive', labelFr: 'Directeur', labelEn: 'Executive' }
]

// Categories matching database values (French names as stored in DB)
const categories = [
  { value: 'Technologie', labelFr: 'Technologie', labelEn: 'Technology' },
  { value: 'Marketing', labelFr: 'Marketing', labelEn: 'Marketing' },
  { value: 'Ventes', labelFr: 'Ventes', labelEn: 'Sales' },
  { value: 'Design', labelFr: 'Design', labelEn: 'Design' },
  { value: 'Finance', labelFr: 'Finance', labelEn: 'Finance' },
  { value: 'Ressources Humaines', labelFr: 'Ressources Humaines', labelEn: 'Human Resources' },
  { value: 'Opérations', labelFr: 'Opérations', labelEn: 'Operations' },
  { value: 'Support Client', labelFr: 'Support Client', labelEn: 'Customer Support' },
  { value: 'Ingénierie', labelFr: 'Ingénierie', labelEn: 'Engineering' },
  { value: 'Produit', labelFr: 'Produit', labelEn: 'Product' },
  { value: 'Juridique', labelFr: 'Juridique', labelEn: 'Legal' },
  { value: 'Autre', labelFr: 'Autre', labelEn: 'Other' }
]

// Salary ranges for quick selection
const salaryRanges = [
  { min: 0, labelFr: 'Tous les salaires', labelEn: 'All salaries' },
  { min: 30000, labelFr: '30 000€+', labelEn: '$30,000+' },
  { min: 50000, labelFr: '50 000€+', labelEn: '$50,000+' },
  { min: 70000, labelFr: '70 000€+', labelEn: '$70,000+' },
  { min: 100000, labelFr: '100 000€+', labelEn: '$100,000+' }
]

export default function JobFilters({ filters, onChange, onClear }: JobFiltersProps) {
  const t = useTranslations('jobs')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    type: true,
    experience: false,
    category: true,
    salary: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

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

  const activeFiltersCount = 
    (filters.location ? 1 : 0) +
    (filters.remote ? 1 : 0) +
    filters.types.length +
    filters.experienceLevels.length +
    filters.categories.length +
    (filters.salaryMin > 0 ? 1 : 0)

  const hasActiveFilters = activeFiltersCount > 0

  const getLabel = (item: { labelFr: string; labelEn: string }) => {
    return locale === 'fr' ? item.labelFr : item.labelEn
  }

  return (
    <div className="space-y-4">
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-teal-800">
                {tCommon('filter')} ({activeFiltersCount})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-100 h-auto p-1"
              >
                <X className="w-4 h-4 mr-1" />
                {t('clearFilters')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.remote && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {t('remote')}
                  <button onClick={handleRemoteToggle} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.types.map(type => {
                const typeObj = jobTypes.find(t => t.value === type)
                return (
                  <Badge key={type} variant="secondary" className="bg-teal-100 text-teal-800">
                    {typeObj ? getLabel(typeObj) : type}
                    <button onClick={() => toggleArrayFilter('types', type)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
              {filters.categories.map(cat => {
                const catObj = categories.find(c => c.value === cat)
                return (
                  <Badge key={cat} variant="secondary" className="bg-teal-100 text-teal-800">
                    {catObj ? getLabel(catObj) : cat}
                    <button onClick={() => toggleArrayFilter('categories', cat)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location & Remote */}
      <Card>
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => toggleSection('location')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{t('location')}</CardTitle>
            {expandedSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.location && (
          <CardContent className="space-y-3 pt-0">
            <Input
              placeholder={locale === 'fr' ? 'Ville, région...' : 'City, region...'}
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="text-sm"
            />
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={handleRemoteToggle}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700 font-medium">{t('remote')}</span>
            </label>
          </CardContent>
        )}
      </Card>

      {/* Job Type */}
      <Card>
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => toggleSection('type')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {t('jobType')}
              {filters.types.length > 0 && (
                <Badge className="ml-2 bg-teal-600">{filters.types.length}</Badge>
              )}
            </CardTitle>
            {expandedSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.type && (
          <CardContent className="space-y-1 pt-0">
            {jobTypes.map(type => (
              <label 
                key={type.value} 
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  filters.types.includes(type.value) ? 'bg-teal-50' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(type.value)}
                  onChange={() => toggleArrayFilter('types', type.value)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={`text-sm ${filters.types.includes(type.value) ? 'text-teal-700 font-medium' : 'text-slate-700'}`}>
                  {getLabel(type)}
                </span>
              </label>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => toggleSection('category')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {t('category')}
              {filters.categories.length > 0 && (
                <Badge className="ml-2 bg-teal-600">{filters.categories.length}</Badge>
              )}
            </CardTitle>
            {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.category && (
          <CardContent className="pt-0">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {categories.map(category => (
                <label 
                  key={category.value} 
                  className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                    filters.categories.includes(category.value) ? 'bg-teal-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.value)}
                    onChange={() => toggleArrayFilter('categories', category.value)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className={`text-sm ${filters.categories.includes(category.value) ? 'text-teal-700 font-medium' : 'text-slate-700'}`}>
                    {getLabel(category)}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => toggleSection('experience')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {t('experience')}
              {filters.experienceLevels.length > 0 && (
                <Badge className="ml-2 bg-teal-600">{filters.experienceLevels.length}</Badge>
              )}
            </CardTitle>
            {expandedSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.experience && (
          <CardContent className="space-y-1 pt-0">
            {experienceLevels.map(level => (
              <label 
                key={level.value} 
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  filters.experienceLevels.includes(level.value) ? 'bg-teal-50' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.experienceLevels.includes(level.value)}
                  onChange={() => toggleArrayFilter('experienceLevels', level.value)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={`text-sm ${filters.experienceLevels.includes(level.value) ? 'text-teal-700 font-medium' : 'text-slate-700'}`}>
                  {getLabel(level)}
                </span>
              </label>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => toggleSection('salary')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {t('minimumSalary')}
              {filters.salaryMin > 0 && (
                <Badge className="ml-2 bg-teal-600">1</Badge>
              )}
            </CardTitle>
            {expandedSections.salary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.salary && (
          <CardContent className="space-y-2 pt-0">
            {salaryRanges.map(range => (
              <label 
                key={range.min} 
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  filters.salaryMin === range.min ? 'bg-teal-50' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="salary"
                  checked={filters.salaryMin === range.min}
                  onChange={() => handleSalaryChange(range.min)}
                  className="w-4 h-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className={`text-sm ${filters.salaryMin === range.min ? 'text-teal-700 font-medium' : 'text-slate-700'}`}>
                  {getLabel(range)}
                </span>
              </label>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
