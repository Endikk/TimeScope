"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { notificationsService, Notification } from '@/lib/api/services/notifications.service';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, usually in lib/utils

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [data, count] = await Promise.all([
                notificationsService.getNotifications(),
                notificationsService.getUnreadCount()
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            toast.error('Impossible de charger les notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Toutes les notifications marquées comme lues');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationsService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // If it was unread, decrement count
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notification supprimée');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Info': return <Info className="h-5 w-5 text-blue-500" />;
            case 'Warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'Success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Error': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Bell className="h-8 w-8 text-indigo-600" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-sm font-normal bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">
                                    {unreadCount} non lues
                                </span>
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Restez informé des dernières mises à jour et activités
                        </p>
                    </div>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
                            <CheckCheck className="h-4 w-4" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="h-24" />
                            </Card>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Aucune notification</p>
                            <p className="text-sm">Vous êtes à jour !</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={cn(
                                    "transition-all duration-200 hover:shadow-md",
                                    !notification.isRead && "border-indigo-200 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-800"
                                )}
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full",
                                            !notification.isRead ? "bg-background shadow-sm" : "bg-muted"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={cn(
                                                    "font-medium leading-none",
                                                    !notification.isRead ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {notification.message}
                                            </p>
                                            {notification.link && (
                                                <div className="pt-2">
                                                    <Link
                                                        href={notification.link}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 w-fit"
                                                    >
                                                        Voir le détail
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Marquer comme lu"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                onClick={() => handleDelete(notification.id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
