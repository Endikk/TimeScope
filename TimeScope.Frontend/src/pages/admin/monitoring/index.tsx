import { useMonitoring } from '@/lib/hooks/use-monitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function MonitoringPage() {
  const { metrics, refetchAll } = useMonitoring(true);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monitoring Système</h1>
        <Button onClick={refetchAll}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Métriques Système</CardTitle></CardHeader>
        <CardContent>
          {metrics.loading ? <p>Chargement...</p> : metrics.metrics ? (
            <div><p>CPU: {metrics.metrics.cpuUsage.toFixed(2)}%</p><p>Memory: {metrics.metrics.memoryUsed} MB</p></div>
          ) : <p>Aucune donnée</p>}
        </CardContent>
      </Card>
    </div>
  );
}
