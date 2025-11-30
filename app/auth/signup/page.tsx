'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE' as 'CANDIDATE' | 'EMPLOYER'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []

    if (formData.name.length < 2) {
      newErrors.push('Name must be at least 2 characters')
    }

    if (!formData.email.includes('@')) {
      newErrors.push('Please enter a valid email')
    }

    if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters')
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors([data.error || 'Failed to create account'])
        toast.error(data.error || 'Failed to create account')
        return
      }

      toast.success('Account created successfully! Please sign in.')
      router.push('/auth/signin')
    } catch (error) {
      setErrors(['Something went wrong. Please try again.'])
      toast.error('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">TalentHub</h1>
          </Link>
          <p className="text-slate-600">Create your account to get started</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Join TalentHub today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                  {errors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'CANDIDATE' })}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.role === 'CANDIDATE'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">Job Seeker</div>
                    <div className="text-xs text-slate-600 mt-1">Looking for jobs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.role === 'EMPLOYER'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">Employer</div>
                    <div className="text-xs text-slate-600 mt-1">Hiring talent</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <p className="text-xs text-slate-600 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
