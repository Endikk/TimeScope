import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Clock, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  totalEntries: number;
  totalHours: number;
  selectedCount: number;
  selectedHours: number;
}

export function StatsCards({ totalEntries, totalHours, selectedCount, selectedHours }: StatsCardsProps) {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Total Entrées</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{totalEntries}</div>
          <p className="text-xs text-muted-foreground">Entrées affichées</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Heures Totales</CardTitle>
          <Clock className="h-4 w-4 text-blue-500 shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">Temps enregistré</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Sélectionnées</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold text-green-600">{selectedCount}</div>
          <p className="text-xs text-muted-foreground">Entrées sélectionnées</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium truncate">Heures Sélect.</CardTitle>
          <Clock className="h-4 w-4 text-orange-500 shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold text-orange-600">{selectedHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">Temps sélectionné</p>
        </CardContent>
      </Card>
    </div>
  );
}
