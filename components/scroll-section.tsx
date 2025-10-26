"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { ReactNode } from "react"

interface ScrollSectionProps {
  children: ReactNode
  animation?: "slide-up" | "slide-down" | "fade" | "scale"
  className?: string
}

export function ScrollSection({ children, animation = "slide-up", className = "" }: ScrollSectionProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div ref={ref} className={`scroll-animate scroll-${animation} ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  )
}
