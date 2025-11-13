import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProjectsHeaderProps {
  onRefresh: () => void;
}

export function ProjectsHeader({ onRefresh }: ProjectsHeaderProps) {
  return (
    <div className="mb-4 md:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Gestion des Projets</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez vos projets, groupes et thèmes
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" className="w-full sm:w-auto shrink-0">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
}
