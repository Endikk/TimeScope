import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

interface MonitoringHeaderProps {
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  onRefresh: () => void;
  onForceGC: () => void;
  gcLoading: boolean;
}

export function MonitoringHeader({ autoRefresh, setAutoRefresh, onRefresh, onForceGC, gcLoading }: MonitoringHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring Système</h1>
        <p className="text-muted-foreground mt-2">
          Surveillance en temps réel des ressources et de la santé du système
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Auto-actualisation</span>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
        <Button onClick={onForceGC} variant="outline" size="sm" disabled={gcLoading}>
          <Trash2 className="w-4 h-4 mr-2" />
          Force GC
        </Button>
      </div>
    </div>
  );
}
