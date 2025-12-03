import { useEffect } from 'react';
import { LoginVideoSection, LoginFormSection } from './components';
import { useMaintenance } from '@/contexts/MaintenanceContext';

export default function LoginPage() {
  const { checkMaintenanceStatus } = useMaintenance();

  useEffect(() => {
    // Vérifier le statut de maintenance dès l'arrivée sur la page
    checkMaintenanceStatus();

    // Bloquer le scroll sur la page de login
    document.body.style.overflow = 'hidden';

    // Nettoyer au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [checkMaintenanceStatus]);

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden fixed inset-0">
      <LoginVideoSection />
      <LoginFormSection />
    </div>
  );
}
