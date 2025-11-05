import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
  Archive
} from 'lucide-react';

interface DatabaseStats {
  size: string;
  tables: number;
  records: number;
  lastBackup: string;
  health: 'good' | 'warning' | 'critical';
}

interface BackupInfo {
  id: string;
  date: string;
  size: string;
  type: 'Automatique' | 'Manuel';
  status: 'Succès' | 'Échec';
}

export default function DatabaseMaintenancePage() {
  const [stats] = useState<DatabaseStats>({
    size: '245 MB',
    tables: 18,
    records: 15420,
    lastBackup: '2025-11-04 02:00:00',
    health: 'good'
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>('');

  const [backups] = useState<BackupInfo[]>([
    {
      id: '1',
      date: '2025-11-04 02:00:00',
      size: '245 MB',
      type: 'Automatique',
      status: 'Succès'
    },
    {
      id: '2',
      date: '2025-11-03 02:00:00',
      size: '243 MB',
      type: 'Automatique',
      status: 'Succès'
    },
    {
      id: '3',
      date: '2025-11-02 14:30:00',
      size: '240 MB',
      type: 'Manuel',
      status: 'Succès'
    },
    {
      id: '4',
      date: '2025-11-02 02:00:00',
      size: '239 MB',
      type: 'Automatique',
      status: 'Succès'
    },
    {
      id: '5',
      date: '2025-11-01 02:00:00',
      size: '238 MB',
      type: 'Automatique',
      status: 'Échec'
    }
  ]);

  const [tableStats] = useState([
    { name: 'TimeEntries', records: 8420, size: '120 MB', fragmentation: 12 },
    { name: 'Users', records: 45, size: '2 MB', fragmentation: 0 },
    { name: 'Projects', records: 18, size: '1 MB', fragmentation: 5 },
    { name: 'Tasks', records: 342, size: '15 MB', fragmentation: 8 },
    { name: 'ActivityLogs', records: 6595, size: '95 MB', fragmentation: 15 },
    { name: 'Groups', records: 12, size: '512 KB', fragmentation: 0 }
  ]);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
    }, 2000);
  };

  const handleConfirmAction = (action: string) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    console.log(`Executing action: ${confirmAction}`);
    setShowConfirmDialog(false);
  };

  const getHealthBadge = (health: DatabaseStats['health']) => {
    const styles = {
      'good': { bg: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Excellente' },
      'warning': { bg: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Attention' },
      'critical': { bg: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Critique' }
    };
    const config = styles[health];
    const Icon = config.icon;
    return (
      <Badge className={config.bg}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance de la base de données</h1>
        <p className="text-muted-foreground">
          Gérez les sauvegardes, optimisations et la santé de votre base de données
        </p>
      </div>

      {/* Health Alert */}
      {stats.health === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Attention requise</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Certaines tables nécessitent une optimisation. Exécutez une maintenance préventive.
          </AlertDescription>
        </Alert>
      )}

      {/* Database Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.size}</div>
            <p className="text-xs text-muted-foreground">Sur disque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tables}</div>
            <p className="text-xs text-muted-foreground">Tables actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enregistrements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.records.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de lignes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État de santé</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getHealthBadge(stats.health)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dernière vérification il y a 2h</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Effectuez des opérations de maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
              onClick={handleBackup}
              disabled={isBackingUp}
            >
              <div className="flex items-center gap-2 w-full">
                <Archive className="h-5 w-5" />
                <span className="font-semibold">Sauvegarde manuelle</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                {isBackingUp ? 'Sauvegarde en cours...' : 'Créer une sauvegarde immédiate'}
              </p>
            </Button>

            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
              onClick={handleOptimize}
              disabled={isOptimizing}
            >
              <div className="flex items-center gap-2 w-full">
                <RefreshCw className={`h-5 w-5 ${isOptimizing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Optimiser les tables</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                {isOptimizing ? 'Optimisation en cours...' : 'Défragmenter et optimiser'}
              </p>
            </Button>

            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
              onClick={() => handleConfirmAction('cleanup')}
            >
              <div className="flex items-center gap-2 w-full">
                <Trash2 className="h-5 w-5" />
                <span className="font-semibold">Nettoyer les logs</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Supprimer les logs de plus de 90 jours
              </p>
            </Button>

            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
            >
              <div className="flex items-center gap-2 w-full">
                <Download className="h-5 w-5" />
                <span className="font-semibold">Exporter les données</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Télécharger un export SQL
              </p>
            </Button>

            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
            >
              <div className="flex items-center gap-2 w-full">
                <Upload className="h-5 w-5" />
                <span className="font-semibold">Importer des données</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Restaurer depuis un fichier SQL
              </p>
            </Button>

            <Button
              className="h-auto flex-col items-start p-4 gap-2"
              variant="outline"
              onClick={() => handleConfirmAction('verify')}
            >
              <div className="flex items-center gap-2 w-full">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Vérifier l'intégrité</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Contrôler la cohérence des données
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par table</CardTitle>
          <CardDescription>Détails de chaque table de la base de données</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Enregistrements</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Fragmentation</TableHead>
                <TableHead>État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableStats.map((table) => (
                <TableRow key={table.name}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{table.records.toLocaleString()}</TableCell>
                  <TableCell>{table.size}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress value={table.fragmentation} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground">{table.fragmentation}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {table.fragmentation < 10 ? (
                      <Badge className="bg-green-100 text-green-800">Bon</Badge>
                    ) : table.fragmentation < 20 ? (
                      <Badge className="bg-yellow-100 text-yellow-800">À surveiller</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Optimiser</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des sauvegardes</CardTitle>
          <CardDescription>
            Dernière sauvegarde: {new Date(stats.lastBackup).toLocaleString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    {new Date(backup.date).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{backup.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {backup.status === 'Succès' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {backup.status}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {backup.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirmAction('restore')}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Restaurer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
            <DialogDescription>
              {confirmAction === 'cleanup' &&
                'Êtes-vous sûr de vouloir supprimer les logs de plus de 90 jours ? Cette action est irréversible.'}
              {confirmAction === 'verify' &&
                'Lancer une vérification complète de l\'intégrité de la base de données ? Cette opération peut prendre plusieurs minutes.'}
              {confirmAction === 'restore' &&
                'Restaurer cette sauvegarde ? Toutes les données actuelles seront remplacées par celles de la sauvegarde.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={executeAction}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
