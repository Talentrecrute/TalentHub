'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/routing'
import { motion, useInView } from 'framer-motion'
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Globe, Loader2, Mail, MapPin, MessageSquare, Send, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

// Animated section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Floating animation for background elements
function FloatingElement({ children, delay = 0, duration = 3 }: { children: React.ReactNode; delay?: number; duration?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

const CONTACT_EMAIL = 'contact@oceanic-job.com'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      setIsSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: t('email'),
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: MapPin,
      title: t('location'),
      value: t('locationValue'),
      href: null,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Clock,
      title: t('responseTime'),
      value: t('responseTimeValue'),
      href: null,
      color: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          {/* Floating elements */}
          <FloatingElement delay={0} duration={4}>
            <div className="absolute top-1/4 right-1/4 text-6xl opacity-20">💬</div>
          </FloatingElement>
          <FloatingElement delay={1} duration={5}>
            <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-15">📧</div>
          </FloatingElement>
          <FloatingElement delay={0.5} duration={3.5}>
            <div className="absolute top-1/3 right-1/3 text-5xl opacity-20">🌊</div>
          </FloatingElement>
          
          {/* Animated particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
            <span className="text-sm font-medium">{t('available')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-teal-100 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <motion.path
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z"
              fill="white"
              initial={{ d: "M0,80 C360,80 720,80 1080,80 C1260,80 1380,80 1440,80 L1440,120 L0,120 Z" }}
              animate={{ d: "M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection>
              <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl p-8 border border-slate-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <MessageSquare className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('formTitle')}</h2>
                    <p className="text-sm text-slate-500">{t('formSubtitle')}</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('successTitle')}</h3>
                    <p className="text-slate-600 mb-6">{t('successMessage')}</p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="border-teal-500 text-teal-600 hover:bg-teal-50"
                    >
                      {t('sendAnother')}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </motion.div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('name')} *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('namePlaceholder')}
                          required
                          disabled={isSubmitting}
                          className="w-full"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('yourEmail')} *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t('emailPlaceholder')}
                          required
                          disabled={isSubmitting}
                          className="w-full"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('subject')} *
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={t('subjectPlaceholder')}
                        required
                        disabled={isSubmitting}
                        className="w-full"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('message')} *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('messagePlaceholder')}
                        required
                        disabled={isSubmitting}
                        rows={5}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-6 text-lg font-semibold shadow-lg shadow-teal-500/25 disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              {t('sending')}
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              {t('send')}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Contact Info */}
            <div className="space-y-6">
              <AnimatedSection delay={0.2}>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('otherWays')}</h2>
              </AnimatedSection>

              {contactInfo.map((info, index) => (
                <AnimatedSection key={info.title} delay={0.3 + index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4"
                  >
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: 10 }}
                    >
                      <info.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-slate-600">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}

              {/* Map or illustration */}
              <AnimatedSection delay={0.6}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-900 to-teal-800 rounded-2xl p-8 text-white relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-1/2 -right-1/2 w-full h-full"
                      style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>

                  <div className="relative z-10">
                    <Globe className="w-12 h-12 mb-4 text-teal-300" />
                    <h3 className="text-xl font-bold mb-2">{t('globalReach')}</h3>
                    <p className="text-blue-100 mb-4">{t('globalReachDesc')}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {['🇲🇬', '🇰🇲', '🇲🇺', '🇫🇷', '🇨🇦'].map((flag, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="text-2xl"
                        >
                          {flag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('faqTitle')}</h2>
            <p className="text-slate-600 mb-8">{t('faqSubtitle')}</p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/jobs">
                  <Button size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8">
                    {t('browseJobs')}
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('learnMore')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
