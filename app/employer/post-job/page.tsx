import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Building2 } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function PostJobPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  // Check if employer has a company
  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Company Found</h2>
            <p className="text-slate-600 mb-6">
              You need to create a company before you can post jobs.
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Create Company
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Post a New Job
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          This feature is coming soon. For now, use Prisma Studio to add jobs to the database.
        </p>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-4 text-sm text-slate-600">
              <p>To manually add a job:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Run <code className="px-2 py-1 bg-slate-100 rounded">npm run prisma:studio</code></li>
                <li>Navigate to Job table</li>
                <li>Click "Add record"</li>
                <li>Fill in the job details with companyId: <code className="px-2 py-1 bg-slate-100 rounded">{company.id}</code></li>
                <li>Save the record</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
