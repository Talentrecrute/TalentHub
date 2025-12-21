'use client'

import { Link } from '@/i18n/routing'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const { data: session } = useSession()
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')

  const isCandidate = session?.user?.role === 'CANDIDATE'
  const isEmployer = session?.user?.role === 'EMPLOYER'
  const isGuest = !session?.user

  // Show candidate section: for guests OR candidates
  const showCandidateSection = isGuest || isCandidate
  // Show employer section: for guests OR employers
  const showEmployerSection = isGuest || isEmployer

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/icon.svg" 
                alt="OceanicJob" 
                className="w-10 h-10"
              />
              <span className="text-lg font-bold text-white">OceanicJob</span>
            </div>
            <p className="text-sm text-slate-400">
              {t('tagline')}
            </p>
          </div>
          
          {/* For Job Seekers - show for guests or candidates */}
          {showCandidateSection && (
            <div>
              <h3 className="font-semibold text-white mb-3">{t('forJobSeekers')}</h3>
              <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-teal-400 transition-colors">{t('browseJobs')}</Link></li>
                <li><Link href="/companies" className="hover:text-teal-400 transition-colors">{t('companies')}</Link></li>
                {isCandidate && (
                  <>
                    <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">{tNav('dashboard')}</Link></li>
                    <li><Link href="/applications" className="hover:text-teal-400 transition-colors">{tNav('myApplications')}</Link></li>
                    <li><Link href="/profile" className="hover:text-teal-400 transition-colors">{tNav('profile')}</Link></li>
                  </>
                )}
                {isGuest && (
                  <>
                    <li><Link href="/auth/signup" className="hover:text-teal-400 transition-colors">{t('createAccount')}</Link></li>
                    <li><Link href="/auth/signin" className="hover:text-teal-400 transition-colors">{tNav('signIn')}</Link></li>
                  </>
                )}
              </ul>
            </div>
          )}
          
          {/* For Employers - show for guests or employers */}
          {showEmployerSection && (
            <div>
              <h3 className="font-semibold text-white mb-3">{t('forEmployers')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/employer/post-job" className="hover:text-teal-400 transition-colors">{t('postJob')}</Link></li>
                {isEmployer && (
                  <>
                    <li><Link href="/employer/dashboard" className="hover:text-teal-400 transition-colors">{tNav('dashboard')}</Link></li>
                    <li><Link href="/employer/applications" className="hover:text-teal-400 transition-colors">{tNav('myApplications')}</Link></li>
                    <li><Link href="/profile" className="hover:text-teal-400 transition-colors">{tNav('profile')}</Link></li>
                  </>
                )}
                {isGuest && (
                  <>
                    <li><Link href="/auth/signup" className="hover:text-teal-400 transition-colors">{t('createAccount')}</Link></li>
                    <li><Link href="/auth/signin" className="hover:text-teal-400 transition-colors">{tNav('signIn')}</Link></li>
                  </>
                )}
              </ul>
            </div>
          )}
          
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-white mb-3">{t('company')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">{t('careerTips')}</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">{t('contact')}</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} OceanicJob. {t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
