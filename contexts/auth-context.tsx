"use client"

import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useRef } from "react"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const initRef = useRef(false) // Para evitar doble inicialización

  useEffect(() => {
    // Evitar doble inicialización en desarrollo (React StrictMode)
    if (initRef.current) return
    initRef.current = true

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        setUser(currentUser)

        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single()
          
          setIsAdmin(profile?.role === "admin")
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      
      // Solo actualizar si realmente cambió el usuario
      setUser((prevUser) => {
        if (!prevUser && !currentUser) return prevUser
        if (prevUser && currentUser && prevUser.id === currentUser.id) return prevUser
        return currentUser
      })

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
        
        setIsAdmin(profile?.role === "admin")
      } else {
        setIsAdmin(false)
      }

      // Solo marcar como no loading si estaba loading
      setIsLoading((prev) => (prev ? false : prev))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
