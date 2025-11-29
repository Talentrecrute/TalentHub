'use client'

import { Button } from "@/components/ui/button"
import { Briefcase, Building2, LogOut, Menu, User, X } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isEmployer = session?.user?.role === 'EMPLOYER'

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
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/jobs" 
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
            >
              Find Jobs
            </Link>
            
            {status === 'authenticated' && session ? (
              <>
                {isEmployer ? (
                  <>
                    <Link 
                      href="/employer/dashboard" 
                      className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/employer/post-job" 
                      className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                    >
                      Post Job
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/applications" 
                      className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                    >
                      My Applications
                    </Link>
                  </>
                )}
                
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {isEmployer ? (
                    <Building2 className="w-4 h-4 text-slate-700" />
                  ) : (
                    <User className="w-4 h-4 text-slate-700" />
                  )}
                  <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
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
                Sign In
              </Button>
            )}
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
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/jobs" 
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Jobs
              </Link>
              
              {status === 'authenticated' && session ? (
                <>
                  {isEmployer ? (
                    <>
                      <Link 
                        href="/employer/dashboard" 
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/employer/post-job" 
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Post Job
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/applications" 
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    href="/profile" 
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                  >
                    Sign Out
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
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
