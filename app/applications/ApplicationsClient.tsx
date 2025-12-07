'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Application, Company, Job } from '@prisma/client'
import { Calendar, FileText, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type ApplicationWithJob = Application & {
  job: Job & { company: Company }
}

interface ApplicationsClientProps {
  applications: ApplicationWithJob[]
}

const statusOptions = [
  { value: 'ALL', label: 'Toutes', color: 'bg-slate-100 text-slate-700' },
  { value: 'PENDING', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'REVIEWED', label: 'Examinée', color: 'bg-blue-100 text-blue-700' },
  { value: 'ACCEPTED', label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: 'Refusée', color: 'bg-red-100 text-red-700' },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200'
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  REVIEWED: 'Examinée',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée'
}

export default function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'ALL') return true
    return app.status === statusFilter
  })

  // Count by status
  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    REVIEWED: applications.filter(a => a.status === 'REVIEWED').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <div>
      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filtrer par statut</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === option.value
                  ? `${option.color} ring-2 ring-offset-2 ring-teal-500`
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-600 mb-4">
        {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''} 
        {statusFilter !== 'ALL' && ` avec le statut "${statusLabels[statusFilter] || statusFilter}"`}
      </p>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {statusFilter === 'ALL' ? 'Aucune candidature' : 'Aucune candidature avec ce statut'}
            </h3>
            <p className="text-slate-600 mb-6">
              {statusFilter === 'ALL' 
                ? "Vous n'avez pas encore postulé. Commencez à chercher des offres !"
                : "Aucune candidature ne correspond à ce filtre."}
            </p>
            {statusFilter === 'ALL' ? (
              <Link href="/jobs">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Chercher des offres
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setStatusFilter('ALL')}
              >
                Voir toutes les candidatures
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/jobs/${app.job.id}`} className="hover:text-teal-600">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        {app.job.title}
                      </h3>
                    </Link>
                    <p className="text-lg text-slate-600 mb-2">{app.job.company.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[app.status]} variant="outline">
                    {statusLabels[app.status]}
                  </Badge>
                </div>

                {app.coverLetter && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Lettre de motivation</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="capitalize">{app.job.employmentType.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>{app.job.location}</span>
                  </div>
                  <Link href={`/jobs/${app.job.id}`}>
                    <Button variant="outline" size="sm">
                      Voir l'offre
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
