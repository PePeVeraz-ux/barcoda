import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Barcoda Bazar - Figuras de Acción",
  description: "La mejor tienda de figuras de acción coleccionables. Encuentra tus personajes favoritos de Marvel, DC, Star Wars y más.",
  keywords: ["figuras de acción", "coleccionables", "marvel", "dc", "star wars", "anime"],
  authors: [{ name: "Barcoda Bazar" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Barcoda Bazar - Figuras de Acción",
    description: "La mejor tienda de figuras de acción coleccionables",
    type: "website",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="CgZOcwX4Z-irI75Wx4MkdtU_mnX9RF2q85IB_noo3Q4" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SpeedInsights />
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WishlistProvider>
              <Navbar />
              {children}
              <Footer />
              <Toaster />
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
