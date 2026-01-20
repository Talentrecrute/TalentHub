'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Link } from '@/i18n/routing'
import { AlertCircle, Lock, Mail } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Google Icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}



function SignInForm() {
  const t = useTranslations('auth')
  const tErrors = useTranslations('errors')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  // Get callbackUrl but clean it up (remove error params from previous failed attempts)
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/'
  const callbackUrl = rawCallbackUrl.includes('/auth/signin') ? '/' : rawCallbackUrl
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect admins to admin dashboard
      if (session.user.role === 'ADMIN') {
        console.log('Admin authenticated, redirecting to admin dashboard')
        router.push('/admin')
      } else {
        console.log('User authenticated, redirecting to:', callbackUrl)
        router.push(callbackUrl)
      }
      router.refresh()
    }
  }, [status, session, router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        console.log('Sign-in error:', result.error)
        setError(tErrors('invalidCredentials'))
        toast.error(tErrors('invalidCredentials'))
      } else if (result?.ok) {
        toast.success(t('welcomeBack'))
        
        // Fetch user session to check role
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        // Redirect admins to admin dashboard
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push(callbackUrl)
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Sign-in exception:', error)
      setError(tErrors('somethingWrong'))
      toast.error(tErrors('somethingWrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsOAuthLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      toast.error(tErrors('somethingWrong'))
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">OceanicJob</h1>
        </Link>
        <p className="text-slate-600">{t('loginSubtitle')}</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('signIn')}</CardTitle>
          <CardDescription>
            {t('loginSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 text-base font-medium relative hover:bg-slate-50"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isOAuthLoading !== null || isLoading}
            >
              {isOAuthLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5 mr-3" />
              )}
              {t('continueWith')} Google
            </Button>


          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-500">{t('orContinueWith')}</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  {t('password')}
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading || isOAuthLoading !== null}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base font-semibold"
              disabled={isLoading || isOAuthLoading !== null}
            >
              {isLoading ? tCommon('loading') : t('signIn')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {t('noAccount')}{' '}
              <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-semibold">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-slate-600">
        <Link href="/" className="hover:text-slate-900">
          ← {tCommon('back')}
        </Link>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  )
}
