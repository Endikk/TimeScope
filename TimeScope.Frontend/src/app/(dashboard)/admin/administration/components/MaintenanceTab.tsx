import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2, Download, CheckCircle2 } from 'lucide-react';

interface CleanupDatabaseResult {
  databaseName: string;
  recordsRemoved: number;
  details: string;
}

interface CleanupResult {
  totalRecordsRemoved: number;
  databaseResults: CleanupDatabaseResult[];
}

interface MaintenanceTabProps {
  cleanupResult: CleanupResult | null;
  onCleanup: () => void;
  onExport: () => void;
  isCleaningUp: boolean;
  isExporting: boolean;
}

export function MaintenanceTab({ cleanupResult, onCleanup, onExport, isCleaningUp, isExporting }: MaintenanceTabProps) {
  return (
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
          <Button onClick={onCleanup} disabled={isCleaningUp} variant="outline">
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

        {cleanupResult && (
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Nettoyage Complété</h3>
            </div>
            <p className="text-sm mb-3">
              <span className="font-semibold">{cleanupResult.totalRecordsRemoved}</span> enregistrements supprimés trouvés
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
                {cleanupResult.databaseResults.map((result, index) => (
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
          <Button onClick={onExport} disabled={isExporting} variant="outline">
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
  );
}
