"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const checkUserRole = useCallback(async (userId: string) => {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
    return profile?.role === "admin"
  }, [supabase])

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!mounted) return
        
        setUser(user)

        if (user) {
          const isAdminUser = await checkUserRole(user.id)
          if (mounted) {
            setIsAdmin(isAdminUser)
            setIsLoading(false)
          }
        } else {
          if (mounted) {
            setIsAdmin(false)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const isAdminUser = await checkUserRole(session.user.id)
        if (mounted) {
          setIsAdmin(isAdminUser)
          setIsLoading(false)
        }
      } else {
        if (mounted) {
          setIsAdmin(false)
          setIsLoading(false)
        }
      }
      
      // Solo refrescar en eventos específicos
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, checkUserRole])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Image
              src="/logo.png"
              alt="Barcoda Bazar Logo"
              width={150}
              height={150}
              className="h-15 w-15 md:h-15 md:w-15"
              priority
            />
            <span className="text-lg md:text-xl font-bold">Barcoda Bazar</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Productos
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          {!isLoading && user && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {!isLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
                <DropdownMenuItem asChild>
                  <Link href="/orders">Mis Órdenes</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Panel Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isLoading && !user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild size="sm" className="md:size-default">
                <Link href="/auth/sign-up">
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
