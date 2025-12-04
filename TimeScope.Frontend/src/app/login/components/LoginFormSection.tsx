import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';
import LoginFooter from './LoginFooter';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wrench } from 'lucide-react';

export default function LoginFormSection() {
  const { isMaintenanceMode } = useMaintenance();

  return (
    <div className="w-full lg:w-[40%] h-full flex items-center justify-center px-6 py-6 lg:px-8 bg-background overflow-y-auto">
      <div className="w-full max-w-md space-y-4">
        {isMaintenanceMode && (
          <Alert variant="destructive" className="mb-4 border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Wrench className="h-4 w-4" />
            <AlertTitle>Maintenance en cours</AlertTitle>
            <AlertDescription>
              Le site est actuellement en maintenance. Seuls les administrateurs peuvent se connecter.
            </AlertDescription>
          </Alert>
        )}
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
