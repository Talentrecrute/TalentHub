'use client'

import GlobalSearch from '@/components/GlobalSearch'
import NotificationBell from '@/components/notifications/NotificationBell'
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { Building2, Globe, LogOut, MessageSquare, User } from 'lucide-react'
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
  const isAdmin = session?.user?.role === 'ADMIN'

  const isActive = (path: string) => pathname === path

  const switchLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr'
    router.replace(pathname, {locale: newLocale})
  }

  // Don't show regular navigation for admins - they have their own layout
  if (isAdmin) {
    return null
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

            {/* Global Search */}
            <GlobalSearch />

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

          {/* Mobile menu button - Animated Hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-center items-center">
              <span 
                className={`absolute h-0.5 w-6 bg-slate-700 rounded-full transition-all duration-300 ease-out ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}
              />
              <span 
                className={`absolute h-0.5 w-6 bg-slate-700 rounded-full transition-all duration-300 ease-out ${
                  mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              />
              <span 
                className={`absolute h-0.5 w-6 bg-slate-700 rounded-full transition-all duration-300 ease-out ${
                  mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation - Animated Slide Down */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen 
              ? 'max-h-[500px] opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-slate-200">
            <div className="flex flex-col gap-1">
              {/* Home Link */}
              <Link 
                href="/" 
                className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                  mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                } ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                    : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '50ms' : '0ms' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive('/') ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  🏠
                </span>
                {t('home')}
              </Link>

              {/* Jobs Link */}
              <Link 
                href="/jobs" 
                className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                  mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                } ${
                  isActive('/jobs') 
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                    : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '100ms' : '0ms' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive('/jobs') ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  🔍
                </span>
                {t('findJobs')}
              </Link>
              
              {status === 'authenticated' && session ? (
                <>
                  {isEmployer ? (
                    <>
                      <Link 
                        href="/employer/dashboard" 
                        className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                          mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        } ${
                          isActive('/employer/dashboard') 
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                            : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                        }`}
                        style={{ transitionDelay: mobileMenuOpen ? '150ms' : '0ms' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive('/employer/dashboard') ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          📊
                        </span>
                        {t('dashboard')}
                      </Link>
                      <Link 
                        href="/employer/post-job" 
                        className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                          mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        } ${
                          isActive('/employer/post-job') 
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                            : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                        }`}
                        style={{ transitionDelay: mobileMenuOpen ? '200ms' : '0ms' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive('/employer/post-job') ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          ➕
                        </span>
                        {t('postJob')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/dashboard" 
                        className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                          mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        } ${
                          isActive('/dashboard') 
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                            : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                        }`}
                        style={{ transitionDelay: mobileMenuOpen ? '150ms' : '0ms' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive('/dashboard') ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          📊
                        </span>
                        {t('dashboard')}
                      </Link>
                      <Link 
                        href="/applications" 
                        className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                          mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        } ${
                          isActive('/applications') 
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                            : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                        }`}
                        style={{ transitionDelay: mobileMenuOpen ? '200ms' : '0ms' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive('/applications') ? 'bg-white/20' : 'bg-slate-100'
                        }`}>
                          📝
                        </span>
                        {t('myApplications')}
                      </Link>
                    </>
                  )}
                  
                  {/* Profile Link */}
                  <Link 
                    href="/profile" 
                    className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                      mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    } ${
                      isActive('/profile') 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                        : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? '250ms' : '0ms' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive('/profile') ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      👤
                    </span>
                    {t('profile')}
                  </Link>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-slate-200" />
                  
                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all duration-200 transform active:scale-[0.98] ${
                      mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? '300ms' : '0ms' }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
                      <LogOut className="w-4 h-4" />
                    </span>
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signIn()
                    setMobileMenuOpen(false)
                  }}
                  className={`mx-4 mt-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all duration-200 transform active:scale-[0.98] ${
                    mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: mobileMenuOpen ? '150ms' : '0ms' }}
                >
                  {t('signIn')}
                </button>
              )}

              {/* Language Toggle */}
              <button
                onClick={() => {
                  switchLanguage()
                  setMobileMenuOpen(false)
                }}
                className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 mt-2 flex items-center gap-3 text-slate-700 hover:bg-slate-100 transition-all duration-200 transform active:scale-[0.98] ${
                  mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: mobileMenuOpen ? '350ms' : '0ms' }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                  <Globe className="w-4 h-4" />
                </span>
                {locale === 'fr' ? 'Switch to English' : 'Passer en français'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

