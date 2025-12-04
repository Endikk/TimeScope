"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Settings,
  Bell,
  LogOut,
  Shield,
} from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProfileDropdownProps {
  variant?: "header" | "sidebar"
  align?: "start" | "center" | "end"
}

export function ProfileDropdown({
  variant = "header",
  align = "end",
}: ProfileDropdownProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Générer les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return "TS"
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }

  // Couleur du badge selon le rôle
  const getRoleBadgeVariant = () => {
    if (!user) return "secondary"
    switch (user.role) {
      case "Admin":
        return "destructive"
      case "Manager":
        return "default"
      default:
        return "secondary"
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur"
  const email = user?.email || "email@example.com"
  const role = user?.role || "User"

  if (variant === "header") {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={fullName} />
            <AvatarFallback className="text-blue font-semibold text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align={align} sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-12 w-12 rounded-lg border-2 border-border">
                <AvatarImage src={user?.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg text-blue font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none truncate">{fullName}</p>
                <p className="text-xs text-muted-foreground leading-none truncate">
                  {email}
                </p>
                <Badge variant={getRoleBadgeVariant()} className="w-fit text-xs mt-1">
                  <Shield className="mr-1 h-3 w-3" />
                  {role}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mon Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Variant sidebar (if needed in the future)
  return null
}
