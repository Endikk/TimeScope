import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Edit,
  Loader2,
  X
} from "lucide-react"
import { useGroups, useProjects, useThemes } from "@/lib/hooks/use-projects"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useTimeEntries, useTimeEntryMutations } from "@/lib/hooks/use-timeentries"
import type { CreateTimeEntryDto, UpdateTimeEntryDto } from "@/lib/api/services"

// Types pour la saisie de temps
interface LocalTimeEntry {
  id: string
  date: string
  groupeId: string
  groupeName: string
  projetId: string
  projetName: string
  themeId: string
  themeName: string
  taskId: string
  taskName: string
  heures: number
  description: string
  status: 'draft' | 'saved'
}

interface NewTimeEntry {
  groupeId: string
  projetId: string
  themeId: string
  taskId: string
  heures: number
  description: string
}

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [localEntries, setLocalEntries] = useState<LocalTimeEntry[]>([])
  const [newEntry, setNewEntry] = useState<NewTimeEntry>({
    groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: ''
  })
  const [editingEntry, setEditingEntry] = useState<LocalTimeEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<NewTimeEntry>({
    groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: ''
  })
  const [joursFeries, setJoursFeries] = useState<Set<string>>(new Set())

  // API Hooks
  const { groups, loading: groupsLoading } = useGroups()
  const { projects, loading: projectsLoading } = useProjects()
  const { themes } = useThemes()
  const { tasks, loading: tasksLoading } = useTasks()
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries()
  const { createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations()

  // Transform API entries to local format for display
  useEffect(() => {
    if (timeEntries && groups && projects && themes && tasks) {
      const transformed = timeEntries.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId)
        const project = projects.find(p => p.id === task?.projectId)
        const group = groups.find(g => g.id === project?.groupId)
        
        return {
          id: entry.id,
          date: entry.date.split('T')[0],
          groupeId: group?.id || '',
          groupeName: group?.name || 'N/A',
          projetId: project?.id || '',
          projetName: project?.name || 'N/A',
          themeId: '',
          themeName: 'N/A',
          taskId: entry.taskId,
          taskName: task?.name || 'N/A',
          heures: convertDurationToHours(entry.duration),
          description: entry.notes || '',
          status: 'saved' as const
        }
      })
      setLocalEntries(transformed)
    }
  }, [timeEntries, groups, projects, themes, tasks])

  // Récupérer les jours fériés depuis l'API
  useEffect(() => {
    const fetchJoursFeries = async () => {
      try {
        const response = await fetch(`https://calendrier.api.gouv.fr/jours-feries/metropole/${selectedYear}.json`)
        if (response.ok) {
          const data = await response.json()
          const feriesSet = new Set(Object.keys(data))
          setJoursFeries(feriesSet)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des jours fériés:', error)
      }
    }
    fetchJoursFeries()
  }, [selectedYear])

  // Helper function to convert duration string to hours
  const convertDurationToHours = (duration: string): number => {
    const [hours, minutes] = duration.split(':').map(Number)
    return hours + (minutes / 60)
  }

  // Helper function to convert hours to duration string
  const convertHoursToDuration = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  }

  const isWeekend = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const isJourFerie = (dateStr: string): boolean => {
    return joursFeries.has(dateStr)
  }

  const isNonWorkingDay = (year: number, month: number, day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isWeekend(year, month, day) || isJourFerie(dateStr)
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const generateMonthDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const handleNewEntryChange = (field: keyof NewTimeEntry, value: string | number) => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'groupeId' ? { projetId: '', themeId: '', taskId: '' } : {}),
      ...(field === 'projetId' ? { taskId: '' } : {})
    }))
  }

  const addTimeEntry = async () => {
    if (!selectedDate || !newEntry.groupeId || !newEntry.projetId || !newEntry.taskId || newEntry.heures <= 0) {
      alert('Veuillez sélectionner une date et remplir tous les champs requis')
      return
    }

    const userId = "00000000-0000-0000-0000-000000000001"
    
    const createDto: CreateTimeEntryDto = {
      taskId: newEntry.taskId,
      userId: userId,
      date: selectedDate,
      duration: convertHoursToDuration(newEntry.heures),
      notes: newEntry.description
    }

    const result = await createTimeEntry(createDto)
    if (result) {
      await refetchEntries()
      setNewEntry({ groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: '' })
      alert('Entrée de temps créée avec succès!')
    } else {
      alert('Erreur lors de la création de l\'entrée de temps')
    }
  }

  const openEditDialog = (entry: LocalTimeEntry) => {
    setEditingEntry(entry)
    setEditFormData({
      groupeId: entry.groupeId,
      projetId: entry.projetId,
      themeId: entry.themeId,
      taskId: entry.taskId,
      heures: entry.heures,
      description: entry.description
    })
    setIsEditDialogOpen(true)
  }

  const handleEditEntry = async () => {
    if (!editingEntry) return

    const userId = "00000000-0000-0000-0000-000000000001"
    
    const updateDto: UpdateTimeEntryDto = {
      id: editingEntry.id,
      taskId: editFormData.taskId,
      userId: userId,
      date: editingEntry.date,
      duration: convertHoursToDuration(editFormData.heures),
      notes: editFormData.description
    }

    const result = await updateTimeEntry(editingEntry.id, updateDto)
    if (result) {
      await refetchEntries()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      alert('Entrée de temps modifiée avec succès!')
    }
  }

  const handleEditFormChange = (field: keyof NewTimeEntry, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'groupeId' ? { projetId: '', themeId: '', taskId: '' } : {}),
      ...(field === 'projetId' ? { taskId: '' } : {})
    }))
  }

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée?')) {
      const success = await deleteTimeEntry(id)
      if (success) {
        await refetchEntries()
        alert('Entrée supprimée avec succès!')
      }
    }
  }

  const copyPreviousDay = async () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date d'abord")
      return
    }
    
    const currentDate = new Date(selectedDate)
    const previousDay = new Date(currentDate)
    previousDay.setDate(currentDate.getDate() - 1)
    const previousDayStr = previousDay.toISOString().split('T')[0]
    
    const previousEntries = localEntries.filter(entry => entry.date === previousDayStr)
    
    if (previousEntries.length === 0) {
      alert("Aucune entrée trouvée pour le jour précédent")
      return
    }

    const userId = "00000000-0000-0000-0000-000000000001"
    
    for (const entry of previousEntries) {
      const createDto: CreateTimeEntryDto = {
        taskId: entry.taskId,
        userId: userId,
        date: selectedDate,
        duration: convertHoursToDuration(entry.heures),
        notes: entry.description
      }
      await createTimeEntry(createDto)
    }
    
    await refetchEntries()
    alert(`${previousEntries.length} entrée(s) copiée(s) depuis le jour précédent`)
  }

  const applyQuickTemplate = () => {
    alert("Template de journée type: Veuillez d'abord créer vos projets et tâches dans l'administration")
  }

  const repeatLastEntry = () => {
    if (localEntries.length === 0) {
      alert("Aucune entrée précédente à répéter")
      return
    }
    
    const lastEntry = localEntries[localEntries.length - 1]
    
    setNewEntry({
      groupeId: lastEntry.groupeId,
      projetId: lastEntry.projetId,
      themeId: '', // No longer used
      taskId: lastEntry.taskId,
      heures: lastEntry.heures,
      description: lastEntry.description
    })
    
    alert("Dernière entrée chargée dans le formulaire")
  }

  const getEntriesForDate = (date: string) => {
    return localEntries.filter(entry => entry.date === date)
  }
  
  const getDailyTotal = (date: string) => {
    return getEntriesForDate(date).reduce((sum, entry) => sum + entry.heures, 0)
  }
  
  const monthlyTotal = localEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear
    })
    .reduce((sum, entry) => sum + entry.heures, 0)

  const workingDays = localEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear
    })
    .reduce((acc, entry) => {
      acc.add(entry.date)
      return acc
    }, new Set()).size

  const getAvailableProjects = (groupeId: string) => {
    if (!groupeId) return []
    return projects.filter(p => p.groupId === groupeId)
  }

  const getAvailableTasks = (projetId: string) => {
    if (!projetId) return []
    return tasks.filter(t => t.projectId === projetId)
  }

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

  const isLoading = groupsLoading || projectsLoading || tasksLoading || entriesLoading

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-gray-600 font-semibold">Chargement des données...</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Groupes: {groupsLoading ? '...' : `✓ ${groups.length}`}</p>
                <p>Projets: {projectsLoading ? '...' : `✓ ${projects.length}`}</p>
                <p>Tâches: {tasksLoading ? '...' : `✓ ${tasks.length}`}</p>
                <p>Entrées: {entriesLoading ? '...' : `✓ ${timeEntries.length}`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
              {/* Debug Info */}
              {groups.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">Aucune donnée disponible</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Vous devez d'abord créer des <strong>Groupes</strong>, <strong>Projets</strong>, <strong>Thèmes</strong> et <strong>Tâches</strong> dans les pages d'administration.
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
                        📊 Données chargées: {groups.length} groupes, {projects.length} projets, {themes.length} thèmes, {tasks.length} tâches
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Société/Groupe * {groups.length > 0 && <span className="text-xs text-gray-500">({groups.length} disponible{groups.length > 1 ? 's' : ''})</span>}
                </label>
                <Select 
                  value={newEntry.groupeId} 
                  onValueChange={(value) => handleNewEntryChange('groupeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={groups.length === 0 ? "Aucun groupe disponible" : "Sélectionnez une société"} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Aucun groupe. Créez-en un dans l'admin.</div>
                    ) : (
                      groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet * {newEntry.groupeId && <span className="text-xs text-gray-500">({getAvailableProjects(newEntry.groupeId).length} disponible{getAvailableProjects(newEntry.groupeId).length > 1 ? 's' : ''})</span>}
                </label>
                <Select 
                  value={newEntry.projetId} 
                  onValueChange={(value) => handleNewEntryChange('projetId', value)}
                  disabled={!newEntry.groupeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!newEntry.groupeId ? "Sélectionnez d'abord un groupe" : getAvailableProjects(newEntry.groupeId).length === 0 ? "Aucun projet pour ce groupe" : "Sélectionnez un projet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProjects(newEntry.groupeId).length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Aucun projet pour ce groupe</div>
                    ) : (
                      getAvailableProjects(newEntry.groupeId).map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tâche * {newEntry.projetId && <span className="text-xs text-gray-500">({getAvailableTasks(newEntry.projetId).length} disponible{getAvailableTasks(newEntry.projetId).length > 1 ? 's' : ''})</span>}
                </label>
                <Select 
                  value={newEntry.taskId} 
                  onValueChange={(value) => handleNewEntryChange('taskId', value)}
                  disabled={!newEntry.projetId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!newEntry.projetId ? "Sélectionnez d'abord un projet" : getAvailableTasks(newEntry.projetId).length === 0 ? "Aucune tâche pour ce projet" : "Sélectionnez une tâche"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTasks(newEntry.projetId).length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Aucune tâche pour ce projet</div>
                    ) : (
                      getAvailableTasks(newEntry.projetId).map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))
                    )}
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
                            <span className="font-semibold text-gray-900">{entry.groupeName}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-700">{entry.projetName}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />Sauvé
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{entry.taskName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{entry.heures.toFixed(1)}h</span>
                          </div>
                          {entry.description && (
                            <p className="text-sm text-gray-600 italic mt-2">"{entry.description}"</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(entry)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteEntry(entry.id)}
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

        {/* Edit Time Entry Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Modifier l'Entrée de Temps
              </DialogTitle>
              <DialogDescription>
                Modifiez les détails de votre entrée de temps
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-groupe">Société/Groupe *</Label>
                <Select 
                  value={editFormData.groupeId} 
                  onValueChange={(value) => handleEditFormChange('groupeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une société" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-projet">Projet *</Label>
                <Select 
                  value={editFormData.projetId} 
                  onValueChange={(value) => handleEditFormChange('projetId', value)}
                  disabled={!editFormData.groupeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableProjects(editFormData.groupeId).map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-task">Tâche *</Label>
                <Select 
                  value={editFormData.taskId} 
                  onValueChange={(value) => handleEditFormChange('taskId', value)}
                  disabled={!editFormData.projetId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!editFormData.projetId ? "Sélectionnez d'abord un projet" : getAvailableTasks(editFormData.projetId).length === 0 ? "Aucune tâche pour ce projet" : "Sélectionnez une tâche"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTasks(editFormData.projetId).length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Aucune tâche pour ce projet</div>
                    ) : (
                      getAvailableTasks(editFormData.projetId).map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-heures">Nombre d'heures *</Label>
                <Input
                  id="edit-heures"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={editFormData.heures}
                  onChange={(e) => handleEditFormChange('heures', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 7.5"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Description optionnelle de l'activité"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleEditEntry}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        </div>
      </div>
    </div>
  )
}
