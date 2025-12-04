import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DatabaseMaintenanceHeaderProps {
  onRefresh: () => void;
}

export function DatabaseMaintenanceHeader({ onRefresh }: DatabaseMaintenanceHeaderProps) {
  return (
    <div className="mb-4 md:mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Maintenance des Bases de Données</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Surveillance et optimisation des 4 bases de données PostgreSQL
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" className="w-full md:w-auto shrink-0">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
}
