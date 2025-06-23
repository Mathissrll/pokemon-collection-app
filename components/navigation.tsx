"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Package, BarChart3, Settings, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthService } from "@/lib/auth-service"
import { useEffect, useState } from "react"

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Ajouter", href: "/ajouter", icon: Plus },
  { name: "Collection", href: "/collection", icon: Package },
  { name: "Statistiques", href: "/statistiques", icon: BarChart3 },
  { name: "Paramètres", href: "/parametres", icon: Settings },
]

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Shield },
  { name: "Paiements", href: "/admin/payments", icon: Shield },
]

export function Navigation() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = () => {
      // Seul l'administrateur principal voit le lien admin
      setIsAdmin(AuthService.isAdmin())
    }
    
    checkAdminStatus()
    // Vérifier le statut admin toutes les 5 secondes
    const interval = setInterval(checkAdminStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {allNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
                item.name === "Admin" ? "text-orange-600" : ""
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
