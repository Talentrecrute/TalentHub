'use client'

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { Briefcase, Building2, Globe, LogOut, Menu, User, X } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import NextImage from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isEmployer = session?.user?.role === 'EMPLOYER'
  const { language, setLanguage, t } = useLanguage()

  const isActive = (path: string) => pathname === path

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TalentHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-900 font-semibold' 
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/jobs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/jobs') 
                  ? 'text-blue-900 font-semibold' 
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t('nav.findJobs')}
            </Link>
            
            {status === 'authenticated' && session ? (
              <>
                {isEmployer ? (
                  <>
                    <Link 
                      href="/employer/dashboard" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/employer/dashboard') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link 
                      href="/employer/post-job" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/employer/post-job') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('nav.postJob')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/dashboard') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link 
                      href="/applications" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/applications') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('nav.myApplications')}
                    </Link>
                  </>
                )}
                
                <Link 
                  href="/profile" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/profile') 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {session.user?.image ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white">
                      <NextImage
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    isEmployer ? (
                      <Building2 className={`w-4 h-4 ${
                        isActive('/profile') ? 'text-white' : 'text-slate-700'
                      }`} />
                    ) : (
                      <User className={`w-4 h-4 ${
                        isActive('/profile') ? 'text-white' : 'text-slate-700'
                      }`} />
                    )
                  )}
                  <span className={`text-sm font-medium ${
                    isActive('/profile') ? 'text-white' : 'text-slate-700'
                  }`}>{session.user?.name}</span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => signIn()}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {t('nav.signIn')}
              </Button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-3">
              <Link 
                href="/" 
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive('/') 
                    ? 'bg-blue-900 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/jobs" 
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive('/jobs') 
                    ? 'bg-blue-900 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.findJobs')}
              </Link>
              
              {status === 'authenticated' && session ? (
                <>
                  {isEmployer ? (
                    <>
                      <Link 
                        href="/employer/dashboard" 
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          isActive('/employer/dashboard') 
                            ? 'bg-blue-900 text-white' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                      <Link 
                        href="/employer/post-job" 
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          isActive('/employer/post-job') 
                            ? 'bg-blue-900 text-white' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.postJob')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/dashboard" 
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          isActive('/dashboard') 
                            ? 'bg-blue-900 text-white' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                      <Link 
                        href="/applications" 
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          isActive('/applications') 
                            ? 'bg-blue-900 text-white' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.myApplications')}
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    href="/profile" 
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive('/profile') 
                        ? 'bg-blue-900 text-white' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signIn()
                    setMobileMenuOpen(false)
                  }}
                  className="mx-4 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium"
                >
                  {t('nav.signIn')}
                </button>
              )}

              {/* Mobile Language Toggle */}
              <button
                onClick={() => {
                  toggleLanguage()
                  setMobileMenuOpen(false)
                }}
                className="mx-4 px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                {language === 'fr' ? 'Switch to English' : 'Passer en français'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
