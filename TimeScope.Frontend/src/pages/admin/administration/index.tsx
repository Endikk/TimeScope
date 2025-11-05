import { useAdministration } from '@/lib/hooks/use-administration';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RefreshCw, Database, Trash2, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function AdministrationPage() {
  const { summary, connections, cleanup, statistics, refetchAll } = useAdministration();
  const [testingConnections, setTestingConnections] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  const handleTestConnections = async () => {
    setTestingConnections(true);
    await connections.testConnections();
    setTestingConnections(false);
  };

  const handleCleanup = async () => {
    if (confirm('Êtes-vous sûr de vouloir nettoyer les données supprimées ?')) {
      setCleaningUp(true);
      await cleanup.cleanup();
      setCleaningUp(false);
      refetchAll();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">Gérez les bases de données et le système</p>
        </div>
        <Button variant="outline" onClick={refetchAll}>
          <RefreshCw className="mr-2 h-4 w-4" />Actualiser
        </Button>
      </div>

      {cleanup.result && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Nettoyage terminé</AlertTitle>
          <AlertDescription>
            {cleanup.result.totalRecordsRemoved} enregistrements supprimés
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="databases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="databases">Bases de données</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summary.loading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : summary.summary ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.summary.adminDatabase.totalRecords}</div>
                    <p className="text-xs text-muted-foreground">{summary.summary.adminDatabase.tablesCount} tables</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Projects Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.summary.projectsDatabase.totalRecords}</div>
                    <p className="text-xs text-muted-foreground">{summary.summary.projectsDatabase.tablesCount} tables</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Time Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.summary.timeDatabase.totalRecords}</div>
                    <p className="text-xs text-muted-foreground">{summary.summary.timeDatabase.tablesCount} tables</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Reports Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.summary.reportsDatabase.totalRecords}</div>
                    <p className="text-xs text-muted-foreground">{summary.summary.reportsDatabase.tablesCount} tables</p>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test des connexions</CardTitle>
              <CardDescription>Vérifiez les connexions aux bases de données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleTestConnections} disabled={testingConnections}>
                <Database className="mr-2 h-4 w-4" />
                {testingConnections ? 'Test en cours...' : 'Tester les connexions'}
              </Button>
              {connections.connections && (
                <div className="space-y-2">
                  {connections.connections.tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{test.databaseName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{test.responseTimeMs}ms</span>
                        {test.success ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />Connecté
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />Échec
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques d'utilisation</CardTitle>
              <CardDescription>Vue d'ensemble du système</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.loading ? (
                <Skeleton className="h-48 w-full" />
              ) : statistics.statistics ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Utilisateurs totaux</TableCell>
                      <TableCell>{statistics.statistics.totalUsers}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Utilisateurs actifs</TableCell>
                      <TableCell>{statistics.statistics.activeUsers}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Projets totaux</TableCell>
                      <TableCell>{statistics.statistics.totalProjects}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Tâches totales</TableCell>
                      <TableCell>{statistics.statistics.totalTasks}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Entrées de temps</TableCell>
                      <TableCell>{statistics.statistics.totalTimeEntries}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Logs d'audit récents</TableCell>
                      <TableCell>{statistics.statistics.recentAuditLogs}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opérations de maintenance</CardTitle>
              <CardDescription>Nettoyage et optimisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="destructive" onClick={handleCleanup} disabled={cleaningUp}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {cleaningUp ? 'Nettoyage en cours...' : 'Nettoyer les données supprimées'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Supprime définitivement les enregistrements marqués comme supprimés
                </p>
              </div>
              {cleanup.result && (
                <div className="space-y-2 p-4 border rounded">
                  <h4 className="font-semibold">Résultats du nettoyage</h4>
                  {cleanup.result.databaseResults.map((db, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{db.databaseName}:</span> {db.recordsRemoved} enregistrements ({db.details})
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
