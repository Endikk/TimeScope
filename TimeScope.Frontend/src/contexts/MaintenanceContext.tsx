import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/lib/api/services/settings.service';

interface MaintenanceContextType {
    isMaintenanceMode: boolean;
    isLoading: boolean;
    checkMaintenanceStatus: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkMaintenanceStatus = async () => {
        try {
            // On récupère le paramètre public de maintenance
            // Note: Le backend doit exposer ce paramètre publiquement ou via un endpoint spécifique sans auth
            // Pour l'instant on suppose qu'on peut le récupérer via les settings publics
            const settings = await settingsService.getAllSettings({ isPublic: true });
            const maintenanceSetting = settings.find(s => s.key === 'admin.system.maintenanceMode');

            if (maintenanceSetting) {
                setIsMaintenanceMode(maintenanceSetting.value === 'true');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du mode maintenance:', error);
            // En cas d'erreur, on assume que le site n'est pas en maintenance pour ne pas bloquer
            setIsMaintenanceMode(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkMaintenanceStatus();

        // Polling toutes les minutes pour vérifier si le mode maintenance a changé
        const interval = setInterval(checkMaintenanceStatus, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <MaintenanceContext.Provider
            value={{
                isMaintenanceMode,
                isLoading,
                checkMaintenanceStatus,
            }}
        >
            {children}
        </MaintenanceContext.Provider>
    );
};

export const useMaintenance = (): MaintenanceContextType => {
    const context = useContext(MaintenanceContext);
    if (context === undefined) {
        throw new Error('useMaintenance doit être utilisé à l\'intérieur d\'un MaintenanceProvider');
    }
    return context;
};
