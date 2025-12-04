import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Shield, Building2 } from "lucide-react"

interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  managers: number
  employees: number
}

interface StatsCardsProps {
  stats: UserStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 md:mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Total Utilisateurs</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.active} actifs, {stats.inactive} inactifs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Administrateurs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{stats.admins}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Accès complet
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Managers</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{stats.managers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Gestion d'équipe
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Employés</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{stats.employees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Utilisateurs standards
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
