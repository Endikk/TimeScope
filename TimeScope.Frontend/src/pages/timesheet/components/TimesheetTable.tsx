import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Calendar as CalendarIcon, Clock, ArrowUpDown } from 'lucide-react';

interface TimeEntryRow {
  id: string;
  date: string;
  user: string;
  group: string;
  project: string;
  task: string;
  duration: string;
  hours: number;
  notes: string;
  selected: boolean;
}

interface TimesheetTableProps {
  entries: TimeEntryRow[];
  selectedEntries: string[];
  totalHours: number;
  onToggleEntry: (id: string) => void;
  onToggleAll: () => void;
  onSort: (field: string) => void;
}

export function TimesheetTable({
  entries,
  selectedEntries,
  totalHours,
  onToggleEntry,
  onToggleAll,
  onSort
}: TimesheetTableProps) {
  return (
    <Card>
      <CardHeader className="px-3 md:px-6">
        <CardTitle className="text-base md:text-lg">Entrées de Temps</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {entries.length} entrée{entries.length > 1 ? 's' : ''} •
          {totalHours.toFixed(1)}h au total
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune entrée trouvée</p>
            <p className="text-sm text-muted-foreground">Ajustez vos filtres ou ajoutez de nouvelles entrées</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEntries.length === entries.length}
                      onCheckedChange={onToggleAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button variant="ghost" size="sm" onClick={() => onSort('date')} className="h-8 text-xs md:text-sm">
                      Date <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Utilisateur</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Groupe</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[120px]">Projet</TableHead>
                  <TableHead className="min-w-[150px]">Tâche</TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button variant="ghost" size="sm" onClick={() => onSort('hours')} className="h-8 text-xs md:text-sm">
                      Heures <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[150px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className={selectedEntries.includes(entry.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onCheckedChange={() => onToggleEntry(entry.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs md:text-sm">
                      <div className="flex items-center gap-1 md:gap-2">
                        <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                        <span className="whitespace-nowrap">{new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs md:text-sm">{entry.user}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">{entry.group}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs md:text-sm">{entry.project}</TableCell>
                    <TableCell className="font-medium text-xs md:text-sm">
                      <div className="max-w-[150px] md:max-w-xs truncate">{entry.task}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="font-semibold text-xs md:text-sm whitespace-nowrap">{entry.hours.toFixed(1)}h</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell max-w-xs truncate text-xs md:text-sm text-muted-foreground">
                      {entry.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
