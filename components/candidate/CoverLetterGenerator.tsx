'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Sparkles, Wand2 } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface CoverLetterGeneratorProps {
  jobTitle: string
  companyName: string
  jobDescription?: string
  candidateName?: string
  onGenerate: (letter: string) => void
}

const TEMPLATES = {
  fr: {
    professional: `Madame, Monsieur,

Votre annonce pour le poste de {{jobTitle}} au sein de {{companyName}} a retenu toute mon attention.

Fort(e) de mon expérience dans ce domaine, je suis convaincu(e) que mon profil correspond parfaitement à vos attentes. Ma capacité d'adaptation, mon sens du travail en équipe et ma motivation me permettront de contribuer efficacement à vos projets.

Je serais ravi(e) de vous rencontrer afin de vous exposer plus en détail ma motivation et mes compétences. Dans cette attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{candidateName}}`,

    dynamic: `Madame, Monsieur,

En découvrant votre offre pour le poste de {{jobTitle}}, j'ai immédiatement su que cette opportunité correspondait à mes aspirations professionnelles.

{{companyName}} incarne les valeurs d'innovation et d'excellence que je recherche. Mon parcours m'a permis de développer des compétences clés que je serai heureux(se) de mettre à votre service.

Je suis disponible pour un entretien à votre convenance et vous remercie par avance pour l'attention portée à ma candidature.

Cordialement,
{{candidateName}}`,

    motivated: `Madame, Monsieur,

C'est avec un grand enthousiasme que je vous adresse ma candidature pour le poste de {{jobTitle}} chez {{companyName}}.

Passionné(e) par mon métier, je suis constamment à la recherche de nouveaux défis. Votre entreprise représente une opportunité unique de développer mes compétences tout en contribuant à des projets stimulants.

Je reste à votre entière disposition pour un entretien et vous prie de croire, Madame, Monsieur, en l'assurance de ma considération distinguée.

{{candidateName}}`
  },
  en: {
    professional: `Dear Hiring Manager,

I am writing to express my strong interest in the {{jobTitle}} position at {{companyName}}.

With my background and experience, I am confident that I would be a valuable addition to your team. I am a dedicated professional with excellent communication skills and a proven track record of delivering results.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
{{candidateName}}`,

    dynamic: `Dear Hiring Manager,

I was excited to discover the {{jobTitle}} opening at {{companyName}}.

Your company's reputation for innovation and excellence makes this an ideal opportunity for me to contribute my skills while growing professionally. I am eager to bring my experience and enthusiasm to your team.

I would love to discuss this opportunity with you further. Thank you for your time and consideration.

Best regards,
{{candidateName}}`,

    motivated: `Dear Hiring Manager,

I am thrilled to apply for the {{jobTitle}} position at {{companyName}}.

As a passionate professional, I am always looking for new challenges. Your company represents a unique opportunity to develop my skills while contributing to exciting projects.

I am available for an interview at your convenience and look forward to hearing from you.

Warm regards,
{{candidateName}}`
  }
}

export default function CoverLetterGenerator({
  jobTitle,
  companyName,
  candidateName = 'Votre nom',
  onGenerate
}: CoverLetterGeneratorProps) {
  const locale = useLocale() as 'fr' | 'en'
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'dynamic' | 'motivated'>('professional')
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const templates = TEMPLATES[locale] || TEMPLATES.fr

  const templateLabels = {
    professional: locale === 'fr' ? 'Professionnel' : 'Professional',
    dynamic: locale === 'fr' ? 'Dynamique' : 'Dynamic',
    motivated: locale === 'fr' ? 'Motivé' : 'Motivated'
  }

  const generateLetter = () => {
    const template = templates[selectedTemplate]
    const letter = template
      .replace(/\{\{jobTitle\}\}/g, jobTitle)
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{candidateName\}\}/g, candidateName)

    setGeneratedLetter(letter)
    setIsEditing(true)
    toast.success(locale === 'fr' ? 'Lettre générée !' : 'Letter generated!')
  }

  const handleUse = () => {
    onGenerate(generatedLetter)
    toast.success(locale === 'fr' ? 'Lettre utilisée !' : 'Letter applied!')
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">
            {locale === 'fr' ? 'Générateur de lettre' : 'Letter Generator'}
          </h3>
        </div>

        {!isEditing ? (
          <>
            <p className="text-sm text-slate-600 mb-4">
              {locale === 'fr' 
                ? 'Choisissez un style et générez une lettre de motivation personnalisée.'
                : 'Choose a style and generate a personalized cover letter.'}
            </p>

            {/* Template Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(Object.keys(templates) as Array<keyof typeof templates>).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedTemplate === key
                      ? 'border-purple-500 bg-purple-100 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-sm font-medium">{templateLabels[key]}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={generateLetter}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {locale === 'fr' ? 'Générer la lettre' : 'Generate letter'}
            </Button>
          </>
        ) : (
          <>
            {/* Generated Letter - Editable */}
            <Textarea
              value={generatedLetter}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              className="min-h-[250px] text-sm bg-white mb-4"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                {locale === 'fr' ? 'Retour' : 'Back'}
              </Button>
              <Button
                onClick={handleUse}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                {locale === 'fr' ? 'Utiliser cette lettre' : 'Use this letter'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
