import apiClient from '../client';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    type: 'General' | 'Info' | 'Warning' | 'Success' | 'Error';
    link?: string;
    createdAt: string;
}

export const notificationsService = {
    // Get notifications for the current user
    getNotifications: async (unreadOnly = false) => {
        const response = await apiClient.get<Notification[]>('/notifications', {
            params: { unreadOnly }
        });
        return response.data;
    },

    // Get count of unread notifications
    getUnreadCount: async () => {
        const response = await apiClient.get<number>('/notifications/count');
        return response.data;
    },

    // Mark a notification as read
    markAsRead: async (id: string) => {
        await apiClient.put(`/notifications/${id}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        await apiClient.put('/notifications/read-all');
    },

    // Delete a notification
    deleteNotification: async (id: string) => {
        await apiClient.delete(`/notifications/${id}`);
    }
};
