import apiClient from '../client';

export interface SystemStatus {
    maintenanceMode: boolean;
    message: string;
}

export const systemService = {
    getSystemStatus: async (): Promise<SystemStatus> => {
        const response = await apiClient.get<SystemStatus>('/system/status');
        return response.data;
    },
};
