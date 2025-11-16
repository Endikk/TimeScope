import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database, RefreshCw } from 'lucide-react';

interface AdministrationHeaderProps {
  onTestConnections: () => void;
  onRefresh: () => void;
  isTestingConnections: boolean;
}

export function AdministrationHeader({ onTestConnections, onRefresh, isTestingConnections }: AdministrationHeaderProps) {
  return (
    <PageHeader
      icon={Database}
      title="Administration"
      description="Gestion des bases de données et opérations système"
      gradient="from-slate-50 to-gray-100"
      actions={
        <>
          <Button onClick={onTestConnections} variant="outline" size="sm" disabled={isTestingConnections}>
            <Database className="w-4 h-4 mr-2" />
            Tester Connexions
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </>
      }
    />
  );
}
