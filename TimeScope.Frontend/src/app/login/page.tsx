"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginVideoSection, LoginFormSection } from './components';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { checkMaintenanceStatus } = useMaintenance();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Rediriger si déjà connecté
        if (!isLoading && isAuthenticated) {
            router.push('/home');
            return;
        }

        // Vérifier le statut de maintenance dès l'arrivée sur la page
        checkMaintenanceStatus();

        // Bloquer le scroll sur la page de login
        document.body.style.overflow = 'hidden';

        // Nettoyer au démontage du composant
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [checkMaintenanceStatus, isAuthenticated, isLoading, router]);

    return (
        <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden fixed inset-0">
            <LoginVideoSection />
            <LoginFormSection />
        </div>
    );
}
