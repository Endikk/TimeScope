import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen, Clock, Settings, BarChart3, Database, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAdministration } from "@/lib/hooks/use-administration"

export default function AdminPageAPI() {
  const navigate = useNavigate();
  const { statistics, refetchAll } = useAdministration();

  if (statistics.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Utilisateurs actifs",
      value: statistics.statistics?.activeUsers.toString() || "0",
      total: statistics.statistics?.totalUsers.toString() || "0",
      icon: Users,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Projets en cours",
      value: statistics.statistics?.totalProjects.toString() || "0",
      total: null,
      icon: FolderOpen,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Entrées de temps",
      value: statistics.statistics?.totalTimeEntries.toString() || "0",
      total: null,
      icon: Clock,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Tâches totales",
      value: statistics.statistics?.totalTasks.toString() || "0",
      total: null,
      icon: BarChart3,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
    }
  ]

  const quickLinks = [
    {
      title: "Gestion des Utilisateurs",
      description: "Gérer les comptes et les permissions",
      icon: Users,
      path: "/admin/user_management",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Gestion des Projets",
      description: "Organiser les projets et les groupes",
      icon: FolderOpen,
      path: "/admin/projects",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Rapports et Analyses",
      description: "Statistiques et logs d'audit",
      icon: BarChart3,
      path: "/admin/reports",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Monitoring Système",
      description: "Surveiller les ressources serveur",
      icon: Database,
      path: "/admin/monitoring",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Administration",
      description: "Gestion des bases de données",
      icon: Settings,
      path: "/admin/database-maintenance",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Paramètres",
      description: "Configuration de l'application",
      icon: Settings,
      path: "/admin/settings",
      gradient: "from-blue-500 to-indigo-600"
    }
  ]

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gérez votre instance TimeScope
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs md:text-sm">v1.0.0</Badge>
            <Button onClick={refetchAll} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
              <span className="sm:hidden">Actualis.</span>
            </Button>
            <Button onClick={() => navigate('/admin/settings')} size="sm" className="w-full sm:w-auto">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
              <span className="sm:hidden">Param.</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 md:mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className={`${stat.cardBg} border shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.iconBg} p-2 md:p-2.5 rounded-lg shadow-lg shrink-0`}>
                    <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  {stat.total && (
                    <p className="text-xs text-muted-foreground mt-1">
                      sur {stat.total} total
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Links Grid */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Accès Rapide</h2>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 bg-card"
                  onClick={() => navigate(link.path)}
                >
                  <CardHeader className="px-3 md:px-6 py-3 md:py-6">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-br ${link.gradient} p-2.5 md:p-3 rounded-lg shrink-0`}>
                        <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm md:text-base truncate">{link.title}</CardTitle>
                        <CardDescription className="text-xs md:text-sm mt-1">
                          {link.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
