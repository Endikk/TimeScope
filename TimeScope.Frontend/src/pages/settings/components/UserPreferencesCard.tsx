import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Globe, Loader2, AlertCircle } from 'lucide-react';
import { settingsService, AppSetting } from '@/lib/api/services/settings.service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AllowedSettings {
  profile: {
    allowProfilePicture: boolean;
    allowShowEmail: boolean;
    allowShowPhone: boolean;
  };
  notifications: {
    allowEmailOnTaskAssign: boolean;
    allowEmailOnTaskUpdate: boolean;
    allowEmailOnMention: boolean;
    allowDesktopNotifications: boolean;
    allowSummaryFrequency: boolean;
  };
  appearance: {

    allowColorScheme: boolean;
    allowCompactView: boolean;
    allowShowAvatars: boolean;
  };
  regional: {
    allowLanguage: boolean;
    allowTimezone: boolean;
    allowDateFormat: boolean;
    allowTimeFormat: boolean;
  };
}

interface UserPreferences {
  profile: {
    showProfilePicture: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  notifications: {
    emailOnTaskAssign: boolean;
    emailOnTaskUpdate: boolean;
    emailOnMention: boolean;
    desktopNotifications: boolean;
    summaryFrequency: string;
  };
  appearance: {

    colorScheme: string;
    compactView: boolean;
    showAvatars: boolean;
  };
  regional: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
}

const DEFAULT_ALLOWED_SETTINGS: AllowedSettings = {
  profile: {
    allowProfilePicture: true,
    allowShowEmail: true,
    allowShowPhone: true,
  },
  notifications: {
    allowEmailOnTaskAssign: true,
    allowEmailOnTaskUpdate: true,
    allowEmailOnMention: true,
    allowDesktopNotifications: true,
    allowSummaryFrequency: true,
  },
  appearance: {

    allowColorScheme: true,
    allowCompactView: true,
    allowShowAvatars: true,
  },
  regional: {
    allowLanguage: true,
    allowTimezone: true,
    allowDateFormat: true,
    allowTimeFormat: true,
  },
};

const DEFAULT_PREFERENCES: UserPreferences = {
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
};

export function UserPreferencesCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Autorisations définies par l'admin
  const [allowedSettings, setAllowedSettings] = useState<AllowedSettings>(DEFAULT_ALLOWED_SETTINGS);

  // Préférences de l'utilisateur
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const { user } = useAuth();

  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const settings = await settingsService.getAllSettings();

      const newAllowed = { ...DEFAULT_ALLOWED_SETTINGS };

      // Load allowed settings from API
      settings.forEach((setting: AppSetting) => {
        const keys = setting.key.split('.');
        let value: string | number | boolean = setting.value;

        if (setting.dataType === 'boolean') {
          value = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          value = parseInt(setting.value, 10);
        }

        if (keys[0] === 'allowed' && keys.length >= 3) {
          const category = keys[1] as keyof AllowedSettings;
          const field = keys[2];
          if (newAllowed[category]) {
            (newAllowed[category] as Record<string, boolean>)[field] = value as boolean;
          }
        }
        // Also check for the new format we used in UserSettingsCard (e.g. 'profile.allowProfilePicture')
        // The previous code used 'allowed.profile.allowProfilePicture', but UserSettingsCard saves as 'profile.allowProfilePicture'
        // We need to support both or align them. UserSettingsCard saves as 'profile.allowProfilePicture'.
        // Let's check for that format too.
        if (keys.length === 2) {
          const category = keys[0] as keyof AllowedSettings;
          const field = keys[1];
          // Check if this field exists in our allowed settings structure
          // e.g. category='profile', field='allowProfilePicture'
          if (newAllowed[category] && field in newAllowed[category]) {
            (newAllowed[category] as Record<string, boolean>)[field] = value as boolean;
          }
        }
      });

      setAllowedSettings(newAllowed);

      // Load user preferences from LocalStorage (User Specific)
      const storageKey = `timeScope_userPreferences_${user.id}`;
      const savedPrefs = localStorage.getItem(storageKey);
      if (savedPrefs) {
        try {
          const parsedPrefs = JSON.parse(savedPrefs);
          // Merge with default to ensure all keys exist
          setPreferences(prev => ({
            ...prev,
            ...parsedPrefs,
            // Ensure nested objects are merged correctly
            profile: { ...prev.profile, ...parsedPrefs.profile },
            notifications: { ...prev.notifications, ...parsedPrefs.notifications },
            appearance: { ...prev.appearance, ...parsedPrefs.appearance },
            regional: { ...prev.regional, ...parsedPrefs.regional },
          }));
        } catch (e) {
          console.error('Error parsing saved preferences', e);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePreferenceUpdate = (key: string, value: string | number | boolean) => {
    const keys = key.split('.');
    setPreferences(prev => {
      const newPrefs = { ...prev };
      let current: Record<string, unknown> = newPrefs;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] as object };
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Save to LocalStorage (User Specific)
      const storageKey = `timeScope_userPreferences_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(preferences));

      // Dispatch a custom event to notify other components (like Home) of the change
      // We include the userId in the event detail or just rely on the fact that Home also checks the user
      window.dispatchEvent(new CustomEvent('timeScope_preferencesChanged', { detail: { userId: user.id } }));

      toast.success('Préférences enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      toast.error('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSaving(false);
    }
  };

  // Vérifier si au moins une option est autorisée dans une catégorie
  const hasAnyAllowed = (category: keyof AllowedSettings) => {
    return Object.values(allowedSettings[category]).some(v => v === true);
  };

  // Vérifier si aucune option n'est autorisée
  const noOptionsAvailable = !hasAnyAllowed('profile') && !hasAnyAllowed('notifications') &&
    !hasAnyAllowed('appearance') && !hasAnyAllowed('regional');

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (noOptionsAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            Mes Préférences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>Aucune option de personnalisation n'est disponible actuellement.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil */}
      {hasAnyAllowed('profile') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Préférences de Profil
            </CardTitle>
            <CardDescription>
              Personnalisez l'affichage de vos informations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {allowedSettings.profile.allowProfilePicture && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-profile-picture">Afficher ma photo de profil</Label>
                  <p className="text-sm text-muted-foreground">
                    Rendre votre photo visible aux autres utilisateurs
                  </p>
                </div>
                <Switch
                  id="show-profile-picture"
                  checked={preferences.profile.showProfilePicture}
                  onCheckedChange={(checked) => handlePreferenceUpdate('profile.showProfilePicture', checked)}
                />
              </div>
            )}

            {allowedSettings.profile.allowShowEmail && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Afficher mon email</Label>

                </div>
                <Switch
                  id="show-email"
                  checked={preferences.profile.showEmail}
                  onCheckedChange={(checked) => handlePreferenceUpdate('profile.showEmail', checked)}
                />
              </div>
            )}

            {allowedSettings.profile.allowShowPhone && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-phone">Afficher mon téléphone</Label>

                </div>
                <Switch
                  id="show-phone"
                  checked={preferences.profile.showPhone}
                  onCheckedChange={(checked) => handlePreferenceUpdate('profile.showPhone', checked)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}



      {/* Apparence */}
      {hasAnyAllowed('appearance') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">


            {allowedSettings.appearance.allowColorScheme && (
              <div className="space-y-2">
                <Label htmlFor="color-scheme">Palette de couleurs</Label>
                <Select
                  value={preferences.appearance.colorScheme}
                  onValueChange={(value) => handlePreferenceUpdate('appearance.colorScheme', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Bleu</SelectItem>
                    <SelectItem value="green">Vert</SelectItem>
                    <SelectItem value="purple">Violet</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Rouge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {allowedSettings.appearance.allowCompactView && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">Vue compacte</Label>
                  <p className="text-sm text-muted-foreground">
                    Réduire l'espacement pour afficher plus d'informations
                  </p>
                </div>
                <Switch
                  id="compact-view"
                  checked={preferences.appearance.compactView}
                  onCheckedChange={(checked) => handlePreferenceUpdate('appearance.compactView', checked)}
                />
              </div>
            )}


          </CardContent>
        </Card>
      )}

      {/* Préférences régionales */}
      {hasAnyAllowed('regional') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              Préférences Régionales
            </CardTitle>
            <CardDescription>
              Langue et formats d'affichage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {allowedSettings.regional.allowLanguage && (
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={preferences.regional.language}
                  onValueChange={(value) => handlePreferenceUpdate('regional.language', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}



            {allowedSettings.regional.allowDateFormat && (
              <div className="space-y-2">
                <Label htmlFor="date-format">Format de date</Label>
                <Select
                  value={preferences.regional.dateFormat}
                  onValueChange={(value) => handlePreferenceUpdate('regional.dateFormat', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                    <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}


          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer mes préférences'
          )}
        </Button>
      </div>
    </div>
  );
}
