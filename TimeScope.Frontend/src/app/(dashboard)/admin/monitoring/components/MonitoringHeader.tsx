import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface MonitoringHeaderProps {
  onRefresh: () => void;
}

export function MonitoringHeader({ onRefresh }: MonitoringHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <h1 className="text-2xl md:text-3xl font-bold">Monitoring Système</h1>
      <Button onClick={onRefresh} className="w-full sm:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" />
        Actualiser
      </Button>
    </div>
  );
}
