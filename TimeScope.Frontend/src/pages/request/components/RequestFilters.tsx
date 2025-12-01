import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Inbox } from "lucide-react"

interface RequestFiltersProps {
  statusFilter: string
  onFilterChange: (value: string) => void
  filteredCount: number
  isAdmin: boolean
  loading: boolean
  onRefresh: () => void
}

export function RequestFilters({
  statusFilter,
  onFilterChange,
  filteredCount,
  isAdmin,
  loading,
  onRefresh
}: RequestFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 max-w-xs">
            <Select value={statusFilter} onValueChange={onFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-4 w-4" />
            {filteredCount} demande{filteredCount !== 1 ? "s" : ""}
          </div>
          {isAdmin && (
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                Actualiser
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
