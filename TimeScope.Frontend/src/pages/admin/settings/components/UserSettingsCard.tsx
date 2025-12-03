import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Palette, Loader2 } from 'lucide-react';
import { settingsService } from '@/lib/api/services/settings.service';
import { toast } from 'sonner';

interface UserSettings {
  profile: {
    allowProfilePicture: boolean;
    allowBanner: boolean;
  };
  appearance: {
    allowCompactView: boolean;
  };
}

export function UserSettingsCard() {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      allowProfilePicture: true,
      allowBanner: true,
    },
    appearance: {
      allowCompactView: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await settingsService.getAllSettings();

      const newSettings = { ...settings };

      // Parse settings from API
      const allowProfilePicture = allSettings.find(s => s.key === 'profile.allowProfilePicture');
      if (allowProfilePicture) newSettings.profile.allowProfilePicture = allowProfilePicture.value === 'true';

      const allowBanner = allSettings.find(s => s.key === 'profile.allowBanner');
      if (allowBanner) newSettings.profile.allowBanner = allowBanner.value === 'true';

      const allowCompactView = allSettings.find(s => s.key === 'appearance.allowCompactView');
      if (allowCompactView) newSettings.appearance.allowCompactView = allowCompactView.value === 'true';

      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (section: keyof UserSettings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const saveOrUpdateSetting = async (key: string, value: string, category: string, description: string) => {
    try {
      // Try to get the setting first to see if it exists
      // We could use the local state 'settings' but it's better to rely on the API or the list we fetched
      // However, for simplicity and performance, let's try to update, and if it fails with 404, create it.
      // But wait, the API returns 404 if not found on update?
      // SettingsController.UpdateSetting returns NotFound if KeyNotFoundException.

      // Better approach: We fetched all settings in loadSettings. We can know if they exist.
      // But the user might have created them in another tab? Unlikely.
      // Let's just try to get it first? No that's too many requests.

      // Let's assume if we loaded it and it had a value, it exists.
      // But we initialized state with defaults.

      // Let's just try to update. If it fails (404), then create.
      // Actually, let's just fetch the specific setting. If it exists, update. If 404, create.
      // Or better: use the list we loaded.

      // Let's use a try-catch block with update, and if it fails, create?
      // No, let's use a helper that checks existence via API for safety, or just tries update then create.

      // Let's implement a robust save:
      try {
        await settingsService.updateSetting(key, {
          value,
          category,
          description,
          dataType: 'boolean',
          isPublic: true
        });
      } catch (error: any) {
        // If 404, create it
        if (error.response && error.response.status === 404) {
          await settingsService.createSetting({
            key,
            value,
            category,
            description,
            dataType: 'boolean',
            isPublic: true
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await saveOrUpdateSetting(
        'profile.allowProfilePicture',
        settings.profile.allowProfilePicture.toString(),
        'profile',
        'Allow users to change their profile picture'
      );

      await saveOrUpdateSetting(
        'profile.allowBanner',
        settings.profile.allowBanner.toString(),
        'profile',
        'Allow users to change their profile banner'
      );

      await saveOrUpdateSetting(
        'appearance.allowCompactView',
        settings.appearance.allowCompactView.toString(),
        'appearance',
        'Allow users to use compact view'
      );

      toast.success('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Autorisations de Profil
          </CardTitle>
          <CardDescription>
            Définissez quelles options de profil les employés peuvent personnaliser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-profile-picture">Photo de profil</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer leur photo de profil (avatar)
              </p>
            </div>
            <Switch
              id="allow-profile-picture"
              checked={settings.profile.allowProfilePicture}
              onCheckedChange={(checked) => handleUpdate('profile', 'allowProfilePicture', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-banner">Bannière de profil</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer leur bannière de profil
              </p>
            </div>
            <Switch
              id="allow-banner"
              checked={settings.profile.allowBanner}
              onCheckedChange={(checked) => handleUpdate('profile', 'allowBanner', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Autorisations d'Apparence
          </CardTitle>
          <CardDescription>
            Définissez quelles options d'interface les employés peuvent modifier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">


          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-compact-view">Vue compacte</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés d'activer la vue compacte
              </p>
            </div>
            <Switch
              id="allow-compact-view"
              checked={settings.appearance.allowCompactView}
              onCheckedChange={(checked) => handleUpdate('appearance', 'allowCompactView', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les autorisations'
          )}
        </Button>
      </div>
    </div>
  );
}
