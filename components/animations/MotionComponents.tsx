'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { ReactNode, useRef } from 'react'

// Fade in from bottom animation
export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade in from left
export function FadeInLeft({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade in from right
export function FadeInRight({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale up on hover
export function ScaleOnHover({ 
  children, 
  scale = 1.05,
  className = '' 
}: { 
  children: ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger child item
export function StaggerItem({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// Pulse animation for CTAs
export function PulseButton({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 rgba(13, 148, 136, 0)',
          '0 0 0 8px rgba(13, 148, 136, 0.1)',
          '0 0 0 0 rgba(13, 148, 136, 0)'
        ]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Floating animation
export function FloatingElement({ 
  children, 
  amplitude = 10,
  duration = 3,
  className = '' 
}: { 
  children: ReactNode
  amplitude?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ 
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Page transition wrapper
export function PageTransition({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
