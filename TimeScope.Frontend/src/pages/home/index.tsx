import { useState, useEffect, useMemo } from "react"
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
import { ExportDialog } from "@/pages/home/components/ExportDialog"
import * as MultiSelectHelpers from "@/pages/home/utils/multiSelectHelpers"
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

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export default function Home() {
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

  // Multi-selection states
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [copiedEntries, setCopiedEntries] = useState<LocalTimeEntry[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)

  // Export states
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportGroupId, setExportGroupId] = useState<string>('all')

  // API Hooks
  const { groups, loading: groupsLoading } = useGroups()
  const { projects, loading: projectsLoading } = useProjects()
  const { themes } = useThemes()
  const { tasks, loading: tasksLoading } = useTasks()
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries()
  const { createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations()

  // Transform API entries to local format for display
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
    // Déterminer les dates cibles
    const targetDates = selectedDates.size > 0 ? Array.from(selectedDates) : (selectedDate ? [selectedDate] : [])

    if (targetDates.length === 0 || !newEntry.groupeId || !newEntry.projetId || !newEntry.taskId || newEntry.heures <= 0) {
      return
    }

    // Ajouter l'entrée pour chaque date sélectionnée
    for (const targetDate of targetDates) {
      // Vérifier si c'est un jour non travaillé
      const date = new Date(targetDate)
      if (isNonWorkingDay(date.getFullYear(), date.getMonth(), date.getDate())) {
        continue
      }

      const createDto: CreateTimeEntryDto = {
        taskId: newEntry.taskId,
        // userId removed - automatically assigned from authenticated user
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
      // userId removed - automatically assigned from authenticated user
      date: editingEntry.date,
      duration: convertHoursToDuration(editFormData.heures),
      notes: editFormData.description
    }

    const result = await updateTimeEntry(editingEntry.id, updateDto)
    if (result) {
      await refetchEntries()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
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
    const success = await deleteTimeEntry(id)
    if (success) {
      await refetchEntries()
    }
  }

  const handleDeleteAllEntries = async () => {
    if (selectedDates.size === 0) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer toutes les entrées pour les ${selectedDates.size} dates sélectionnées ?`)) {
      return
    }

    const targetDates = Array.from(selectedDates)
    const entriesToDelete = localEntries.filter(entry => targetDates.includes(entry.date))

    for (const entry of entriesToDelete) {
      await deleteTimeEntry(entry.id)
    }

    await refetchEntries()
  }

  // Multi-select functions
  const handleToggleDateSelection = (dateStr: string, ctrlKey: boolean) => {
    MultiSelectHelpers.toggleDateSelection(
      dateStr,
      ctrlKey,
      isMultiSelectMode,
      selectedDates,
      setSelectedDates,
      setSelectedDate
    )
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

    // 1. Find the earliest date in the source (copied) entries
    const sourceDates = copiedEntries.map(e => new Date(e.date).getTime())
    const minSourceDate = new Date(Math.min(...sourceDates))

    // 2. Determine target start points
    // If multiple dates are selected, we treat EACH selected date as a "start point" for the paste pattern
    const targetStartDates = Array.from(selectedDates).map(d => new Date(d))

    for (const targetStartDate of targetStartDates) {
      for (const entry of copiedEntries) {
        // Calculate offset in days from the source start date
        const entryDate = new Date(entry.date)
        const diffTime = entryDate.getTime() - minSourceDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        // Calculate new date: Target Start + Offset
        const newDate = new Date(targetStartDate)
        newDate.setDate(newDate.getDate() + diffDays)

        // Format as YYYY-MM-DD
        const newDateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`

        // Skip non-working days if needed (optional, but good for safety)
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
      <div className="flex items-center justify-center min-h-screen">
        <video
          src="/assets/videos/check.webm"
          autoPlay
          loop
          muted
          className="w-64 h-64"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6 p-3 md:p-6 pt-2 md:pt-4">
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

          <HomeHeader />

          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-3 md:p-6">
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

                  // Set visible month/year to today
                  setSelectedYear(y)
                  setSelectedMonth(m)

                  // Also set the selected date so the day is highlighted
                  const todayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                  setSelectedDate(todayStr)

                  // If in week view, compute the week index so the week containing today is shown
                  if (viewMode === 'week') {
                    const firstDay = new Date(y, m, 1)
                    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0
                    const firstMonday = new Date(firstDay)
                    firstMonday.setDate(1 - firstDayOfWeek)

                    const startOfToday = new Date(y, m, today.getDate())
                    // normalize times
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
              />

              {/* Multi-select control panel */}
              <div className="mt-4 border-t pt-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                  {/* Left: Selection Controls */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button
                      variant={isMultiSelectMode ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleMultiSelectMode}
                      className={cn(
                        "transition-all duration-200",
                        isMultiSelectMode ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm" : "border-gray-200 text-gray-700 hover:bg-gray-50"
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
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-2.5 py-1">
                          {selectedDates.size} sélectionnée{selectedDates.size > 1 ? 's' : ''}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="text-gray-500 hover:text-gray-900 h-8 px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySelectedEntries}
                        disabled={selectedDates.size === 0}
                        className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 h-8"
                        title="Copier les entrées sélectionnées"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </Button>

                      <div className="w-px h-4 bg-gray-300 mx-1"></div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={pasteEntries}
                        disabled={copiedEntries.length === 0 || selectedDates.size === 0}
                        className="text-gray-700 hover:text-green-700 hover:bg-green-50 h-8"
                        title="Coller les entrées copiées"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Coller
                        {copiedEntries.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700 text-[10px] h-5 px-1.5">
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
                        className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-none"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Tout supprimer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Instructions / Feedback */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Formulaire de saisie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  Nouvelle Entrée de Temps
                </CardTitle>
                <CardDescription>
                  {selectedDates.size > 1 ? (
                    <span className="text-green-600 font-semibold">
                      L'entrée sera ajoutée sur {selectedDates.size} dates sélectionnées
                    </span>
                  ) : selectedDate ? (
                    `Ajoutez une nouvelle activité pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
                  ) : (
                    "Sélectionnez une date dans le calendrier"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
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
                  {selectedDates.size > 1 ? (
                    `Entrées des ${selectedDates.size} dates sélectionnées`
                  ) : selectedDate ? (
                    `Entrées du ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
                  ) : (
                    "Sélectionnez une date"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDates.size === 0 && !selectedDate ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Cliquez sur une date dans le calendrier</p>
                    <p className="text-sm">pour voir et gérer les entrées</p>
                  </div>
                ) : (() => {
                  // Récupérer toutes les entrées des dates sélectionnées
                  const targetDates = selectedDates.size > 0 ? Array.from(selectedDates) : (selectedDate ? [selectedDate] : [])
                  const allEntries = localEntries.filter(entry => targetDates.includes(entry.date))
                    .sort((a, b) => a.date.localeCompare(b.date)) // Trier par date

                  if (allEntries.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucune entrée pour {selectedDates.size > 1 ? 'ces dates' : 'cette date'}</p>
                        <p className="text-sm">Ajoutez votre première activité !</p>
                      </div>
                    )
                  }

                  // Grouper les entrées par date
                  const entriesByDate = allEntries.reduce((acc, entry) => {
                    if (!acc[entry.date]) {
                      acc[entry.date] = []
                    }
                    acc[entry.date].push(entry)
                    return acc
                  }, {} as Record<string, typeof allEntries>)

                  return (
                    <div className="space-y-4">
                      {selectedDates.size > 1 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>{allEntries.length} entrée{allEntries.length > 1 ? 's' : ''}</strong> sur {selectedDates.size} dates sélectionnées
                          </p>
                        </div>
                      )}
                      {Object.entries(entriesByDate).map(([date, entries]) => (
                        <div key={date} className="space-y-2">
                          {selectedDates.size > 1 && (
                            <div className="flex items-center gap-2 mt-4 mb-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-blue-900">
                                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {entries.length} entrée{entries.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                          )}
                          {entries.map((entry) => (
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
                      ))}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>


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

          {/* Export PDF Dialog */}
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
