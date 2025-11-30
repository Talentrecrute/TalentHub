import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, FileText, Mail, MapPin, Phone, User } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId }
  })
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/')
  }

  const user = await getUser(session.user.id)

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            My Profile
          </h1>
          <p className="text-lg text-slate-600">
            Manage your personal information
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user.name || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user.phone || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user.location || 'Not set'}</span>
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bio
                </label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap">{user.bio}</p>
                </div>
              </div>
            )}

            {user.resume && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resume
                </label>
                <a 
                  href={user.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-4">
                To edit your profile, please contact support or use the profile editing feature (coming soon).
              </p>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {session.user.role === 'CANDIDATE' && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <p className="text-slate-900 capitalize">{user.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
