'use client'

import NotificationBell from '@/components/notifications/NotificationBell'
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { Building2, Globe, LogOut, Menu, MessageSquare, User, X } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import NextImage from 'next/image'
import { useState } from 'react'

export default function Navigation() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isEmployer = session?.user?.role === 'EMPLOYER'

  const isActive = (path: string) => pathname === path

  const switchLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr'
    router.replace(pathname, {locale: newLocale})
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/icon.svg" 
              alt="OceanicJob" 
              className="w-10 h-10 group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
              OceanicJob
            </span>
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
              {t('home')}
            </Link>
            <Link 
              href="/jobs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/jobs') 
                  ? 'text-blue-900 font-semibold' 
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {t('findJobs')}
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
                      {t('dashboard')}
                    </Link>
                    <Link 
                      href="/employer/post-job" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/employer/post-job') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('postJob')}
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
                      {t('dashboard')}
                    </Link>
                    <Link 
                      href="/applications" 
                      className={`text-sm font-medium transition-colors ${
                        isActive('/applications') 
                          ? 'text-blue-900 font-semibold' 
                          : 'text-slate-600 hover:text-blue-900'
                      }`}
                    >
                      {t('myApplications')}
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

                {/* Messages Link */}
                <Link
                  href="/messages"
                  className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                    isActive('/messages') ? 'bg-slate-100' : ''
                  }`}
                  title={locale === 'fr' ? 'Messages' : 'Messages'}
                >
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                </Link>

                {/* Notifications */}
                <NotificationBell />
                
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
                {t('signIn')}
              </Button>
            )}

            {/* Language Toggle */}
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{locale}</span>
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
                {t('home')}
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
                {t('findJobs')}
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
                        {t('dashboard')}
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
                        {t('postJob')}
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
                        {t('dashboard')}
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
                        {t('myApplications')}
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
                    {t('profile')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                  >
                    {t('signOut')}
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
                  {t('signIn')}
                </button>
              )}

              {/* Mobile Language Toggle */}
              <button
                onClick={() => {
                  switchLanguage()
                  setMobileMenuOpen(false)
                }}
                className="mx-4 px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                {locale === 'fr' ? 'Switch to English' : 'Passer en français'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
