import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Briefcase, Eye, FileText, Mail, MapPin, Phone, User } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ApplicationActions from './ApplicationActions'

async function getApplicationDetails(applicationId: string, userId: string) {
  // Get employer's company
  const company = await prisma.company.findFirst({
    where: { employerId: userId }
  })

  if (!company) return null

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: true
        }
      },
      candidate: true
    }
  })

  if (!application || application.job.company.id !== company.id) {
    return null
  }

  return application
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    redirect('/')
  }

  const { id } = await params
  const application = await getApplicationDetails(id, session.user.id)

  if (!application) {
    redirect('/employer/applications')
  }

  const parseJSON = (data: string | null) => {
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  const skills = parseJSON(application.candidate.skills)
  const experience = parseJSON(application.candidate.experience)
  const education = parseJSON(application.candidate.education)

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REVIEWED: 'bg-blue-100 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/employer/applications" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour aux candidatures
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {application.candidate.image ? (
                      <img
                        src={application.candidate.image}
                        alt={application.candidate.name || 'Candidate'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-700" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {application.candidate.name || 'Candidat'}
                      </h1>
                      <p className="text-slate-600 mb-2">
                        Postule pour : <span className="font-medium">{application.job.title}</span>
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        {application.candidate.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {application.candidate.email}
                          </div>
                        )}
                        {application.candidate.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {application.candidate.phone}
                          </div>
                        )}
                        {application.candidate.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.candidate.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[application.status]} variant="outline">
                    {application.status}
                  </Badge>
                </div>

                <ApplicationActions applicationId={application.id} currentStatus={application.status} />
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Lettre de motivation</h2>
                  <p className="text-slate-700 whitespace-pre-wrap">{application.coverLetter}</p>
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {application.candidate.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">À propos</h2>
                  <p className="text-slate-700">{application.candidate.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Expérience professionnelle</h2>
                  <div className="space-y-4">
                    {experience.map((exp: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-teal-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                          <p className="text-slate-600">{exp.company}</p>
                          <p className="text-sm text-slate-500">
                            {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Formation</h2>
                  <div className="space-y-4">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                        <p className="text-slate-600">{edu.institution}</p>
                        {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                        <p className="text-sm text-slate-500">
                          {edu.startDate} - {edu.current ? 'En cours' : edu.endDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume */}
            {application.candidate.resume && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">CV</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir le CV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>CV de {application.candidate.name}</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 w-full min-h-0">
                        <iframe
                          src={application.candidate.resume}
                          className="w-full h-full rounded border bg-slate-50"
                          title="Resume Preview"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <a
                    href={application.candidate.resume}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block"
                  >
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Application Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Date de candidature</p>
                    <p className="text-slate-900">
                      {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Poste</p>
                    <p className="text-slate-900">{application.job.title}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Localisation du poste</p>
                    <p className="text-slate-900">{application.job.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
