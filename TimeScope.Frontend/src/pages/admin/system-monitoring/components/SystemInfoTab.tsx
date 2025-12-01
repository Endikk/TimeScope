import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface SystemInfo {
  hostName: string;
  operatingSystem: string;
  architecture: string;
  framework: string;
  processorCount: number;
  applicationVersion: string;
  workingDirectory: string;
  startTime: string;
}

interface SystemInfoTabProps {
  info: SystemInfo;
}

export function SystemInfoTab({ info }: SystemInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du Système</CardTitle>
        <CardDescription>Détails de l'environnement d'exécution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Nom d'hôte</div>
              <div className="text-lg font-semibold">{info.hostName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Système d'exploitation</div>
              <div className="text-lg">{info.operatingSystem}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Architecture</div>
              <div className="text-lg">{info.architecture}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Framework</div>
              <div className="text-lg">{info.framework}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Processeurs</div>
              <div className="text-lg font-semibold">{info.processorCount} coeurs</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Version</div>
              <div className="text-lg">{info.applicationVersion}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Répertoire de travail</div>
              <div className="text-sm font-mono break-all">{info.workingDirectory}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Démarré le</div>
              <div className="text-lg">{format(new Date(info.startTime), 'dd/MM/yyyy HH:mm:ss')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
