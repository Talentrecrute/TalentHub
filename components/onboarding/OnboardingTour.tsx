'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, CheckCircle, MessageSquare, Search, User, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

interface TourStep {
  id: string
  title: { fr: string; en: string }
  description: { fr: string; en: string }
  icon: React.ReactNode
}

const candidateSteps: TourStep[] = [
  {
    id: 'search',
    title: { fr: 'Rechercher des offres', en: 'Search for jobs' },
    description: { 
      fr: 'Parcourez des centaines d\'offres d\'emploi et filtrez par lieu, catégorie et type de contrat.',
      en: 'Browse hundreds of job listings and filter by location, category, and contract type.'
    },
    icon: <Search className="w-8 h-8" />
  },
  {
    id: 'apply',
    title: { fr: 'Postuler facilement', en: 'Apply easily' },
    description: { 
      fr: 'Postulez en quelques clics avec votre CV. Générez automatiquement une lettre de motivation !',
      en: 'Apply in just a few clicks with your resume. Auto-generate a cover letter!'
    },
    icon: <Briefcase className="w-8 h-8" />
  },
  {
    id: 'profile',
    title: { fr: 'Complétez votre profil', en: 'Complete your profile' },
    description: { 
      fr: 'Ajoutez vos compétences, expériences et CV pour être recommandé aux employeurs.',
      en: 'Add your skills, experiences and resume to be recommended to employers.'
    },
    icon: <User className="w-8 h-8" />
  },
  {
    id: 'messages',
    title: { fr: 'Échangez avec les employeurs', en: 'Chat with employers' },
    description: { 
      fr: 'Communiquez directement avec les recruteurs via notre messagerie intégrée.',
      en: 'Communicate directly with recruiters through our integrated messaging.'
    },
    icon: <MessageSquare className="w-8 h-8" />
  }
]

const employerSteps: TourStep[] = [
  {
    id: 'create',
    title: { fr: 'Créez une entreprise', en: 'Create a company' },
    description: { 
      fr: 'Configurez le profil de votre entreprise pour attirer les meilleurs talents.',
      en: 'Set up your company profile to attract the best talent.'
    },
    icon: <Briefcase className="w-8 h-8" />
  },
  {
    id: 'post',
    title: { fr: 'Publiez des offres', en: 'Post job listings' },
    description: { 
      fr: 'Créez des offres d\'emploi détaillées avec salaire, avantages et exigences.',
      en: 'Create detailed job listings with salary, benefits and requirements.'
    },
    icon: <Search className="w-8 h-8" />
  },
  {
    id: 'manage',
    title: { fr: 'Gérez les candidatures', en: 'Manage applications' },
    description: { 
      fr: 'Utilisez notre pipeline Kanban pour suivre les candidats à chaque étape.',
      en: 'Use our Kanban pipeline to track candidates at every stage.'
    },
    icon: <CheckCircle className="w-8 h-8" />
  },
  {
    id: 'contact',
    title: { fr: 'Contactez les candidats', en: 'Contact candidates' },
    description: { 
      fr: 'Envoyez des messages aux candidats et planifiez des entretiens.',
      en: 'Message candidates and schedule interviews.'
    },
    icon: <MessageSquare className="w-8 h-8" />
  }
]

export default function OnboardingTour() {
  const locale = useLocale()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const isEmployer = session?.user?.role === 'EMPLOYER'
  const steps = isEmployer ? employerSteps : candidateSteps

  useEffect(() => {
    // Only show for authenticated users who haven't seen the tour
    if (!session?.user?.id) return

    const key = `onboarding-${session.user.id}`
    const hasSeenTour = localStorage.getItem(key)
    
    if (!hasSeenTour) {
      // Show tour after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [session])

  const handleComplete = () => {
    if (session?.user?.id) {
      localStorage.setItem(`onboarding-${session.user.id}`, 'true')
    }
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Tour Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Skip Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
            {step.icon}
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {step.title[locale as 'fr' | 'en']}
          </h2>
          <p className="text-slate-600 mb-8">
            {step.description[locale as 'fr' | 'en']}
          </p>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-teal-600' 
                    : index < currentStep 
                      ? 'bg-teal-400'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="flex-1"
            >
              {locale === 'fr' ? 'Passer' : 'Skip'}
            </Button>
            <Button 
              onClick={handleNext}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              {currentStep === steps.length - 1 
                ? (locale === 'fr' ? 'Commencer' : 'Get Started')
                : (locale === 'fr' ? 'Suivant' : 'Next')
              }
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
