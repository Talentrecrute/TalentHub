'use client'

import GlobalSearch from '@/components/GlobalSearch'
import NotificationBell from '@/components/notifications/NotificationBell'
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { Globe, LogOut, User } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
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

  // Don't show regular navigation on admin pages
  if (pathname.includes('/admin')) {
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
              href="/jobs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/jobs') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('findJob')}
            </Link>
            <Link 
              href="/companies" 
              className={`text-sm font-medium transition-colors ${
                isActive('/companies') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('companies')}
            </Link>
            <Link 
              href="/blog" 
              className={`text-sm font-medium transition-colors ${
                isActive('/blog') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blog
            </Link>
            <Link 
              href="/messages" 
              className={`text-sm font-medium transition-colors ${
                isActive('/messages') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('messages')}
            </Link>
          </div>

          {/* Create default navigation items if they don't exist */}
          <div className="hidden md:flex items-center gap-4">
            <GlobalSearch />
            <button 
              onClick={switchLanguage}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              <Globe className="w-5 h-5" />
            </button>

            <NotificationBell />

            {status === 'authenticated' && session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || ''} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {session.user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <div className="p-2">
                    {isAdmin ? (
                      <Link 
                        href="/admin/blog" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                          📊
                        </span>
                        Admin Dashboard
                      </Link>
                    ) : isEmployer ? (
                      <>
                        <Link 
                          href="/employer/dashboard" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            📊
                          </span>
                          {t('dashboard')}
                        </Link>
                        <Link 
                          href="/employer/post-job" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            ➕
                          </span>
                          {t('postJob')}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                            📊
                          </span>
                          {t('dashboard')}
                        </Link>
                        <Link 
                          href="/applications" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            📝
                          </span>
                          {t('myApplications')}
                        </Link>
                      </>
                    )}
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        👤
                      </span>
                      {t('profile')}
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-2" />
                    
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </span>
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => signIn()}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-teal-500/25"
              >
                {t('signIn')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <span className="text-2xl">✕</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto pb-20">
          <div className="p-4 space-y-1">
            <Link 
              href="/" 
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all duration-200 transform ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              } ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '0ms' : '0ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/') ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                🏠
              </span>
              {t('home')}
            </Link>
            <Link 
              href="/jobs" 
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all duration-200 transform ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              } ${
                isActive('/jobs') 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '0ms' : '0ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/jobs') ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                🔍
              </span>
              {t('findJobs')}
            </Link>
            <Link 
              href="/companies" 
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all duration-200 transform ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              } ${
                isActive('/companies') 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '50ms' : '0ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/companies') ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                🏢
              </span>
              {t('companies')}
            </Link>
            <Link 
              href="/blog" 
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all duration-200 transform ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              } ${
                isActive('/blog') 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '100ms' : '0ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/blog') ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                📰
              </span>
              Blog
            </Link>
            <Link 
              href="/messages" 
              className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all duration-200 transform ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              } ${
                isActive('/messages') 
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
              }`}
              style={{ transitionDelay: mobileMenuOpen ? '125ms' : '0ms' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive('/messages') ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                💬
              </span>
              {t('messages')}
            </Link>

            <div className="mx-2 my-4 border-t border-slate-100" />

            {status === 'authenticated' && session ? (
              <>
                <div className="px-4 py-2 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || ''} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{session.user?.name}</div>
                    <div className="text-xs text-slate-500">{session.user?.email}</div>
                  </div>
                </div>

                {isAdmin ? (
                  <Link 
                    href="/admin/blog" 
                    className={`px-4 py-3 text-sm font-medium rounded-xl mx-2 flex items-center gap-3 transition-all duration-200 transform ${
                      mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    } ${
                      isActive('/admin/blog') 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20' 
                        : 'text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? '150ms' : '0ms' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive('/admin/blog') ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      📊
                    </span>
                    Admin Dashboard
                  </Link>
                ) : isEmployer ? (
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
                
                <div className="h-px bg-slate-100 my-2" />
                
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </span>
                  {t('signOut')}
                </button>
              </>
            ) : (
              <Button
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
              </Button>
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
    </nav>
  )
}
