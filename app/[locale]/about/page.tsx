import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { ArrowRight, Globe, Handshake, Heart, Sparkles, Target } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

// Islands we serve
const islands = [
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Comores', flag: '🇰🇲' },
  { name: 'Maurice', flag: '🇲🇺' },
  { name: 'Mayotte', flag: '🇾🇹' },
  { name: 'La Réunion', flag: '🇷🇪' },
  { name: 'Seychelles', flag: '🇸🇨' },
]

export default async function AboutPage() {
  const t = await getTranslations('about')

  // Our values with icons
  const values = [
    {
      icon: Heart,
      title: t('values.solidarity'),
      description: t('values.solidarityDesc'),
    },
    {
      icon: Target,
      title: t('values.transparency'),
      description: t('values.transparencyDesc'),
    },
    {
      icon: Globe,
      title: t('values.connection'),
      description: t('values.connectionDesc'),
    },
    {
      icon: Handshake,
      title: t('values.opportunity'),
      description: t('values.opportunityDesc'),
    },
  ]

  // Founders
  const founders = [
    {
      name: t('founders.sidi.name'),
      role: t('founders.sidi.role'),
      description: t('founders.sidi.description'),
    },
    {
      name: t('founders.ibrahim.name'),
      role: t('founders.ibrahim.role'),
      description: t('founders.ibrahim.description'),
    },
    {
      name: t('founders.noureddine.name'),
      role: t('founders.noureddine.role'),
      description: t('founders.noureddine.description'),
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          {/* Island shapes */}
          <div className="absolute top-1/4 right-1/4 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🏝️</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>🌊</div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{t('since')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('heroTitle')}<br />
            <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                📖
              </span>
              {t('ourStory')}
            </h2>
            
            <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-2xl p-8 border border-teal-100">
              <p className="text-slate-700 leading-relaxed mb-6">
                {t.rich('storyPart1', {
                  strong: (chunks) => <strong className="text-teal-700">{chunks}</strong>
                })}
              </p>

              <p className="text-slate-700 leading-relaxed mb-6">
                {t('storyPart2')}
              </p>

              <div className="bg-white rounded-xl p-6 border-l-4 border-teal-500 shadow-sm">
                <p className="text-slate-600 italic mb-0">
                  &quot;{t('storyQuote')}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">😔</span>
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-4">{t('theProblem')}</h3>
              <ul className="space-y-3 text-red-800">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t('problemList.unemployment')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t('problemList.orientation')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t('problemList.corruption')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t('problemList.disconnect')}</span>
                </li>
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-teal-900 mb-4">{t('ourSolution')}</h3>
              <ul className="space-y-3 text-teal-800">
                <li className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span>{t('solutionList.transparent')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span>{t('solutionList.connection')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span>{t('solutionList.remote')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-500 mt-1">✓</span>
                  <span>{t('solutionList.solidarity')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('opportunityTitle')}</h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('opportunityText')}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <p className="text-2xl font-semibold text-teal-300 mb-4">
              {t('opportunityHighlight')}
            </p>
            <p className="text-blue-100">
              {t('opportunityDetails')}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('ourValues')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Islands We Serve */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('islandsTitle')}</h2>
          <p className="text-slate-600 mb-10">{t('islandsSubtitle')}</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {islands.map((island) => (
              <div 
                key={island.name}
                className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all duration-300 flex items-center gap-3"
              >
                <span className="text-3xl">{island.flag}</span>
                <span className="font-medium text-slate-700">{island.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t('teamTitle')}</h2>
          <p className="text-slate-600 text-center mb-12">{t('teamSubtitle')}</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder) => (
              <div 
                key={founder.name}
                className="text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {founder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{founder.name}</h3>
                <p className="text-sm text-teal-600 font-medium mb-2">{founder.role}</p>
                <p className="text-sm text-slate-500">{founder.description}</p>
              </div>
            ))}
          </div>

          {/* Special thanks */}
          <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100 text-center">
            <span className="text-3xl mb-3 block">🙏</span>
            <p className="text-amber-800">
              {t('thankYou')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-xl text-teal-100 mb-8">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8 shadow-lg">
                {t('findJob')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/employer/post-job">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                {t('recruitTalent')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
