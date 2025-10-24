// components/ui/animated-text-loop.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedTextLoopProps {
  words: string[]
  className?: string
}

export function AnimatedTextLoop({ words, className }: AnimatedTextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 500) // Half of the transition duration
    }, 3000) // Change word every 3 seconds

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span className="inline-block relative">
      <span
        className={cn(
          "inline-block transition-all duration-500 ease-in-out",
          isAnimating ? "opacity-0 translate-y-4 blur-sm" : "opacity-100 translate-y-0 blur-0",
          className
        )}
      >
        {words[currentIndex]}
      </span>
    </span>
  )
}