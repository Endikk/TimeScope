
"use client";

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HomeHeader } from "@/app/(dashboard)/home/components/HomeHeader"
import { MonthlyStats } from "@/app/(dashboard)/home/components/MonthlyStats"
import { QuickActions } from "@/app/(dashboard)/home/components/QuickActions"
import { CalendarGrid } from "@/app/(dashboard)/home/components/CalendarGrid"
import { ExportDialog } from "@/app/(dashboard)/home/components/ExportDialog"
import * as MultiSelectHelpers from "@/app/(dashboard)/home/utils/multiSelectHelpers"
import {
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Edit,
  X,
  Copy,
  Clipboard,
  CheckSquare,
  Square
} from "lucide-react"
import { useGroups, useProjects, useThemes } from "@/lib/hooks/use-projects"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useTimeEntries, useTimeEntryMutations } from "@/lib/hooks/use-timeentries"
import type { CreateTimeEntryDto, UpdateTimeEntryDto } from "@/lib/api/services"
import { cn } from "@/lib/utils"
import { DayDetailsSheet } from "./components/DayDetailsSheet"
import { LocalTimeEntry, NewTimeEntry } from "./types"



// Fonction utilitaire pour convertir une durée en heures
const convertDurationToHours = (duration: string): number => {
  const [hours, minutes] = duration.split(':').map(Number)
  return hours + (minutes / 60)
}

// Fonction utilitaire pour convertir des heures en chaîne de durée
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

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]



export default function Home() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [newEntry, setNewEntry] = useState<NewTimeEntry>({
    groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: ''
  })
  const [editingEntry, setEditingEntry] = useState<LocalTimeEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<NewTimeEntry>({
    groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: ''
  })
  const [joursFeries, setJoursFeries] = useState<Set<string>>(new Set())
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // États pour la multi-sélection
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [copiedEntries, setCopiedEntries] = useState<LocalTimeEntry[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)

  // États pour l'export
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [exportGroupId, setExportGroupId] = useState<string>('all')

  // Calcul de la plage de dates pour le mois sélectionné
  const dateRange = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    // Format YYYY-MM-DD
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }, [selectedYear, selectedMonth]);

  // Hooks API
  const { groups, loading: groupsLoading } = useGroups()
  const { projects, loading: projectsLoading } = useProjects()
  const { themes } = useThemes()
  const { tasks, loading: tasksLoading } = useTasks()

  // Fetch uniquement pour le mois sélectionné
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  })

  const { createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations()

  // Transformation des entrées API au format local pour l'affichage
  const localEntries = useMemo(() => {
    if (timeEntries && groups && projects && themes && tasks) {
      return timeEntries.map(entry => {
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
    }
    return []
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

  const isJourFerie = (dateStr: string): boolean => {
    return joursFeries.has(dateStr)
  }

  const isNonWorkingDay = (year: number, month: number, day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isWeekend(year, month, day) || isJourFerie(dateStr)
  }

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
    // Détermination des dates cibles
    const targetDates = selectedDates.size > 0 ? Array.from(selectedDates) : (selectedDate ? [selectedDate] : [])

    if (targetDates.length === 0 || !newEntry.taskId || newEntry.heures <= 0) {
      return
    }

    // Ajout de l'entrée pour chaque date sélectionnée
    for (const targetDate of targetDates) {
      // Vérification si c'est un jour non travaillé
      const date = new Date(targetDate)
      if (isNonWorkingDay(date.getFullYear(), date.getMonth(), date.getDate())) {
        continue
      }

      const createDto: CreateTimeEntryDto = {
        taskId: newEntry.taskId,
        // userId retiré - automatiquement assigné depuis l'utilisateur authentifié
        date: targetDate,
        duration: convertHoursToDuration(newEntry.heures),
        notes: newEntry.description
      }

      await createTimeEntry(createDto)
    }

    await refetchEntries()
    setNewEntry({ groupeId: '', projetId: '', themeId: '', taskId: '', heures: 0, description: '' })
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

    const updateDto: UpdateTimeEntryDto = {
      id: editingEntry.id,
      taskId: editFormData.taskId,
      // userId retiré - automatiquement assigné depuis l'utilisateur authentifié
      date: editingEntry.date,
      duration: convertHoursToDuration(editFormData.heures),
      notes: editFormData.description
    }

    try {
      await updateTimeEntry(editingEntry.id, updateDto)
      await refetchEntries()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
    } catch (error) {
      console.error("Failed to update entry", error)
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
    try {
      await deleteTimeEntry(id)
      await refetchEntries()
    } catch (error) {
      console.error("Failed to delete entry", error)
    }
  }

  const handleDeleteAllEntries = () => {
    if (selectedDates.size === 0) return
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAll = async () => {
    const targetDates = Array.from(selectedDates)
    const entriesToDelete = localEntries.filter(entry => targetDates.includes(entry.date))

    for (const entry of entriesToDelete) {
      await deleteTimeEntry(entry.id)
    }

    await refetchEntries()
    setIsDeleteDialogOpen(false)
  }

  // Fonctions de multi-sélection
  const handleToggleDateSelection = (dateStr: string, ctrlKey: boolean) => {
    MultiSelectHelpers.toggleDateSelection(
      dateStr,
      ctrlKey,
      isMultiSelectMode,
      selectedDates,
      setSelectedDates,
      setSelectedDate
    )

    // Ouvrir le panneau latéral uniquement si PAS en mode multi-sélection et PAS de touche modificateur
    if (!isMultiSelectMode && !ctrlKey) {
      setIsSheetOpen(true)
    }
  }

  const handleCopySelectedEntries = () => {
    MultiSelectHelpers.copySelectedEntries(
      selectedDates,
      localEntries,
      setCopiedEntries
    )
  }

  const pasteEntries = async () => {
    if (copiedEntries.length === 0 || selectedDates.size === 0) {
      return
    }

    // 1. Trouver la date la plus ancienne dans les entrées sources (copiées)
    const sourceDates = copiedEntries.map(e => new Date(e.date).getTime())
    const minSourceDate = new Date(Math.min(...sourceDates))

    // 2. Déterminer les points de départ cibles
    // Si plusieurs dates sont sélectionnées, chaque date sélectionnée est un "point de départ" pour le collage
    const targetStartDates = Array.from(selectedDates).map(d => new Date(d))

    for (const targetStartDate of targetStartDates) {
      for (const entry of copiedEntries) {
        // Calcul du décalage en jours depuis la date de début source
        const entryDate = new Date(entry.date)
        const diffTime = entryDate.getTime() - minSourceDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        // Calcul de la nouvelle date : Début cible + Décalage
        const newDate = new Date(targetStartDate)
        newDate.setDate(newDate.getDate() + diffDays)

        // Formatage en YYYY-MM-DD
        const newDateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`

        // Ignorer les jours non travaillés si nécessaire (optionnel, mais plus sûr)
        if (isNonWorkingDay(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())) {
          continue
        }

        const createDto: CreateTimeEntryDto = {
          taskId: entry.taskId,
          date: newDateStr,
          duration: convertHoursToDuration(entry.heures),
          notes: entry.description
        }
        await createTimeEntry(createDto)
      }
    }

    await refetchEntries()
  }

  const handleClearSelection = () => {
    MultiSelectHelpers.clearSelection(setSelectedDates, setSelectedDate)
  }

  const handleToggleMultiSelectMode = () => {
    MultiSelectHelpers.toggleMultiSelectMode(isMultiSelectMode, setIsMultiSelectMode, setSelectedDates)
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
    if (!groupeId) return projects // Si rien sélectionné, tout montrer
    if (groupeId === "none") return projects.filter(p => !p.groupId) // Si "Aucune société", montrer orphelins
    return projects.filter(p => p.groupId === groupeId)
  }

  const getAvailableTasks = (projetId: string) => {
    if (!projetId) return tasks // Si rien sélectionné, tout montrer
    if (projetId === "none") return tasks.filter(t => !t.projectId) // Si "Aucun projet", montrer orphelins
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

  // État pour la vue compacte
  const [isCompactView, setIsCompactView] = useState(false)

  // Charger la préférence de vue compacte
  useEffect(() => {
    const loadCompactView = () => {
      if (!user) return

      const storageKey = `timeScope_userPreferences_${user.id}`
      const savedPrefs = localStorage.getItem(storageKey)

      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs)
          setIsCompactView(parsed.appearance?.compactView === true)
        } catch (e) {
          console.error('Error parsing prefs', e)
        }
      } else {
        // Reset to default if no prefs found for this user
        setIsCompactView(false)
      }
    }

    loadCompactView()

    // Écouter les changements de préférences
    const handlePrefsChange = (e: Event) => {
      // If it's a custom event, we can check the userId
      if (e instanceof CustomEvent && e.detail?.userId && user && e.detail.userId !== user.id) {
        return;
      }
      loadCompactView()
    }

    window.addEventListener('timeScope_preferencesChanged', handlePrefsChange)
    window.addEventListener('storage', handlePrefsChange)

    return () => {
      window.removeEventListener('timeScope_preferencesChanged', handlePrefsChange)
      window.removeEventListener('storage', handlePrefsChange)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Chargement de vos données...</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-1 flex-col p-3 pt-2 transition-all duration-300",
      isCompactView ? "gap-2 md:gap-3 md:p-3 md:pt-2" : "gap-4 md:gap-6 md:p-6 md:pt-4"
    )}>
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className={cn(
          "max-w-7xl mx-auto transition-all duration-300",
          isCompactView ? "space-y-2 md:space-y-3" : "space-y-4 md:space-y-6"
        )}>

          <HomeHeader />

          <div className="bg-card rounded-xl border shadow-sm">
            <div className={cn(
              "transition-all duration-300",
              isCompactView ? "p-2 md:p-3" : "p-3 md:p-6"
            )}>
              <MonthlyStats
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
                monthlyTotal={monthlyTotal}
                workingDays={workingDays}
                monthNames={monthNames}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
              />

              <QuickActions
                onExport={() => setIsExportDialogOpen(true)}
                onGoToToday={() => {
                  const today = new Date()
                  const y = today.getFullYear()
                  const m = today.getMonth()

                  // Définir le mois/année visible sur aujourd'hui
                  setSelectedYear(y)
                  setSelectedMonth(m)

                  // Sélectionner également la date pour que le jour soit mis en évidence
                  const todayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                  setSelectedDate(todayStr)

                  // Si en vue semaine, calculer l'index de la semaine pour afficher celle contenant aujourd'hui
                  if (viewMode === 'week') {
                    const firstDay = new Date(y, m, 1)
                    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0
                    const firstMonday = new Date(firstDay)
                    firstMonday.setDate(1 - firstDayOfWeek)

                    const startOfToday = new Date(y, m, today.getDate())
                    // normalisation des heures
                    firstMonday.setHours(0, 0, 0, 0)
                    startOfToday.setHours(0, 0, 0, 0)

                    const diffMs = startOfToday.getTime() - firstMonday.getTime()
                    const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
                    setSelectedWeek(weekIndex >= 0 ? weekIndex : 0)
                  }
                }}
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
                getEntriesForDate={getEntriesForDate}
                viewMode={viewMode}
                selectedWeek={selectedWeek}
                selectedDates={selectedDates}
                onDateClick={handleToggleDateSelection}
                isMultiSelectMode={isMultiSelectMode}
                isCompact={isCompactView}
              />

              {/* Panneau de contrôle multi-sélection */}
              <div className="mt-4 border-t pt-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                  {/* Gauche : Contrôles de sélection */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button
                      variant={isMultiSelectMode ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleMultiSelectMode}
                      className={cn(
                        "transition-all duration-200",
                        isMultiSelectMode ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm" : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {isMultiSelectMode ? (
                        <>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Multi-sélection active
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Activer multi-sélection
                        </>
                      )}
                    </Button>

                    {selectedDates.size > 0 && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800 px-2.5 py-1">
                          {selectedDates.size} sélectionnée{selectedDates.size > 1 ? 's' : ''}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="text-muted-foreground hover:text-foreground h-8 px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Droite : Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    {selectedDates.size > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsSheetOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium px-4"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Gérer ({selectedDates.size})
                      </Button>
                    )}

                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySelectedEntries}
                        disabled={selectedDates.size === 0}
                        className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8"
                        title="Copier les entrées sélectionnées"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </Button>

                      <div className="w-px h-4 bg-border mx-1"></div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={pasteEntries}
                        disabled={copiedEntries.length === 0 || selectedDates.size === 0}
                        className="text-muted-foreground hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 h-8"
                        title="Coller les entrées copiées"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Coller
                        {copiedEntries.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-[10px] h-5 px-1.5">
                            {copiedEntries.length}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    {selectedDates.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAllEntries}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 shadow-none"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Tout supprimer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Instructions / Retours */}
                <div className="mt-3 space-y-2">
                  {isMultiSelectMode && selectedDates.size === 0 && (
                    <p className="text-xs text-indigo-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Cliquez sur plusieurs dates dans le calendrier pour les sélectionner.
                    </p>
                  )}

                  {copiedEntries.length > 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {copiedEntries.length} entrées copiées. Sélectionnez une date de début pour coller (la structure de la semaine sera conservée).
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DayDetailsSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            selectedDate={selectedDate}
            selectedDates={selectedDates}
            newEntry={newEntry}
            onNewEntryChange={handleNewEntryChange}
            onAddEntry={addTimeEntry}
            entries={selectedDates.size > 1
              ? localEntries.filter(e => selectedDates.has(e.date))
              : selectedDate
                ? getEntriesForDate(selectedDate)
                : []
            }
            onEdit={openEditDialog}
            onDelete={handleDeleteEntry}
            groups={groups}
            getAvailableProjects={getAvailableProjects}
            getAvailableTasks={getAvailableTasks}
          />


          {/* Dialogue de modification d'entrée de temps */}
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
                  <Label htmlFor="edit-groupe">Société/Groupe</Label>
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
                  <Label htmlFor="edit-projet">Projet</Label>
                  <Select
                    value={editFormData.projetId || ""}
                    onValueChange={(value) => handleEditFormChange('projetId', value)}
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une tâche" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTasks(editFormData.projetId).length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">Aucune tâche disponible</div>
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

          {/* Dialogue de confirmation de suppression */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer toutes les entrées pour les <span className="font-semibold text-foreground">{selectedDates.size} dates sélectionnées</span> ?
                  <br />
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteAll} className="bg-red-600 hover:bg-red-700 text-white">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialogue d'export PDF */}
          <ExportDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            monthNames={monthNames}
            groups={groups}
            localEntries={localEntries}
            exportGroupId={exportGroupId}
            setExportGroupId={setExportGroupId}
          />

        </div>
      </div>
    </div>
  )
}
