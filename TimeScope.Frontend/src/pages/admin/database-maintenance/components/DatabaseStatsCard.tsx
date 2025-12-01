
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { LucideIcon } from 'lucide-react';

interface DatabaseStatsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  rows: Array<{
    label: string;
    value: string | number;
    isDate?: boolean;
  }>;
}

export function DatabaseStatsCard({ title, description, icon: Icon, iconColor, rows }: DatabaseStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h - 5 w - 5 ${iconColor} `} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell className={`text - right ${row.isDate ? 'text-xs' : ''} `}>
                  {row.isDate && typeof row.value === 'string'
                    ? new Date(row.value).toLocaleString('fr-FR')
                    : row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
