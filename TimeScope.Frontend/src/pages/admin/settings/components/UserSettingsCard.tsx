import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Palette, Loader2, Clock, Briefcase } from 'lucide-react';
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
  time: {
    allowFutureEntries: boolean;
    allowModifyingPastEntries: boolean;
    allowDeleteTimeEntries: boolean;
  };
  projects: {
    allowEmployeeCreate: boolean;
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
    time: {
      allowFutureEntries: true,
      allowModifyingPastEntries: true,
      allowDeleteTimeEntries: true,
    },
    projects: {
      allowEmployeeCreate: false,
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

      // Time settings
      const allowFutureEntries = allSettings.find(s => s.key === 'time.allowFutureEntries');
      if (allowFutureEntries) newSettings.time.allowFutureEntries = allowFutureEntries.value === 'true';

      const allowModifyingPastEntries = allSettings.find(s => s.key === 'time.allowModifyingPastEntries');
      if (allowModifyingPastEntries) newSettings.time.allowModifyingPastEntries = allowModifyingPastEntries.value === 'true';

      const allowDeleteTimeEntries = allSettings.find(s => s.key === 'time.allowDeleteTimeEntries');
      if (allowDeleteTimeEntries) newSettings.time.allowDeleteTimeEntries = allowDeleteTimeEntries.value === 'true';

      // Project settings
      const allowEmployeeCreate = allSettings.find(s => s.key === 'projects.allowEmployeeCreate');
      if (allowEmployeeCreate) newSettings.projects.allowEmployeeCreate = allowEmployeeCreate.value === 'true';

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
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Profile
      await saveOrUpdateSetting('profile.allowProfilePicture', settings.profile.allowProfilePicture.toString(), 'profile', 'Allow users to change their profile picture');
      await saveOrUpdateSetting('profile.allowBanner', settings.profile.allowBanner.toString(), 'profile', 'Allow users to change their profile banner');

      // Appearance
      await saveOrUpdateSetting('appearance.allowCompactView', settings.appearance.allowCompactView.toString(), 'appearance', 'Allow users to use compact view');

      // Time
      await saveOrUpdateSetting('time.allowFutureEntries', settings.time.allowFutureEntries.toString(), 'time', 'Allow users to log time in the future');
      await saveOrUpdateSetting('time.allowModifyingPastEntries', settings.time.allowModifyingPastEntries.toString(), 'time', 'Allow users to modify past time entries');
      await saveOrUpdateSetting('time.allowDeleteTimeEntries', settings.time.allowDeleteTimeEntries.toString(), 'time', 'Allow users to delete time entries');

      // Projects
      await saveOrUpdateSetting('projects.allowEmployeeCreate', settings.projects.allowEmployeeCreate.toString(), 'projects', 'Allow employees to create projects');

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

      {/* Suivi du Temps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Suivi du Temps
          </CardTitle>
          <CardDescription>
            Règles pour la saisie et la modification des temps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-future">Saisie dans le futur</Label>
              <p className="text-sm text-muted-foreground">
                Autoriser la saisie de temps pour des dates futures
              </p>
            </div>
            <Switch
              id="allow-future"
              checked={settings.time.allowFutureEntries}
              onCheckedChange={(checked) => handleUpdate('time', 'allowFutureEntries', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-past">Modification du passé</Label>
              <p className="text-sm text-muted-foreground">
                Autoriser la modification des entrées de temps passées
              </p>
            </div>
            <Switch
              id="allow-past"
              checked={settings.time.allowModifyingPastEntries}
              onCheckedChange={(checked) => handleUpdate('time', 'allowModifyingPastEntries', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-delete">Suppression d'entrées</Label>
              <p className="text-sm text-muted-foreground">
                Autoriser la suppression des entrées de temps
              </p>
            </div>
            <Switch
              id="allow-delete"
              checked={settings.time.allowDeleteTimeEntries}
              onCheckedChange={(checked) => handleUpdate('time', 'allowDeleteTimeEntries', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Projets et Tâches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Projets et Tâches
          </CardTitle>
          <CardDescription>
            Permissions pour la création de projets et tâches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-projects">Création de projets</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de créer de nouveaux projets
              </p>
            </div>
            <Switch
              id="allow-projects"
              checked={settings.projects.allowEmployeeCreate}
              onCheckedChange={(checked) => handleUpdate('projects', 'allowEmployeeCreate', checked)}
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
