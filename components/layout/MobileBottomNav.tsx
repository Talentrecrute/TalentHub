'use client'

import { Link, usePathname } from '@/i18n/routing'
import { Briefcase, Home, Search, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

const navItems = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/jobs', icon: Search, labelKey: 'jobs' },
  { href: '/dashboard', icon: Briefcase, labelKey: 'dashboard' },
  { href: '/profile', icon: User, labelKey: 'profile' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')

  // Hide on desktop
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          // Adjust dashboard link based on user role
          let actualHref = href
          if (href === '/dashboard') {
            if (!session) {
              actualHref = '/auth/signin'
            } else if (session.user.role === 'EMPLOYER') {
              actualHref = '/employer/dashboard'
            } else {
              actualHref = '/candidate/dashboard'
            }
          }
          if (href === '/profile') {
            if (!session) {
              actualHref = '/auth/signin'
            } else {
              actualHref = '/profile'
            }
          }

          const isActive = pathname === actualHref || 
            (href === '/jobs' && pathname.startsWith('/jobs')) ||
            (href === '/dashboard' && (pathname.includes('/dashboard') || pathname.includes('/employer')))

          return (
            <Link
              key={href}
              href={actualHref}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive 
                  ? 'text-teal-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-xs mt-1 font-medium">{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
