import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Timer, Trash2, Edit, AlertCircle } from "lucide-react"
import { LocalTimeEntry, NewTimeEntry, Group, Project, Task } from "../types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DayDetailsSheetProps {
    isOpen: boolean
    onClose: () => void
    selectedDate: string | null
    selectedDates: Set<string>
    newEntry: NewTimeEntry
    onNewEntryChange: (field: keyof NewTimeEntry, value: string | number) => void
    onAddEntry: () => void
    entries: LocalTimeEntry[]
    onEdit: (entry: LocalTimeEntry) => void
    onDelete: (id: string) => void
    groups: Group[]
    getAvailableProjects: (groupId: string) => Project[]
    getAvailableTasks: (projectId: string) => Task[]
}

export function DayDetailsSheet({
    isOpen,
    onClose,
    selectedDate,
    selectedDates,
    newEntry,
    onNewEntryChange,
    onAddEntry,
    entries,
    onEdit,
    onDelete,
    groups,
    getAvailableProjects,
    getAvailableTasks
}: DayDetailsSheetProps) {

    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr })
    }

    const getTitle = () => {
        if (selectedDates.size > 1) {
            return `${selectedDates.size} dates sélectionnées`
        }
        if (selectedDate) {
            return formatDate(selectedDate)
        }
        return "Détails"
    }

    const getDescription = () => {
        if (selectedDates.size > 1) {
            return "Gérez les entrées pour les dates sélectionnées simultanément."
        }
        return "Ajoutez et gérez vos entrées de temps pour cette journée."
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto p-0 gap-0 border-l shadow-2xl duration-700 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                <div className="h-full flex flex-col bg-gray-50/30">
                    <SheetHeader className="px-5 py-5 sm:px-8 sm:py-8 border-b bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all duration-300">
                        <SheetTitle className="capitalize text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{getTitle()}</SheetTitle>
                        <SheetDescription className="text-sm sm:text-base mt-2 text-gray-500 font-medium">{getDescription()}</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-10 space-y-8 sm:space-y-12">
                        {/* Formulaire d'ajout */}
                        <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-8 fade-in duration-700 delay-150 fill-mode-backwards ease-out">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center text-gray-900">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mr-3 sm:mr-4 shadow-sm ring-1 ring-green-100">
                                    <Plus className="h-5 w-5 text-green-700" />
                                </div>
                                Nouvelle Entrée
                            </h3>

                            <div className="grid gap-5 sm:gap-6 p-5 sm:p-7 border border-gray-100 rounded-2xl bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                                {groups.length === 0 && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" />
                                        <span>Configurez d'abord vos groupes, projets et tâches dans l'administration.</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">Société/Groupe</Label>
                                    <Select
                                        value={newEntry.groupeId}
                                        onValueChange={(value) => onNewEntryChange('groupeId', value)}
                                    >
                                        <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 rounded-lg">
                                            <SelectValue placeholder="Sélectionner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">Projet</Label>
                                        <Select
                                            value={newEntry.projetId}
                                            onValueChange={(value) => onNewEntryChange('projetId', value)}
                                            disabled={!newEntry.groupeId}
                                        >
                                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 rounded-lg">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableProjects(newEntry.groupeId).map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">Tâche</Label>
                                        <Select
                                            value={newEntry.taskId}
                                            onValueChange={(value) => onNewEntryChange('taskId', value)}
                                            disabled={!newEntry.projetId}
                                        >
                                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 rounded-lg">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableTasks(newEntry.projetId).map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">Heures</Label>
                                    <div className="relative group/input">
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="24"
                                            className="h-11 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 pr-10 text-lg font-medium rounded-lg"
                                            value={newEntry.heures}
                                            onChange={(e) => onNewEntryChange('heures', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="absolute right-4 top-3 text-gray-400 font-medium group-focus-within/input:text-indigo-500 transition-colors">h</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">Description</Label>
                                    <Input
                                        value={newEntry.description}
                                        onChange={(e) => onNewEntryChange('description', e.target.value)}
                                        placeholder="Ajouter une note..."
                                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 rounded-lg"
                                    />
                                </div>

                                <Button
                                    onClick={onAddEntry}
                                    className="w-full h-12 mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-semibold text-lg rounded-xl transform active:scale-[0.99]"
                                    disabled={!newEntry.taskId || newEntry.heures <= 0}
                                >
                                    Ajouter l'entrée
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-gray-200/60" />

                        {/* Liste des entrées */}
                        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-700 delay-300 fill-mode-backwards ease-out">
                            <h3 className="text-lg sm:text-xl font-bold flex items-center justify-between text-gray-900">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mr-3 sm:mr-4 shadow-sm ring-1 ring-blue-100">
                                        <Timer className="h-5 w-5 text-blue-700" />
                                    </div>
                                    Entrées existantes
                                </div>
                                <Badge variant="secondary" className="bg-white text-gray-900 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold border border-gray-200 shadow-sm rounded-full">
                                    {entries.reduce((acc, curr) => acc + curr.heures, 0)}h Total
                                </Badge>
                            </h3>

                            <div className="space-y-4 min-h-[200px]">
                                {entries.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                            <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-600 font-semibold text-base sm:text-lg">Aucune entrée</p>
                                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Commencez par ajouter une activité ci-dessus</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {entries.map((entry, index) => (
                                            <div
                                                key={entry.id}
                                                className="group relative flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:border-indigo-100/50 transition-all duration-300 overflow-hidden"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl group-hover:bg-indigo-600 transition-colors duration-300" />

                                                <div className="flex items-start justify-between pl-3">
                                                    <div className="space-y-1">
                                                        <div className="font-bold text-base sm:text-lg text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">{entry.taskName}</div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-gray-500">
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 border border-gray-200/50">{entry.projetName}</span>
                                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                                            <span className="text-gray-500">{entry.groupeName}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="font-mono text-base sm:text-lg font-bold text-indigo-600 bg-indigo-50/50 border-indigo-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">
                                                        {entry.heures}h
                                                    </Badge>
                                                </div>

                                                {entry.description && (
                                                    <div className="ml-3 mt-1 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100/50 leading-relaxed">
                                                        {entry.description}
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 sm:translate-x-2 sm:group-hover:translate-x-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        onClick={() => onEdit(entry)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        onClick={() => onDelete(entry.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
