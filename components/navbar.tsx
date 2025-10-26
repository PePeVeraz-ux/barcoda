"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        const isAdminUser = profile?.role === "admin"
        setIsAdmin(isAdminUser)
        setIsLoading(false)
      } else {
        setIsAdmin(false)
        setIsLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
        const isAdminUser = profile?.role === "admin"
        setIsAdmin(isAdminUser)
        router.refresh()
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary transition-transform hover:scale-110">
              <span className="text-base md:text-lg font-bold text-primary-foreground">AF</span>
            </div>
            <span className="text-lg md:text-xl font-bold hidden sm:inline">Action Figures</span>
            <span className="text-lg md:text-xl font-bold sm:hidden">AF Store</span>
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
          {user && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {user ? (
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
          ) : (
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
