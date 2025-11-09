import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Users,
  Activity
} from 'lucide-react';
import { useAdministration } from '@/lib/hooks/use-administration';

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
    if (!confirm('Êtes-vous sûr de vouloir nettoyer les données supprimées (soft delete) ? Cette action ne peut pas être annulée.')) return;

    setIsCleaningUp(true);
    await cleanup.cleanup();
    setIsCleaningUp(false);
    alert(`Nettoyage terminé!\n${cleanup.result?.totalRecordsRemoved || 0} enregistrements trouvés.`);
    refetchAll();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHook.exportData();
      alert('Export réussi!');
    } catch (error: any) {
      alert(`Erreur lors de l'export: ${error.message}`);
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
      {/* Header */}
      <PageHeader
        icon={Database}
        title="Administration"
        description="Gestion des bases de données et opérations système"
        gradient="from-slate-50 to-gray-100"
        actions={
          <>
            <Button onClick={handleTestConnections} variant="outline" size="sm" disabled={isTestingConnections}>
              <Database className="w-4 h-4 mr-2" />
              Tester Connexions
            </Button>
            <Button onClick={refetchAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </>
        }
      />

      {/* Usage Statistics Cards */}
            {statistics.statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{statistics.statistics.totalUsers}</div>
              <p className="text-xs text-blue-700 mt-1">{statistics.statistics.activeUsers} actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Projets</CardTitle>
              <Activity className="h-4 w-4 text-green-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{statistics.statistics.totalProjects}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Tâches</CardTitle>
              <Activity className="h-4 w-4 text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{statistics.statistics.totalTasks}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Saisies de temps</CardTitle>
              <Activity className="h-4 w-4 text-orange-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{statistics.statistics.totalTimeEntries}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-900">Logs d'audit</CardTitle>
              <Activity className="h-4 w-4 text-pink-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-900">{statistics.statistics.recentAuditLogs}</div>
              <p className="text-xs text-pink-700 mt-1">{statistics.statistics.period}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Résumé de l'activité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Total des éléments dans le système:{' '}
              <span className="font-bold text-2xl text-primary">
                {statistics.statistics ? (statistics.statistics.totalUsers + statistics.statistics.totalProjects + statistics.statistics.totalTasks + statistics.statistics.totalTimeEntries) : 0}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
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

        {/* Databases Tab */}
        <TabsContent value="databases" className="space-y-4">
          {summary.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[summary.summary.adminDatabase, summary.summary.projectsDatabase, summary.summary.timeDatabase, summary.summary.reportsDatabase].map((db, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        {db.name}
                      </CardTitle>
                      <Badge variant="outline">{db.totalRecords} enregistrements</Badge>
                    </div>
                    <CardDescription>{db.tablesCount} tables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Collection</TableHead>
                          <TableHead className="text-right">Nombre</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(db.collections).map(([name, count]) => (
                          <TableRow key={name}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell className="text-right font-semibold">{count as number}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test de Connexion aux Bases de Données</CardTitle>
                  <CardDescription>Vérifier que toutes les connexions fonctionnent</CardDescription>
                </div>
                <Button onClick={handleTestConnections} disabled={isTestingConnections}>
                  {isTestingConnections ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Tester
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {connections.connections ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {connections.connections.allSuccessful ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold">
                      {connections.connections.allSuccessful ? 'Toutes les connexions réussies' : 'Certaines connexions ont échoué'}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Base de Données</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Temps de Réponse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connections.connections.tests.map((test: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{test.databaseName}</TableCell>
                          <TableCell>
                            {test.success ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Succès
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Échec
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{test.message}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{test.responseTimeMs} ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Cliquez sur "Tester" pour vérifier les connexions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opérations de Maintenance</CardTitle>
              <CardDescription>Nettoyage et export des données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Nettoyer les Données Supprimées</h3>
                  <p className="text-sm text-muted-foreground">
                    Comptabilise les enregistrements marqués comme supprimés (soft delete)
                  </p>
                </div>
                <Button onClick={handleCleanup} disabled={isCleaningUp} variant="outline">
                  {isCleaningUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Nettoyage...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Nettoyer
                    </>
                  )}
                </Button>
              </div>

              {cleanup.result && (
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Nettoyage Complété</h3>
                  </div>
                  <p className="text-sm mb-3">
                    <span className="font-semibold">{cleanup.result.totalRecordsRemoved}</span> enregistrements supprimés trouvés
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Base de Données</TableHead>
                        <TableHead className="text-right">Enregistrements</TableHead>
                        <TableHead>Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cleanup.result.databaseResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.databaseName}</TableCell>
                          <TableCell className="text-right font-semibold">{result.recordsRemoved}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{result.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Exporter les Données Système</h3>
                  <p className="text-sm text-muted-foreground">
                    Générer un résumé des données du système
                  </p>
                </div>
                <Button onClick={handleExport} disabled={isExporting} variant="outline">
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
