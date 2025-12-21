'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, Database, Eye, FileText, Globe, Lock, Mail, Shield, Users } from 'lucide-react'
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

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  const sections = [
    {
      icon: Database,
      title: t('dataCollection.title'),
      content: [
        t('dataCollection.item1'),
        t('dataCollection.item2'),
        t('dataCollection.item3'),
        t('dataCollection.item4'),
      ]
    },
    {
      icon: Eye,
      title: t('dataUse.title'),
      content: [
        t('dataUse.item1'),
        t('dataUse.item2'),
        t('dataUse.item3'),
        t('dataUse.item4'),
      ]
    },
    {
      icon: Lock,
      title: t('dataSecurity.title'),
      content: [
        t('dataSecurity.item1'),
        t('dataSecurity.item2'),
        t('dataSecurity.item3'),
      ]
    },
    {
      icon: Users,
      title: t('dataSharing.title'),
      content: [
        t('dataSharing.item1'),
        t('dataSharing.item2'),
        t('dataSharing.item3'),
      ]
    },
    {
      icon: Shield,
      title: t('yourRights.title'),
      content: [
        t('yourRights.item1'),
        t('yourRights.item2'),
        t('yourRights.item3'),
        t('yourRights.item4'),
        t('yourRights.item5'),
      ]
    },
    {
      icon: Globe,
      title: t('cookies.title'),
      content: [
        t('cookies.item1'),
        t('cookies.item2'),
        t('cookies.item3'),
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
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
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
          {/* RGPD Badge */}
          <AnimatedSection>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-teal-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t('rgpdCompliance')}</h3>
                <p className="text-sm text-slate-600">{t('rgpdText')}</p>
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
                            <span className="text-teal-500 mt-1">•</span>
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

          {/* Contact */}
          <AnimatedSection delay={0.6}>
            <div className="mt-10 bg-slate-900 rounded-2xl p-8 text-white text-center">
              <Mail className="w-10 h-10 mx-auto mb-4 text-teal-400" />
              <h3 className="text-xl font-semibold mb-2">{t('questions')}</h3>
              <p className="text-slate-400 mb-4">{t('contactUs')}</p>
              <Link href="/contact">
                <Button className="bg-teal-500 hover:bg-teal-600">
                  {t('contactButton')}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
