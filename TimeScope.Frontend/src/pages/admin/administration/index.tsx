import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { useAdministration } from '@/lib/hooks/use-administration';
import { AdministrationHeader } from './components/AdministrationHeader';
import { StatisticsCards } from './components/StatisticsCards';
import { ActivitySummary } from './components/ActivitySummary';
import { DatabasesTab } from './components/DatabasesTab';
import { ConnectionsTab } from './components/ConnectionsTab';
import { MaintenanceTab } from './components/MaintenanceTab';

export default function AdministrationPageAPI() {
  const { summary, connections, cleanup, statistics, export: exportHook, refetchAll } = useAdministration();
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleTestConnections = async () => {
    setIsTestingConnections(true);
    await connections.testConnections();
    setIsTestingConnections(false);
  };

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    await cleanup.cleanup();
    setIsCleaningUp(false);
    refetchAll();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHook.exportData();
    } catch (error: unknown) {
      console.error(error);
    }
    setIsExporting(false);
  };

  if (summary.loading || statistics.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des données d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <AdministrationHeader
        onTestConnections={handleTestConnections}
        onRefresh={refetchAll}
        isTestingConnections={isTestingConnections}
      />

      <StatisticsCards statistics={statistics.statistics} />

      <ActivitySummary statistics={statistics.statistics} />

      <Tabs defaultValue="databases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="databases">
            <Database className="w-4 h-4 mr-2" />
            Bases de Données
          </TabsTrigger>
          <TabsTrigger value="connections">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Test Connexions
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Trash2 className="w-4 h-4 mr-2" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <DatabasesTab summary={summary.summary} />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <ConnectionsTab
            connections={connections.connections}
            onTestConnections={handleTestConnections}
            isTestingConnections={isTestingConnections}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceTab
            cleanupResult={cleanup.result}
            onCleanup={handleCleanup}
            onExport={handleExport}
            isCleaningUp={isCleaningUp}
            isExporting={isExporting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
