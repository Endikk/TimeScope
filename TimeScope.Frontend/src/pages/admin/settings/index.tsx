import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, RefreshCw } from 'lucide-react';
import { SettingsHeader } from './components/SettingsHeader';
import { AdminSettingsCard } from './components/AdminSettingsCard';
import { UserSettingsCard } from './components/UserSettingsCard';
import { settingsService, AppSetting } from '@/lib/api/services/settings.service';
import { toast } from 'sonner';

const DEFAULT_ADMIN_SETTINGS = {
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
};

export default function SettingsPageAPI() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Paramètres Admin (globaux pour toute l'application)
  const [adminSettings, setAdminSettings] = useState(DEFAULT_ADMIN_SETTINGS);

  const handleAdminSettingUpdate = (key: string, value: string | number | boolean) => {
    const keys = key.split('.');
    setAdminSettings(prev => {
      const newSettings = { ...prev };
      let current: Record<string, unknown> = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] as object };
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });

    console.log(`Paramètre admin mis à jour: ${key} = ${value}`);
  };

  // Charger les paramètres depuis le backend
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await settingsService.getAllSettings();

      // Convertir les paramètres du backend vers la structure locale
      const adminSettingsFromBackend = { ...DEFAULT_ADMIN_SETTINGS };

      settings.forEach((setting: AppSetting) => {
        const keys = setting.key.split('.');
        let value: string | number | boolean = setting.value;

        // Convertir la valeur selon le type
        if (setting.dataType === 'boolean') {
          value = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          value = parseInt(setting.value, 10);
        }

        // Déterminer si c'est un paramètre admin
        if (keys[0] === 'admin' && keys.length >= 3) {
          const category = keys[1];
          const field = keys[2];
          if (adminSettingsFromBackend[category as keyof typeof adminSettingsFromBackend]) {
            (adminSettingsFromBackend[category as keyof typeof adminSettingsFromBackend] as Record<string, string | number | boolean>)[field] = value;
          }
        }
      });

      setAdminSettings(adminSettingsFromBackend);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les paramètres admin
  const saveAdminSettings = async () => {
    try {
      setSaving(true);

      // Récupérer les paramètres existants pour savoir lesquels créer/mettre à jour
      const existingSettings = await settingsService.getAllSettings({ category: 'admin' });
      const existingKeys = new Set(existingSettings.map(s => s.key));

      // Convertir les paramètres en format clé/valeur pour le backend
      const settingsToSave: { key: string; value: string; category: string; dataType: string; isPublic: boolean }[] = [];

      Object.entries(adminSettings).forEach(([category, values]) => {
        Object.entries(values as Record<string, string | number | boolean>).forEach(([field, value]) => {
          const key = `admin.${category}.${field}`;
          const dataType = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';

          // Le mode maintenance doit être public pour que tout le monde puisse le voir
          // UPDATE: Avec le nouveau SystemController, on n'a plus besoin d'exposer ce setting publiquement via l'API settings
          const isPublic = false;

          settingsToSave.push({
            key,
            value: String(value),
            category: 'admin',
            dataType,
            isPublic
          });
        });
      });

      // Mettre à jour ou créer chaque paramètre
      for (const setting of settingsToSave) {
        if (existingKeys.has(setting.key)) {
          await settingsService.updateSetting(setting.key, {
            value: setting.value,
            category: setting.category,
            dataType: setting.dataType,
            isPublic: setting.isPublic
          });
        } else {
          await settingsService.createSetting({
            key: setting.key,
            value: setting.value,
            category: setting.category,
            dataType: setting.dataType,
            isPublic: setting.isPublic
          });
        }
      }

      toast.success('Paramètres administrateur enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres admin:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarder les autorisations employé


  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
      <SettingsHeader />

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Paramètres Administrateur
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Autorisations Employé
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
            onSave={saveAdminSettings}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Autorisations Employé</h3>
                <p className="text-sm text-green-700 mt-1">
                  Définissez quelles options les <strong>employés peuvent personnaliser</strong>.
                  Les options désactivées ne seront pas visibles par les employés.
                </p>
              </div>
            </div>
          </div>
          <UserSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
