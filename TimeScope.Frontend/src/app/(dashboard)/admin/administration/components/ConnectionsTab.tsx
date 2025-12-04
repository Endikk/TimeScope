import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface ConnectionTest {
  databaseName: string;
  success: boolean;
  message: string;
  responseTimeMs: number;
}

interface Connections {
  allSuccessful: boolean;
  tests: ConnectionTest[];
}

interface ConnectionsTabProps {
  connections: Connections | null;
  onTestConnections: () => void;
  isTestingConnections: boolean;
}

export function ConnectionsTab({ connections, onTestConnections, isTestingConnections }: ConnectionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test de Connexion aux Bases de Données</CardTitle>
            <CardDescription>Vérifier que toutes les connexions fonctionnent</CardDescription>
          </div>
          <Button onClick={onTestConnections} disabled={isTestingConnections}>
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
        {connections ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {connections.allSuccessful ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">
                {connections.allSuccessful ? 'Toutes les connexions réussies' : 'Certaines connexions ont échoué'}
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
                {connections.tests.map((test, index) => (
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
  );
}
