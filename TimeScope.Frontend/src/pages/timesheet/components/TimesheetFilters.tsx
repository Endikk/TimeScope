import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface TimesheetFiltersProps {
  searchQuery: string;
  filterUser: string;
  filterGroup: string;
  filterDateFrom: string;
  filterDateTo: string;
  uniqueUsers: string[];
  uniqueGroups: string[];
  onSearchChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

export function TimesheetFilters({
  searchQuery,
  filterUser,
  filterGroup,
  filterDateFrom,
  filterDateTo,
  uniqueUsers,
  uniqueGroups,
  onSearchChange,
  onUserChange,
  onGroupChange,
  onDateFromChange,
  onDateToChange,
  onReset
}: TimesheetFiltersProps) {
  return (
    <Card>
      <CardHeader className="px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Filter className="h-4 w-4 md:h-5 md:w-5" />
          Filtres Avancés
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Filtrez vos entrées de temps par critères multiples</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div>
            <Label>Recherche</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tâche, notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label>Utilisateur</Label>
            <Select value={filterUser} onValueChange={onUserChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Groupe</Label>
            <Select value={filterGroup} onValueChange={onGroupChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                {uniqueGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date début</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Date fin</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="w-full sm:w-auto">
            Réinitialiser les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
