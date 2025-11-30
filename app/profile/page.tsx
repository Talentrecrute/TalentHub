import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import ProfilePhotoUpload from './ProfilePhotoUpload'
import ResumeUpload from './ResumeUpload'

async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId }
  })
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
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
            Manage your professional information
          </p>
        </div>

        {/* Profile Photo Section */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Photo</h2>
            <ProfilePhotoUpload currentPhoto={user.image} />
          </CardContent>
        </Card>

        {/* Resume Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Resume / CV</h2>
          <ResumeUpload currentResume={user.resume} />
        </div>

        {/* Profile Form */}
        <Card>
          <CardContent className="p-8">
            <ProfileForm user={user} initialData={user} />
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <p className="text-slate-900 capitalize">{user.role.toLowerCase()}</p>
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
      </div>
    </div>
  )
}
