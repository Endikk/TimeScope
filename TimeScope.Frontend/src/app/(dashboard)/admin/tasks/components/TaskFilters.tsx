import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterPrecision: string;
  setFilterPrecision: (precision: string) => void;
}

export function TaskFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPrecision,
  setFilterPrecision
}: TaskFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres et Recherche</CardTitle>
        <CardDescription>Filtrez et recherchez parmi vos tâches</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="EnAttente">En attente</SelectItem>
              <SelectItem value="EnCours">En cours</SelectItem>
              <SelectItem value="Termine">Terminé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPrecision} onValueChange={setFilterPrecision}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Précision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes précisions</SelectItem>
              <SelectItem value="Low">Basse</SelectItem>
              <SelectItem value="Medium">Moyenne</SelectItem>
              <SelectItem value="High">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
