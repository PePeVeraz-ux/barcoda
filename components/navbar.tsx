"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut, Search, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useCartCount } from "@/hooks/use-cart-count"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { useState, memo, useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export const Navbar = memo(function Navbar() {
  const { user, isAdmin, isLoading, signOut } = useAuth()
  const { count: cartCount } = useCartCount()
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await signOut()
    router.push("/")
  }, [signOut, router])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
      <div className="container flex h-14 md:h-16 items-center justify-between gap-4">
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

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Button - Mobile */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full">
              <SheetHeader>
                <SheetTitle>Buscar productos</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SearchBar />
              </div>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
          
          {!isLoading && user && (
            <>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="transition-transform hover:scale-110" title="Mis Favoritos">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </>
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
                  <Link href="/orders" className="cursor-pointer">
                    Mis Órdenes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Mis Favoritos
                  </Link>
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
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
})
