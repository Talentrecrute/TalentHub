'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion, useInView } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Ban, CheckCircle, Clock, CreditCard, FileText, Gavel, Scale, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function TermsPage() {
  const t = useTranslations('terms')

  const sections = [
    {
      icon: CheckCircle,
      title: t('acceptance.title'),
      content: [
        t('acceptance.item1'),
        t('acceptance.item2'),
        t('acceptance.item3'),
      ]
    },
    {
      icon: FileText,
      title: t('services.title'),
      content: [
        t('services.item1'),
        t('services.item2'),
        t('services.item3'),
        t('services.item4'),
      ]
    },
    {
      icon: Scale,
      title: t('userObligations.title'),
      content: [
        t('userObligations.item1'),
        t('userObligations.item2'),
        t('userObligations.item3'),
        t('userObligations.item4'),
      ]
    },
    {
      icon: Ban,
      title: t('prohibitedActions.title'),
      content: [
        t('prohibitedActions.item1'),
        t('prohibitedActions.item2'),
        t('prohibitedActions.item3'),
        t('prohibitedActions.item4'),
      ]
    },
    {
      icon: CreditCard,
      title: t('payment.title'),
      content: [
        t('payment.item1'),
        t('payment.item2'),
        t('payment.item3'),
      ]
    },
    {
      icon: AlertTriangle,
      title: t('liability.title'),
      content: [
        t('liability.item1'),
        t('liability.item2'),
        t('liability.item3'),
      ]
    },
    {
      icon: XCircle,
      title: t('termination.title'),
      content: [
        t('termination.item1'),
        t('termination.item2'),
        t('termination.item3'),
      ]
    },
    {
      icon: Gavel,
      title: t('jurisdiction.title'),
      content: [
        t('jurisdiction.item1'),
        t('jurisdiction.item2'),
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backHome')}
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-slate-400 mt-1">{t('lastUpdated')}: 21 décembre 2024</p>
              </div>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl">
              {t('intro')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Important Notice */}
          <AnimatedSection>
            <div className="bg-amber-50 rounded-2xl p-6 mb-10 border border-amber-200 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">{t('importantNotice')}</h3>
                <p className="text-sm text-amber-700">{t('importantNoticeText')}</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <AnimatedSection key={section.title} delay={index * 0.1}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.title}</h2>
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Contact & Accept */}
          <AnimatedSection delay={0.8}>
            <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
              <Clock className="w-10 h-10 mx-auto mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">{t('questions')}</h3>
              <p className="text-blue-100 mb-4">{t('contactUs')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    {t('contactButton')}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    {t('backToSite')}
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
