import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, RefreshCw } from 'lucide-react';
import { SettingsHeader } from './components/SettingsHeader';
import { AdminSettingsCard } from './components/AdminSettingsCard';
import { UserSettingsCard } from './components/UserSettingsCard';

export default function SettingsPageAPI() {
  const [loading, setLoading] = useState(false);

  // Paramètres Admin (globaux pour toute l'application)
  const [adminSettings, setAdminSettings] = useState({
    security: {
      requireStrongPassword: true,
      twoFactorAuth: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
    },
    timeTracking: {
      workStartTime: '08:00',
      workEndTime: '17:00',
      defaultBreakDuration: 60,
      requireTimeEntry: true,
      autoClockOut: false,
    },
    users: {
      allowSelfRegistration: false,
      emailVerification: true,
      defaultRole: 'Employee',
    },
    notifications: {
      emailEnabled: true,
      taskReminders: true,
      dailySummary: false,
    },
    system: {
      maintenanceMode: false,
      logRetentionDays: 90,
      autoBackup: true,
    },
  });

  // Paramètres Utilisateur (préférences personnelles)
  const [userSettings, setUserSettings] = useState({
    profile: {
      showProfilePicture: true,
      showEmail: false,
      showPhone: false,
    },
    notifications: {
      emailOnTaskAssign: true,
      emailOnTaskUpdate: false,
      emailOnMention: true,
      desktopNotifications: true,
      summaryFrequency: 'daily',
    },
    appearance: {
      theme: 'light',
      colorScheme: 'blue',
      compactView: false,
      showAvatars: true,
    },
    regional: {
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    },
  });

  const handleAdminSettingUpdate = (key: string, value: any) => {
    const keys = key.split('.');
    setAdminSettings(prev => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });

    console.log(`Paramètre admin mis à jour: ${key} = ${value}`);
  };

  const handleUserSettingUpdate = (key: string, value: any) => {
    const keys = key.split('.');
    setUserSettings(prev => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });

    console.log(`Préférence utilisateur mise à jour: ${key} = ${value}`);
  };

  const handleSaveAllSettings = async () => {
    setLoading(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Tous les paramètres enregistrés:', { adminSettings, userSettings });
      alert('Paramètres enregistrés avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Enregistrement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6">
      <SettingsHeader onRefresh={handleSaveAllSettings} />

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Paramètres Administrateur
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Paramètres Employé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Paramètres Globaux</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Ces paramètres s'appliquent à <strong>tous les utilisateurs</strong> de l'application.
                  Seuls les administrateurs peuvent modifier ces paramètres.
                </p>
              </div>
            </div>
          </div>
          <AdminSettingsCard
            settings={adminSettings}
            onUpdate={handleAdminSettingUpdate}
          />
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Préférences Personnelles</h3>
                <p className="text-sm text-green-700 mt-1">
                  Ces paramètres sont <strong>personnalisables par chaque employé</strong> pour adapter
                  l'interface et les notifications à leurs préférences.
                </p>
              </div>
            </div>
          </div>
          <UserSettingsCard
            settings={userSettings}
            onUpdate={handleUserSettingUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
