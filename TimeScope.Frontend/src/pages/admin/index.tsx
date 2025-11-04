import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen, Clock, Settings, BarChart3, Database } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AdminPage() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Utilisateurs actifs",
      value: "248",
      change: "+12%",
      icon: Users,
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      cardBg: "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
    },
    {
      title: "Projets en cours",
      value: "42",
      change: "+8%",
      icon: FolderOpen,
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      cardBg: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    },
    {
      title: "Heures cette semaine",
      value: "1,247",
      change: "+5%",
      icon: Clock,
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
    },
    {
      title: "Tâches complétées",
      value: "186",
      change: "+18%",
      icon: BarChart3,
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
      cardBg: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
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
                  <p className="text-xs text-green-600 font-semibold">
                    {stat.change} par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Admin Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg mr-2">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription>
                Gérer les comptes utilisateurs et les permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">248 utilisateurs actifs</p>
                <p className="text-sm text-muted-foreground">12 nouveaux cette semaine</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white" onClick={() => navigate('/admin/user_management')}>
                Gérer les utilisateurs
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg mr-2">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                Projets et équipes
              </CardTitle>
              <CardDescription>
                Organiser les projets et configurer les équipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">42 projets actifs</p>
                <p className="text-sm text-muted-foreground">8 équipes configurées</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" onClick={() => navigate('/admin/projects')}>
                Gérer les projets
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg mr-2">
                  <Database className="h-5 w-5 text-white" />
                </div>
                Base de données
              </CardTitle>
              <CardDescription>
                Maintenance et sauvegarde des données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Dernière sauvegarde: Aujourd&apos;hui</p>
                <p className="text-sm text-muted-foreground">Taille: 2.4 GB</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white" onClick={() => navigate('/admin/database-maintenance')}>
                Maintenance DB
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg mr-2">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Rapports avancés
              </CardTitle>
              <CardDescription>
                Générer et consulter des rapports détaillés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">15 rapports disponibles</p>
                <p className="text-sm text-muted-foreground">Exportation automatique activée</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white" onClick={() => navigate('/admin/reports')}>
                Voir les rapports
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-2 rounded-lg mr-2">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Configuration système
              </CardTitle>
              <CardDescription>
                Paramètres généraux et configuration avancée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Version: 1.0.0</p>
                <p className="text-sm text-muted-foreground">Dernière mise à jour: 02/11/2025</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white" onClick={() => navigate('/admin/settings')}>
                Paramètres
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-100 hover:border-pink-300 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-lg mr-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Monitoring temps réel
              </CardTitle>
              <CardDescription>
                Surveillance en temps réel de l&apos;activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">89 utilisateurs connectés</p>
                <p className="text-sm text-muted-foreground">Serveur: En ligne</p>
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white" onClick={() => navigate('/admin/monitoring')}>
                Voir le monitoring
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}