import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  // Get the job
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true }
  })

  if (!job) {
    redirect('/employer/dashboard')
  }

  // Verify ownership
  if (job.company.employerId !== session.user.id) {
    redirect('/employer/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Modifier l'offre</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-blue-800 mb-4">
            <strong>Fonctionnalité en cours de développement</strong>
          </p>
          <p className="text-sm text-blue-700 mb-4">
            La page d'édition complète sera bientôt disponible. Pour l'instant, vous pouvez :
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
            <li>Changer le statut de l'offre (OUVERT/FERMÉ) depuis le dashboard</li>
            <li>Visualiser les détails de l'offre</li>
            <li>Gérer les candidatures reçues</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Titre de l'offre</label>
            <p className="text-lg font-semibold text-slate-900">{job.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Statut actuel</label>
            <p className="text-lg font-semibold text-slate-900 capitalize">{job.status}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Localisation</label>
            <p className="text-slate-900">{job.location}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
            <p className="text-slate-900">{job.category}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a 
            href="/employer/dashboard"
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-center font-medium transition-colors"
          >
            Retour au dashboard
          </a>
          <a 
            href={`/jobs/${job.id}`}
            className="flex-1 px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-center font-medium transition-colors"
          >
            Voir l'offre
          </a>
        </div>
      </div>
    </div>
  )
}
