import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Save, X } from "lucide-react"
import { exportToPDF } from "../services/pdfExportService"

interface Group {
  id: string
  name: string
}

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

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMonth: number
  selectedYear: number
  monthNames: string[]
  groups: Group[]
  localEntries: LocalTimeEntry[]
  exportGroupId: string
  setExportGroupId: (id: string) => void
}

export function ExportDialog({
  open,
  onOpenChange,
  selectedMonth,
  selectedYear,
  monthNames,
  groups,
  localEntries,
  exportGroupId,
  setExportGroupId
}: ExportDialogProps) {

  const handleExport = async () => {
    // Filtrer les entrées selon le groupe sélectionné et le mois
    const filteredEntries = exportGroupId === 'all'
      ? localEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear
      })
      : localEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === selectedMonth &&
          entryDate.getFullYear() === selectedYear &&
          entry.groupeId === exportGroupId
      })

    await exportToPDF({
      entries: filteredEntries,
      groups,
      monthName: monthNames[selectedMonth],
      year: selectedYear,
      groupId: exportGroupId
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Exporter en PDF
          </DialogTitle>
          <DialogDescription>
            Générez un rapport PDF pour {monthNames[selectedMonth]} {selectedYear}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="export-group">Société/Groupe</Label>
          <Select value={exportGroupId} onValueChange={setExportGroupId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Sélectionnez un groupe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-semibold">Toutes les sociétés/groupes</span>
                </div>
              </SelectItem>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {group.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Le PDF contiendra :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Période : {monthNames[selectedMonth]} {selectedYear}</li>
              <li>• Total des heures travaillées</li>
              <li>• Nombre de jours travaillés</li>
              <li>• Détail de toutes les entrées par date</li>
              <li>• Sociétés, projets, tâches et descriptions</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Générer le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
