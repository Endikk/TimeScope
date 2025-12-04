"use client"

import { useAuth } from '@/contexts/AuthContext';
import { SecurityCard } from './components/SecurityCard';
import { UserPreferencesCard } from './components/UserPreferencesCard';
import { profileApiService } from '@/lib/api/services/profile.service';

export default function SettingsPage() {
    const { user } = useAuth();

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        if (!user?.id) {
            throw new Error('User not found');
        }

        try {
            await profileApiService.changePassword(user.id, {
                currentPassword,
                newPassword,
            });

            alert('Mot de passe changé avec succès');
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            if (err?.response?.status === 401) {
                throw new Error('Mot de passe actuel incorrect');
            }
            throw new Error(err?.response?.data?.message || 'Erreur lors du changement de mot de passe');
        }
    };

    const handleEmailChange = async (newEmail: string) => {
        if (!user?.id) {
            throw new Error('User not found');
        }

        try {
            await profileApiService.updateProfile(user.id, {
                email: newEmail,
            });

            alert('Email mis à jour avec succès');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            throw new Error(err?.response?.data?.message || "Erreur lors de la mise à jour de l'email");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <h1 className="text-3xl font-bold text-foreground mb-8">Paramètres</h1>

                <div className="space-y-6">
                    <SecurityCard
                        onPasswordChange={handlePasswordChange}
                        onEmailChange={handleEmailChange}
                        currentEmail={user?.email}
                    />
                    <UserPreferencesCard />
                </div>
            </div>
        </div>
    );
}
