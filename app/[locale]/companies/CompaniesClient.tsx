'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import type { Company, Job } from '@prisma/client'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Building2, Globe, MapPin, Search, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'

interface CompanyWithJobs extends Company {
  _count: { jobs: number }
  jobs: Pick<Job, 'category' | 'employmentType'>[]
}

interface CompaniesClientProps {
  companies: CompanyWithJobs[]
}

export default function CompaniesClient({ companies }: CompaniesClientProps) {
  const t = useTranslations('companies')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

  // Get unique industries
  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))]

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry
    
    return matchesSearch && matchesIndustry
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 text-white py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">{companies.length} {t('companiesRecruiting')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-xl p-2 shadow-xl flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 text-slate-900"
              />
              <Button className="bg-teal-600 hover:bg-teal-700">
                {t('search')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Industry Filters */}
          {industries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              <button
                onClick={() => setSelectedIndustry(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedIndustry 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t('allIndustries')}
              </button>
              {industries.map(industry => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry === selectedIndustry ? null : industry)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedIndustry === industry 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </motion.div>
          )}

          {/* Results count */}
          <p className="text-slate-600 mb-6">
            {t('companiesFound', { count: filteredCompanies.length })}
          </p>

          {/* Companies Grid */}
          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('noCompaniesFound')}</h3>
              <p className="text-slate-600">{t('tryAnotherSearch')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/companies/${company.id}`}>
                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 group h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {company.logo ? (
                            <Image 
                              src={company.logo} 
                              alt={company.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                            {company.name}
                          </h3>
                          {company.industry && (
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full mt-1">
                              {company.industry}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {company.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                          {company.description}
                        </p>
                      )}

                      {/* Info */}
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                        {company.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {company.location}
                          </span>
                        )}
                        {company.size && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {company.size}
                          </span>
                        )}
                        {company.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {t('website')}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-2 text-teal-600">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">
                            {company._count.jobs} {t('openPositions', { count: company._count.jobs })}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-teal-100 mb-6">{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                {t('browseJobs')}
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t('createProfile')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
