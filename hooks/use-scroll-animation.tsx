"use client"

import { useCallback, useEffect, useState } from "react"

export function useScrollAnimation(options?: IntersectionObserverInit) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const ref = useCallback((node: HTMLDivElement | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element) {
      return
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        ...options,
      },
    )

    const rect = element.getBoundingClientRect()
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      setIsVisible(true)
      observer.disconnect()
    } else {
      observer.observe(element)
    }

    const fallbackTimeout = window.setTimeout(() => {
      setIsVisible(true)
      observer.disconnect()
    }, 750)

    return () => {
      window.clearTimeout(fallbackTimeout)
      observer.disconnect()
    }
  }, [element, options])

  return { ref, isVisible }
}
