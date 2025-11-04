import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen, Clock, Settings, BarChart3, Database } from "lucide-react"

export default function AdminPage() {
  const stats = [
    {
      title: "Utilisateurs actifs",
      value: "248",
      change: "+12%",
  icon: Users,
  color: "bg-purple-500"
    },
    {
      title: "Projets en cours",
      value: "42",
      change: "+8%", 
      icon: FolderOpen,
      color: "bg-green-500"
    },
    {
      title: "Heures cette semaine",
      value: "1,247",
      change: "+5%",
      icon: Clock,
      color: "bg-purple-500"
    },
    {
      title: "Tâches complétées",
      value: "186",
      change: "+18%",
      icon: BarChart3,
      color: "bg-orange-500"
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
            <Button>
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
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-md`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">
                    {stat.change} par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Admin Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Gérer les utilisateurs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Gérer les projets
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Maintenance DB
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Voir les rapports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Paramètres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
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
              <Button className="w-full mt-4" variant="outline">
                Voir le monitoring
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}