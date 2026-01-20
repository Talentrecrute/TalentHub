'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Globe, Handshake, Heart, Sparkles, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

// Islands we serve
const islands = [
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Comores', flag: '🇰🇲' },
  { name: 'Maurice', flag: '🇲🇺' },
  { name: 'Mayotte', flag: '🇾🇹' },
  { name: 'La Réunion', flag: '🇷🇪' },
  { name: 'Seychelles', flag: '🇸🇨' },
]

// Animated section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated card with hover effect
function AnimatedCard({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="cursor-pointer"
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
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
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

// Counter animation
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  )
}

export default function AboutPage() {
  const t = useTranslations('about')
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Our values with icons
  const values = [
    {
      icon: Heart,
      title: t('values.solidarity'),
      description: t('values.solidarityDesc'),
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Target,
      title: t('values.transparency'),
      description: t('values.transparencyDesc'),
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Globe,
      title: t('values.connection'),
      description: t('values.connectionDesc'),
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Handshake,
      title: t('values.opportunity'),
      description: t('values.opportunityDesc'),
      color: 'from-blue-500 to-indigo-500',
    },
  ]

  // Founders
  const founders = [
    {
      name: t('founders.sidi.name'),
      role: t('founders.sidi.role'),
      description: t('founders.sidi.description'),
      gradient: 'from-teal-400 to-blue-500',
    },
    {
      name: t('founders.ibrahim.name'),
      role: t('founders.ibrahim.role'),
      description: t('founders.ibrahim.description'),
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      name: t('founders.noureddine.name'),
      role: t('founders.noureddine.role'),
      description: t('founders.noureddine.description'),
      gradient: 'from-amber-400 to-orange-500',
    },
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-24 overflow-hidden min-h-[70vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-teal-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          
          {/* Floating islands emoji */}
          <FloatingElement delay={0} duration={4}>
            <div className="absolute top-1/4 right-1/4 text-7xl opacity-30">🏝️</div>
          </FloatingElement>
          <FloatingElement delay={1} duration={5}>
            <div className="absolute bottom-1/3 left-1/4 text-5xl opacity-25">🌊</div>
          </FloatingElement>
          <FloatingElement delay={2} duration={3.5}>
            <div className="absolute top-1/3 left-1/6 text-4xl opacity-20">✨</div>
          </FloatingElement>
          <FloatingElement delay={0.5} duration={4.5}>
            <div className="absolute bottom-1/4 right-1/3 text-6xl opacity-25">🐋</div>
          </FloatingElement>
          
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
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

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
            <span className="text-sm font-medium">{t('since')}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            {t('heroTitle')}<br />
            <motion.span 
              className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {t('heroTitleHighlight')}
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-1"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-white/70 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <motion.path 
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" 
              fill="white"
              initial={{ d: "M0,80 C360,80 720,80 1080,80 C1260,80 1380,80 1440,80 L1440,120 L0,120 Z" }}
              animate={{ d: "M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </svg>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <motion.span 
                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                📖
              </motion.span>
              {t('ourStory')}
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-2xl p-8 border border-teal-100 relative overflow-hidden">
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-teal-200/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                <strong className="text-teal-700">OceanicJob</strong> {t('storyPart1').replace('OceanicJob est', 'est')}
              </p>

              <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                {t('storyPart2')}
              </p>

              <motion.div 
                className="bg-white rounded-xl p-6 border-l-4 border-teal-500 shadow-sm relative z-10"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-slate-600 italic mb-0">
                  &quot;{t('storyQuote')}&quot;
                </p>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <AnimatedSection>
              <motion.div 
                className="bg-red-50 rounded-2xl p-8 border border-red-100 h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="text-3xl">😔</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-red-900 mb-4">{t('theProblem')}</h3>
                <ul className="space-y-3 text-red-800">
                  {['unemployment', 'orientation', 'corruption', 'disconnect'].map((key, i) => (
                    <motion.li 
                      key={key}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.span 
                        className="text-red-500 mt-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, delay: i * 0.2 }}
                      >
                        ✗
                      </motion.span>
                      <span>{t(`problemList.${key}`)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatedSection>

            {/* Solution */}
            <AnimatedSection delay={0.2}>
              <motion.div 
                className="bg-teal-50 rounded-2xl p-8 border border-teal-100 h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <span className="text-3xl">💡</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-teal-900 mb-4">{t('ourSolution')}</h3>
                <ul className="space-y-3 text-teal-800">
                  {['transparent', 'connection', 'remote', 'solidarity'].map((key, i) => (
                    <motion.li 
                      key={key}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.span 
                        className="text-teal-500 mt-1"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", delay: i * 0.15 }}
                        viewport={{ once: true }}
                      >
                        ✓
                      </motion.span>
                      <span>{t(`solutionList.${key}`)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-teal-800 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-white/5 rounded-full blur-2xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 5 + i,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-6">{t('opportunityTitle')}</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-blue-100 mb-8">
              {t('opportunityText')}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
              whileHover={{ scale: 1.02 }}
            >
              <motion.p 
                className="text-2xl font-semibold text-teal-300 mb-4"
                animate={{ 
                  textShadow: ["0 0 10px rgba(94, 234, 212, 0)", "0 0 20px rgba(94, 234, 212, 0.5)", "0 0 10px rgba(94, 234, 212, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {t('opportunityHighlight')}
              </motion.p>
              <p className="text-blue-100">
                {t('opportunityDetails')}
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('ourValues')}</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <AnimatedCard key={value.title} index={index}>
                <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl p-6 border border-slate-100 h-full hover:shadow-xl transition-shadow duration-300">
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <value.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Islands We Serve */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('islandsTitle')}</h2>
            <p className="text-slate-600 mb-10">{t('islandsSubtitle')}</p>
          </AnimatedSection>
          
          <div className="flex flex-wrap justify-center gap-4">
            {islands.map((island, index) => (
              <motion.div 
                key={island.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 flex items-center gap-3 cursor-pointer"
              >
                <motion.span 
                  className="text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, delay: index * 0.3, repeat: Infinity, repeatDelay: 4 }}
                >
                  {island.flag}
                </motion.span>
                <span className="font-medium text-slate-700">{island.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t('teamTitle')}</h2>
            <p className="text-slate-600 text-center mb-12">{t('teamSubtitle')}</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <AnimatedCard key={founder.name} index={index}>
                <div className="text-center">
                  <motion.div 
                    className={`w-32 h-32 mx-auto mb-4 bg-gradient-to-br ${founder.gradient} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {founder.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-900">{founder.name}</h3>
                  <p className="text-sm text-teal-600 font-medium mb-2">{founder.role}</p>
                  <p className="text-sm text-slate-500">{founder.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {/* Special thanks */}
          <AnimatedSection delay={0.4}>
            <motion.div 
              className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.span 
                className="text-3xl mb-3 block"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                🙏
              </motion.span>
              <p className="text-amber-800">
                {t('thankYou')}
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
          animate={{ backgroundPosition: ["0 0", "40px 40px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-teal-100 mb-8">
              {t('ctaSubtitle')}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/jobs">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 px-8 shadow-lg">
                    {t('findJob')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/employer/post-job">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    {t('recruitTalent')}
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
