import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HomeHeader } from "@/pages/home/components/HomeHeader"
import { MonthlyStats } from "@/pages/home/components/MonthlyStats"
import { QuickActions } from "@/pages/home/components/QuickActions"
import { CalendarGrid } from "@/pages/home/components/CalendarGrid"
import { 
  Calendar, 
  Timer, 
  Target, 
  Plus, 
  Save, 
  Trash2,
  Building2, 
  AlertCircle,
  CheckCircle,
  Edit
} from "lucide-react"

// Types pour la saisie de temps
interface TimeEntry {
  id: string
  date: string
  groupe: string
  projet: string
  activite: string
  heures: number
  description: string
  status: 'draft' | 'saved'
}

interface NewTimeEntry {
  groupe: string
  projet: string
  activite: string
  heures: number
  description: string
}

// Données prédéfinies
const GROUPES = ["TechCorp", "DataFlow", "InnoTech", "StartupXYZ"]

const PROJETS_BY_GROUPE: { [key: string]: string[] } = {
  "TechCorp": ["Application Mobile", "CRM System", "Site Web"],
  "DataFlow": ["Analytics Dashboard", "Machine Learning", "API Gateway"],
  "InnoTech": ["Site E-commerce", "Plateforme SaaS", "Application Desktop"],
  "StartupXYZ": ["MVP Development", "Marketing Site", "Admin Panel"]
}

const ACTIVITES = [
  "Développement Frontend", "Développement Backend", "API Development",
  "Base de données", "Tests Unitaires", "Tests E2E", "Design UI/UX",
  "Architecture", "Déploiement", "Documentation", "Réunions", "Formation"
]

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [newEntry, setNewEntry] = useState<NewTimeEntry>({
    groupe: '', projet: '', activite: '', heures: 0, description: ''
  })
  const [, setEditingEntry] = useState<string | null>(null)
  const [joursFeries, setJoursFeries] = useState<Set<string>>(new Set())

  // Récupérer les jours fériés depuis l'API
  useEffect(() => {
    const fetchJoursFeries = async () => {
      try {
        // API française des jours fériés: https://calendrier.api.gouv.fr/jours-feries/metropole/{annee}.json
        const response = await fetch(`https://calendrier.api.gouv.fr/jours-feries/metropole/${selectedYear}.json`)
        if (response.ok) {
          const data = await response.json()
          // data est un objet avec des dates en clés (format YYYY-MM-DD)
          const feriesSet = new Set(Object.keys(data))
          setJoursFeries(feriesSet)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des jours fériés:', error)
      }
    }

    fetchJoursFeries()
  }, [selectedYear])

  // Fonction pour vérifier si une date est un weekend
  const isWeekend = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // 0 = dimanche, 6 = samedi
  }

  // Fonction pour vérifier si une date est un jour férié
  const isJourFerie = (dateStr: string): boolean => {
    return joursFeries.has(dateStr)
  }

  // Fonction pour vérifier si une date est non-travaillée
  const isNonWorkingDay = (year: number, month: number, day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isWeekend(year, month, day) || isJourFerie(dateStr)
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  // Générer les jours du mois
  const generateMonthDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0

    const days = []
    
    // Jours vides au début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  // Fonctions de gestion
  const handleNewEntryChange = (field: keyof NewTimeEntry, value: string | number) => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'groupe' ? { projet: '' } : {})
    }))
  }

  const addTimeEntry = () => {
    if (!selectedDate || !newEntry.groupe || !newEntry.projet || !newEntry.activite || newEntry.heures <= 0) {
      alert('Veuillez sélectionner une date et remplir tous les champs requis')
      return
    }

    const entry: TimeEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      ...newEntry,
      status: 'draft'
    }

    setTimeEntries(prev => [...prev, entry])
    setNewEntry({ groupe: '', projet: '', activite: '', heures: 0, description: '' })
  }

  const saveEntry = (id: string) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, status: 'saved' } : entry
    ))
  }

  const deleteEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id))
  }

  // Fonctions de raccourcis
  const copyPreviousDay = () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date d'abord")
      return
    }
    
    const currentDate = new Date(selectedDate)
    const previousDay = new Date(currentDate)
    previousDay.setDate(currentDate.getDate() - 1)
    const previousDayStr = previousDay.toISOString().split('T')[0]
    
    const previousEntries = timeEntries.filter(entry => entry.date === previousDayStr)
    
    if (previousEntries.length === 0) {
      alert("Aucune entrée trouvée pour le jour précédent")
      return
    }
    
    const newEntries = previousEntries.map(entry => ({
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      date: selectedDate,
      status: 'draft' as const
    }))
    
    setTimeEntries(prev => [...prev, ...newEntries])
    alert(`${newEntries.length} entrée(s) copiée(s) depuis le jour précédent`)
  }

  const applyQuickTemplate = () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date d'abord")
      return
    }
    
    const templateEntries = [
      {
        id: Date.now().toString() + '_1',
        date: selectedDate,
        groupe: "Entreprise A",
        projet: "Développement Web",
        activite: "Programmation",
        heures: 4,
        description: "Développement fonctionnalités",
        status: 'draft' as const
      },
      {
        id: Date.now().toString() + '_2',
        date: selectedDate,
        groupe: "Entreprise A", 
        projet: "Gestion de Projet",
        activite: "Réunions",
        heures: 2,
        description: "Réunion équipe",
        status: 'draft' as const
      }
    ]
    
    setTimeEntries(prev => [...prev, ...templateEntries])
    alert("Template de journée type appliqué !")
  }

  const repeatLastEntry = () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date d'abord")
      return
    }
    
    if (timeEntries.length === 0) {
      alert("Aucune entrée précédente à répéter")
      return
    }
    
    const lastEntry = timeEntries[timeEntries.length - 1]
    
    setNewEntry({
      groupe: lastEntry.groupe,
      projet: lastEntry.projet,
      activite: lastEntry.activite,
      heures: lastEntry.heures,
      description: lastEntry.description
    })
    
    alert("Dernière entrée chargée dans le formulaire")
  }

  // Calculs
  const getEntriesForDate = (date: string) => timeEntries.filter(entry => entry.date === date)
  const getDailyTotal = (date: string) => getEntriesForDate(date).reduce((sum, entry) => sum + entry.heures, 0)
  
  const monthlyTotal = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear
    })
    .reduce((sum, entry) => sum + entry.heures, 0)

  const workingDays = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear
    })
    .reduce((acc, entry) => {
      acc.add(entry.date)
      return acc
    }, new Set()).size

  const getAvailableProjects = (groupe: string) => PROJETS_BY_GROUPE[groupe] || []
  const monthDays = generateMonthDays()

  const getIntensityClass = (hours: number) => {
    if (hours === 0) return "bg-gray-100"
    if (hours < 2) return "bg-blue-100 border-blue-200"
    if (hours < 4) return "bg-blue-200 border-blue-300"
    if (hours < 6) return "bg-blue-400 border-blue-500"
    if (hours < 8) return "bg-indigo-500 border-indigo-600"
    return "bg-indigo-600 border-indigo-700"
  }

  const getTextColorClass = (hours: number) => {
    return hours >= 6 ? "text-white font-semibold" : hours >= 2 ? "text-blue-900 font-medium" : "text-gray-700"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          
          <HomeHeader />

        <MonthlyStats
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          monthlyTotal={monthlyTotal}
          workingDays={workingDays}
          monthNames={monthNames}
        />

        <Card className="mb-6">
          <CardContent className="pt-6">
            <QuickActions
              selectedDate={selectedDate}
              copyPreviousDay={copyPreviousDay}
              repeatLastEntry={repeatLastEntry}
              applyQuickTemplate={applyQuickTemplate}
            />

            <CalendarGrid
              monthDays={monthDays}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getDailyTotal={getDailyTotal}
              getIntensityClass={getIntensityClass}
              getTextColorClass={getTextColorClass}
              isNonWorkingDay={isNonWorkingDay}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de saisie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Nouvelle Entrée de Temps
              </CardTitle>
              <CardDescription>
                Ajoutez une nouvelle activité pour la date sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Société/Groupe *
                </label>
                <Select 
                  value={newEntry.groupe} 
                  onValueChange={(value) => handleNewEntryChange('groupe', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une société" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPES.map(groupe => (
                      <SelectItem key={groupe} value={groupe}>{groupe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet *
                </label>
                <Select 
                  value={newEntry.projet} 
                  onValueChange={(value) => handleNewEntryChange('projet', value)}
                  disabled={!newEntry.groupe}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProjects(newEntry.groupe).map(projet => (
                      <SelectItem key={projet} value={projet}>{projet}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activité *
                </label>
                <Select 
                  value={newEntry.activite} 
                  onValueChange={(value) => handleNewEntryChange('activite', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une activité" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITES.map(activite => (
                      <SelectItem key={activite} value={activite}>{activite}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'heures *
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={newEntry.heures}
                  onChange={(e) => handleNewEntryChange('heures', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  value={newEntry.description}
                  onChange={(e) => handleNewEntryChange('description', e.target.value)}
                  placeholder="Description optionnelle de l'activité"
                />
              </div>

              <Button onClick={addTimeEntry} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter l'Entrée
              </Button>
            </CardContent>
          </Card>

          {/* Liste des entrées pour la date sélectionnée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="h-5 w-5 mr-2 text-primary" />
                {selectedDate ? `Entrées du ${new Date(selectedDate).toLocaleDateString('fr-FR')}` : "Sélectionnez une date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Cliquez sur une date dans le calendrier</p>
                  <p className="text-sm">pour voir et gérer les entrées</p>
                </div>
              ) : getEntriesForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune entrée pour cette date</p>
                  <p className="text-sm">Ajoutez votre première activité !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getEntriesForDate(selectedDate).map((entry) => (
                    <Card key={entry.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{entry.groupe}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-700">{entry.projet}</span>
                          </div>
                          <Badge className={entry.status === 'saved' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {entry.status === 'saved' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Sauvé</>
                            ) : (
                              <><Edit className="h-3 w-3 mr-1" />Brouillon</>
                            )}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{entry.activite}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{entry.heures}h</span>
                          </div>
                          {entry.description && (
                            <p className="text-sm text-gray-600 italic mt-2">"{entry.description}"</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingEntry(entry.id)}>
                              Modifier
                            </Button>
                            {entry.status === 'draft' && (
                              <Button size="sm" onClick={() => saveEntry(entry.id)}>
                                <Save className="h-4 w-4 mr-1" />
                                Sauvegarder
                              </Button>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages d'aide */}
        {selectedDate && getDailyTotal(selectedDate) > 8 && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Attention : Vous avez saisi plus de 8h pour cette journée ({getDailyTotal(selectedDate).toFixed(1)}h total)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDate && getDailyTotal(selectedDate) === 8 && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Parfait ! Vous avez atteint votre objectif de 8h pour cette journée.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Légende du calendrier */}
        <Card className="mt-6 border-accent bg-accent">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Légende du calendrier :</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span className="text-xs text-muted-foreground">0h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span className="text-xs text-muted-foreground">1-2h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span className="text-xs text-muted-foreground">2-4h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-xs text-muted-foreground">4-6h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span className="text-xs text-muted-foreground">6-8h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <span className="text-xs text-muted-foreground">8h+</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 opacity-60 rounded border border-gray-300"></div>
                  <span className="text-xs text-muted-foreground">Weekend / Jour férié (non cliquable)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        </div>
      </div>
    </div>
  )
}