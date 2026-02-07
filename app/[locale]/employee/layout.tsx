import Navigation from '@/components/layout/Navigation'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function EmployeeLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-slate-50">
        {/* Reusing the main Navigation component which adapts based on role */}
        <Navigation />
        <main>
            {children}
        </main>
    </div>
  )
}
