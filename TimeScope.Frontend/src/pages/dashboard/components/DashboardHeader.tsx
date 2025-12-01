import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-fp-text">Dashboard</h1>
        <p className="text-sm md:text-base text-fp-text/70 font-body">
          Vue d'ensemble de votre activité et de vos performances
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm" className="shrink-0 w-full sm:w-auto">
        <RefreshCw className="w-4 h-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
}
