"use client"

import type { ReactNode } from "react"

type MarqueeProps = {
  children: ReactNode
  className?: string
}

export function Marquee({ children, className }: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div className="marquee-track">
        <div className="marquee-content">{children}</div>
        <div className="marquee-content" aria-hidden="true">
          {children}
        </div>
      </div>
      <style jsx>{`
        .marquee-track {
          display: flex;
          width: fit-content;
          animation: marquee 22s linear infinite;
        }

        .marquee-content {
          display: inline-flex;
          align-items: center;
          gap: 2.5rem;
          padding-right: 4rem;
          white-space: nowrap;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
