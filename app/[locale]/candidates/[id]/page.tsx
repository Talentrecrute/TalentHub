import { prisma } from '@/lib/prisma'
import { Mail, MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPublicProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { 
      id,
      role: 'CANDIDATE',
      isPublicProfile: true
    },
    select: {
      id: true,
      name: true,
      image: true,
      location: true,
      bio: true,
      skills: true,
      experience: true,
      education: true,
      email: true,
    }
  })

  return user
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('profile')
  const tCommon = await getTranslations('common')
  
  const user = await getPublicProfile(id)

  if (!user) {
    notFound()
  }

  const parseJSON = (data: string | null) => {
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  const skills = parseJSON(user.skills)
  const experience = parseJSON(user.experience)
  const education = parseJSON(user.education)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'Profile'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-slate-600 mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {user.bio && (
                <p className="text-slate-700">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Contact Button */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <a 
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contacter ce candidat
            </a>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('skills')}</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('experience')}</h2>
            <div className="space-y-4">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-teal-500 pl-4">
                  <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                  <p className="text-teal-600">{exp.company}</p>
                  <p className="text-sm text-slate-500">
                    {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-slate-600 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('education')}</h2>
            <div className="space-y-4">
              {education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-500 pl-4">
                  <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                  <p className="text-blue-600">{edu.school}</p>
                  <p className="text-sm text-slate-500">
                    {edu.startDate} - {edu.current ? 'En cours' : edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/jobs" 
            className="text-teal-600 hover:text-teal-700"
          >
            ← Retour aux offres d'emploi
          </Link>
        </div>
      </div>
    </div>
  )
}
