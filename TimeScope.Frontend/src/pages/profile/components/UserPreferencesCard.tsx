import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Palette, Globe, Loader2, AlertCircle } from 'lucide-react';
import { settingsService, AppSetting } from '@/lib/api/services/settings.service';
import { toast } from 'sonner';

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
    allowTheme: boolean;
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
    theme: string;
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
    allowTheme: true,
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
};

export function UserPreferencesCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Autorisations définies par l'admin
  const [allowedSettings, setAllowedSettings] = useState<AllowedSettings>(DEFAULT_ALLOWED_SETTINGS);

  // Préférences de l'utilisateur
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await settingsService.getAllSettings();

      const newAllowed = { ...DEFAULT_ALLOWED_SETTINGS };
      const newPrefs = { ...DEFAULT_PREFERENCES };

      settings.forEach((setting: AppSetting) => {
        const keys = setting.key.split('.');
        let value: string | number | boolean = setting.value;

        // Convertir la valeur selon le type
        if (setting.dataType === 'boolean') {
          value = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          value = parseInt(setting.value, 10);
        }

        // Charger les autorisations (allowed.*)
        if (keys[0] === 'allowed' && keys.length >= 3) {
          const category = keys[1] as keyof AllowedSettings;
          const field = keys[2];
          if (newAllowed[category]) {
            (newAllowed[category] as Record<string, boolean>)[field] = value as boolean;
          }
        }
        // Charger les préférences utilisateur (userPref.*)
        else if (keys[0] === 'userPref' && keys.length >= 3) {
          const category = keys[1] as keyof UserPreferences;
          const field = keys[2];
          if (newPrefs[category]) {
            (newPrefs[category] as Record<string, string | number | boolean>)[field] = value;
          }
        }
      });

      setAllowedSettings(newAllowed);
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePreferenceUpdate = (key: string, value: string | number | boolean) => {
    const keys = key.split('.');
    setPreferences(prev => {
      const newPrefs = { ...prev };
      let current: Record<string, any> = newPrefs;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const savePreferences = async () => {
    try {
      setSaving(true);

      const existingSettings = await settingsService.getAllSettings({ category: 'userPref' });
      const existingKeys = new Set(existingSettings.map(s => s.key));

      const settingsToSave: { key: string; value: string; category: string; dataType: string; isPublic: boolean }[] = [];

      Object.entries(preferences).forEach(([category, values]) => {
        Object.entries(values as Record<string, string | number | boolean>).forEach(([field, value]) => {
          const key = `userPref.${category}.${field}`;
          const dataType = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
          settingsToSave.push({
            key,
            value: String(value),
            category: 'userPref',
            dataType,
            isPublic: false
          });
        });
      });

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
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (noOptionsAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
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
              <Settings className="h-5 w-5 text-primary" />
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
                  <p className="text-sm text-muted-foreground">
                    Afficher votre email dans le profil public
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Afficher votre numéro dans le profil
                  </p>
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

      {/* Notifications */}
      {hasAnyAllowed('notifications') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {allowedSettings.notifications.allowEmailOnTaskAssign && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-on-task-assign">Email à l'assignation</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un email quand une tâche vous est assignée
                  </p>
                </div>
                <Switch
                  id="email-on-task-assign"
                  checked={preferences.notifications.emailOnTaskAssign}
                  onCheckedChange={(checked) => handlePreferenceUpdate('notifications.emailOnTaskAssign', checked)}
                />
              </div>
            )}

            {allowedSettings.notifications.allowEmailOnTaskUpdate && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-on-task-update">Email à la mise à jour</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un email quand une tâche est modifiée
                  </p>
                </div>
                <Switch
                  id="email-on-task-update"
                  checked={preferences.notifications.emailOnTaskUpdate}
                  onCheckedChange={(checked) => handlePreferenceUpdate('notifications.emailOnTaskUpdate', checked)}
                />
              </div>
            )}

            {allowedSettings.notifications.allowEmailOnMention && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-on-mention">Email lors d'une mention</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un email quand vous êtes mentionné
                  </p>
                </div>
                <Switch
                  id="email-on-mention"
                  checked={preferences.notifications.emailOnMention}
                  onCheckedChange={(checked) => handlePreferenceUpdate('notifications.emailOnMention', checked)}
                />
              </div>
            )}

            {allowedSettings.notifications.allowDesktopNotifications && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop-notifications">Notifications bureau</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher des notifications de bureau
                  </p>
                </div>
                <Switch
                  id="desktop-notifications"
                  checked={preferences.notifications.desktopNotifications}
                  onCheckedChange={(checked) => handlePreferenceUpdate('notifications.desktopNotifications', checked)}
                />
              </div>
            )}

            {allowedSettings.notifications.allowSummaryFrequency && (
              <div className="space-y-2">
                <Label htmlFor="summary-frequency">Fréquence des résumés</Label>
                <Select
                  value={preferences.notifications.summaryFrequency}
                  onValueChange={(value) => handlePreferenceUpdate('notifications.summaryFrequency', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
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
              <Palette className="h-5 w-5 text-primary" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {allowedSettings.appearance.allowTheme && (
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select
                  value={preferences.appearance.theme}
                  onValueChange={(value) => handlePreferenceUpdate('appearance.theme', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {allowedSettings.appearance.allowShowAvatars && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-avatars">Afficher les avatars</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les photos de profil dans les listes
                  </p>
                </div>
                <Switch
                  id="show-avatars"
                  checked={preferences.appearance.showAvatars}
                  onCheckedChange={(checked) => handlePreferenceUpdate('appearance.showAvatars', checked)}
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
              <Globe className="h-5 w-5 text-primary" />
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

            {allowedSettings.regional.allowTimezone && (
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select
                  value={preferences.regional.timezone}
                  onValueChange={(value) => handlePreferenceUpdate('regional.timezone', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                    <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Angeles (UTC-8)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
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

            {allowedSettings.regional.allowTimeFormat && (
              <div className="space-y-2">
                <Label htmlFor="time-format">Format d'heure</Label>
                <Select
                  value={preferences.regional.timeFormat}
                  onValueChange={(value) => handlePreferenceUpdate('regional.timeFormat', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 heures</SelectItem>
                    <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
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
          className="w-full md:w-auto"
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
