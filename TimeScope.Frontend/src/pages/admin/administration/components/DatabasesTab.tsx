import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database } from 'lucide-react';

interface DatabaseInfo {
  name: string;
  totalRecords: number;
  tablesCount: number;
  collections: Record<string, unknown>;
}

interface Summary {
  adminDatabase: DatabaseInfo;
  projectsDatabase: DatabaseInfo;
  timeDatabase: DatabaseInfo;
  reportsDatabase: DatabaseInfo;
}

interface DatabasesTabProps {
  summary: Summary | null;
}

export function DatabasesTab({ summary }: DatabasesTabProps) {
  if (!summary) return null;

  const databases = [
    summary.adminDatabase,
    summary.projectsDatabase,
    summary.timeDatabase,
    summary.reportsDatabase
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {databases.map((db, index) => (
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
  );
}
