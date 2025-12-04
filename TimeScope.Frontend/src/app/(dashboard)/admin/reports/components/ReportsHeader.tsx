import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ReportsHeaderProps {
  onRefresh: () => void;
}

export function ReportsHeader({ onRefresh }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rapports et Analyses</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Vue d'ensemble des statistiques et de l'activité
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm" className="w-full sm:w-auto">
        <RefreshCw className="w-4 h-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
}
