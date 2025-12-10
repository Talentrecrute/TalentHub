'use client'

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

// Page wrapper for consistent page animations
export function PageWrapper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Section wrapper for scroll-triggered animations
export function AnimatedSection({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// Card with hover animation
export function AnimatedCard({ 
  children, 
  className = '',
  hoverLift = true 
}: { 
  children: ReactNode
  className?: string
  hoverLift?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={hoverLift ? { y: -5, transition: { duration: 0.2 } } : undefined}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Button with spring animation
export function AnimatedButton({ 
  children, 
  className = '',
  onClick 
}: { 
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

// List with staggered children
export function StaggerList({ 
  children, 
  className = '',
  staggerDelay = 0.05 
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// List item for stagger
export function StaggerListItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade in element
export function FadeIn({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}: { 
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const directionVariants = {
    up: { initial: { y: 20 }, animate: { y: 0 } },
    down: { initial: { y: -20 }, animate: { y: 0 } },
    left: { initial: { x: -20 }, animate: { x: 0 } },
    right: { initial: { x: 20 }, animate: { x: 0 } },
    none: { initial: {}, animate: {} }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionVariants[direction].initial }}
      whileInView={{ opacity: 1, ...directionVariants[direction].animate }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated form
export function AnimatedForm({ 
  children, 
  className = '',
  onSubmit 
}: { 
  children: ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
      onSubmit={onSubmit}
    >
      {children}
    </motion.form>
  )
}

// Slide up notification/toast
export function SlideUpNotification({ 
  children, 
  isVisible,
  className = '' 
}: { 
  children: ReactNode
  isVisible: boolean
  className?: string
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Skeleton loader with shimmer
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-slate-200 rounded ${className}`}
      animate={{ 
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      style={{
        background: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
        backgroundSize: '200% 100%',
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
    />
  )
}

// Icon with bounce on hover
export function AnimatedIcon({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={className}
    >
      {children}
    </motion.span>
  )
}

// Badge with pop animation
export function AnimatedBadge({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
      className={className}
    >
      {children}
    </motion.span>
  )
}

// Expandable section
export function ExpandableSection({ 
  children, 
  isOpen,
  className = '' 
}: { 
  children: ReactNode
  isOpen: boolean
  className?: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Modal animation wrapper
export function AnimatedModal({ 
  children, 
  isOpen,
  onClose,
  className = '' 
}: { 
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  className?: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-50 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
