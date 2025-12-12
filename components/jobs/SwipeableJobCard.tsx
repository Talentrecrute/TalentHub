'use client'

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Bookmark, X as XIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface SwipeableJobCardProps {
  children: ReactNode
  onSwipeRight?: () => void  // Save
  onSwipeLeft?: () => void   // Dismiss/Skip
  isSaved?: boolean
}

export default function SwipeableJobCard({ 
  children, 
  onSwipeRight, 
  onSwipeLeft,
  isSaved = false 
}: SwipeableJobCardProps) {
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  
  // Transform x motion into rotation and opacity
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const saveOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const skipOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      // Swiped right - Save
      setExitX(300)
      onSwipeRight?.()
    } else if (info.offset.x < -threshold) {
      // Swiped left - Skip
      setExitX(-300)
      onSwipeLeft?.()
    }
  }

  return (
    <div className="relative touch-pan-y">
      {/* Save indicator (right swipe) */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-100 to-teal-200 rounded-xl flex items-center justify-end pr-8 pointer-events-none z-0"
        style={{ opacity: saveOpacity }}
      >
        <div className="flex items-center gap-2 text-teal-600">
          <Bookmark className="w-8 h-8 fill-teal-600" />
          <span className="font-semibold text-lg">Sauvegarder</span>
        </div>
      </motion.div>

      {/* Skip indicator (left swipe) */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-l from-transparent via-red-100 to-red-200 rounded-xl flex items-center justify-start pl-8 pointer-events-none z-0"
        style={{ opacity: skipOpacity }}
      >
        <div className="flex items-center gap-2 text-red-600">
          <XIcon className="w-8 h-8" />
          <span className="font-semibold text-lg">Passer</span>
        </div>
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity: cardOpacity }}
        animate={{ x: exitX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {children}
        
        {/* Saved badge */}
        {isSaved && (
          <div className="absolute top-4 right-4 bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Bookmark className="w-3 h-3 fill-white" />
            Sauvegardé
          </div>
        )}
      </motion.div>

      {/* Swipe hint - only show on first render */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-400 pointer-events-none lg:hidden">
        ← Passer | Sauvegarder →
      </div>
    </div>
  )
}
