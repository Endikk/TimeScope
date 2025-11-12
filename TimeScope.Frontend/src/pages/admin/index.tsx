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
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      title: "Projets en cours",
      value: statistics.statistics?.totalProjects.toString() || "0",
      total: null,
      icon: FolderOpen,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      title: "Entrées de temps",
      value: statistics.statistics?.totalTimeEntries.toString() || "0",
      total: null,
      icon: Clock,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      title: "Tâches totales",
      value: statistics.statistics?.totalTasks.toString() || "0",
      total: null,
      icon: BarChart3,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-muted-foreground">
              Gérez votre instance TimeScope
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">v1.0.0</Badge>
            <Button onClick={refetchAll} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className={`${stat.cardBg} border shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.iconBg} p-2.5 rounded-lg shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  {stat.total && (
                    <p className="text-xs text-gray-600 mt-1">
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
          <h2 className="text-xl font-semibold mb-4">Accès Rapide</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2"
                  onClick={() => navigate(link.path)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-br ${link.gradient} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
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
