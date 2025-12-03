import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { systemService } from '@/lib/api/services/system.service';

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
            const status = await systemService.getSystemStatus();
            setIsMaintenanceMode(status.maintenanceMode);
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

        // Polling toutes les 15 secondes pour vérifier si le mode maintenance a changé
        const interval = setInterval(checkMaintenanceStatus, 15000);

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
