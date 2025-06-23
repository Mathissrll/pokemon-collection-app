"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, User, LogOut, Settings, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthService } from "@/lib/auth-service"
import { useState, useEffect } from "react"
import type { User as AuthUser } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  title: string
  showThemeToggle?: boolean
  showAuth?: boolean
}

export function Header({ title, showThemeToggle = true, showAuth = true }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    setUser(null)
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté. Vos données restent sauvegardées localement.",
    })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">{title}</h1>

        <div className="flex items-center gap-2">
          {showAuth && (
            <>
              {user ? (
                // Menu déroulant pour utilisateur connecté
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Menu utilisateur</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => (window.location.href = "/statistiques")}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Statistiques</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => (window.location.href = "/parametres")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      <span>Thème {theme === "dark" ? "clair" : "sombre"}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Confidentialité</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Bouton simple pour utilisateur non connecté
                <>
                  {showThemeToggle && (
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Basculer le thème</span>
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/auth")}>
                    <User className="h-4 w-4" />
                    <span className="sr-only">Se connecter</span>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
