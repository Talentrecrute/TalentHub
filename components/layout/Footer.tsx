'use client'

import { Link } from '@/i18n/routing'
import { Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TalentHub</span>
            </div>
            <p className="text-sm text-slate-400">
              {t('tagline')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">{t('forJobSeekers')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-teal-400 transition-colors">{t('browseJobs')}</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">{tNav('dashboard')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">{t('forEmployers')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/employer/post-job" className="hover:text-teal-400 transition-colors">{t('postJob')}</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-teal-400 transition-colors">{tNav('dashboard')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">{t('company')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">{t('aboutUs')}</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">{t('contact')}</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">{t('privacy')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 TalentHub. {t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
