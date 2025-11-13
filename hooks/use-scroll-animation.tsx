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

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, options])

  return { ref, isVisible }
}
