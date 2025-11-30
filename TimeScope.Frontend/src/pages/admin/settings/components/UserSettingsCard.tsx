import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Bell, Palette, Globe, Loader2 } from 'lucide-react';

interface UserSettings {
  profile?: {
    allowProfilePicture?: boolean;
    allowShowEmail?: boolean;
    allowShowPhone?: boolean;
  };
  notifications?: {
    allowEmailOnTaskAssign?: boolean;
    allowEmailOnTaskUpdate?: boolean;
    allowEmailOnMention?: boolean;
    allowDesktopNotifications?: boolean;
    allowSummaryFrequency?: boolean;
  };
  appearance?: {
    allowTheme?: boolean;
    allowColorScheme?: boolean;
    allowCompactView?: boolean;
    allowShowAvatars?: boolean;
  };
  regional?: {
    allowLanguage?: boolean;
    allowTimezone?: boolean;
    allowDateFormat?: boolean;
    allowTimeFormat?: boolean;
  };
}

interface UserSettingsCardProps {
  settings: UserSettings;
  onUpdate: (key: string, value: string | number | boolean) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function UserSettingsCard({ settings, onUpdate, onSave, saving }: UserSettingsCardProps) {
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
                Permettre aux employés d'afficher/masquer leur photo de profil
              </p>
            </div>
            <Switch
              id="allow-profile-picture"
              checked={settings?.profile?.allowProfilePicture ?? true}
              onCheckedChange={(checked) => onUpdate('profile.allowProfilePicture', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-show-email">Email visible</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de choisir d'afficher leur email
              </p>
            </div>
            <Switch
              id="allow-show-email"
              checked={settings?.profile?.allowShowEmail ?? true}
              onCheckedChange={(checked) => onUpdate('profile.allowShowEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-show-phone">Téléphone visible</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de choisir d'afficher leur téléphone
              </p>
            </div>
            <Switch
              id="allow-show-phone"
              checked={settings?.profile?.allowShowPhone ?? true}
              onCheckedChange={(checked) => onUpdate('profile.allowShowPhone', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Autorisations de Notifications
          </CardTitle>
          <CardDescription>
            Définissez quelles notifications les employés peuvent configurer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-email-on-task-assign">Email à l'assignation de tâche</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de configurer cette notification
              </p>
            </div>
            <Switch
              id="allow-email-on-task-assign"
              checked={settings?.notifications?.allowEmailOnTaskAssign ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.allowEmailOnTaskAssign', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-email-on-task-update">Email à la mise à jour de tâche</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de configurer cette notification
              </p>
            </div>
            <Switch
              id="allow-email-on-task-update"
              checked={settings?.notifications?.allowEmailOnTaskUpdate ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.allowEmailOnTaskUpdate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-email-on-mention">Email lors d'une mention</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de configurer cette notification
              </p>
            </div>
            <Switch
              id="allow-email-on-mention"
              checked={settings?.notifications?.allowEmailOnMention ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.allowEmailOnMention', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-desktop-notifications">Notifications bureau</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de configurer les notifications bureau
              </p>
            </div>
            <Switch
              id="allow-desktop-notifications"
              checked={settings?.notifications?.allowDesktopNotifications ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.allowDesktopNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-summary-frequency">Fréquence des résumés</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de choisir la fréquence des résumés
              </p>
            </div>
            <Switch
              id="allow-summary-frequency"
              checked={settings?.notifications?.allowSummaryFrequency ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.allowSummaryFrequency', checked)}
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
              <Label htmlFor="allow-theme">Thème</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer le thème (clair/sombre)
              </p>
            </div>
            <Switch
              id="allow-theme"
              checked={settings?.appearance?.allowTheme ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.allowTheme', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-color-scheme">Palette de couleurs</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer la palette de couleurs
              </p>
            </div>
            <Switch
              id="allow-color-scheme"
              checked={settings?.appearance?.allowColorScheme ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.allowColorScheme', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-compact-view">Vue compacte</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés d'activer la vue compacte
              </p>
            </div>
            <Switch
              id="allow-compact-view"
              checked={settings?.appearance?.allowCompactView ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.allowCompactView', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-show-avatars">Affichage des avatars</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de masquer/afficher les avatars
              </p>
            </div>
            <Switch
              id="allow-show-avatars"
              checked={settings?.appearance?.allowShowAvatars ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.allowShowAvatars', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences régionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Autorisations Régionales
          </CardTitle>
          <CardDescription>
            Définissez quelles préférences régionales les employés peuvent modifier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-language">Langue</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer la langue de l'interface
              </p>
            </div>
            <Switch
              id="allow-language"
              checked={settings?.regional?.allowLanguage ?? true}
              onCheckedChange={(checked) => onUpdate('regional.allowLanguage', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-timezone">Fuseau horaire</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer leur fuseau horaire
              </p>
            </div>
            <Switch
              id="allow-timezone"
              checked={settings?.regional?.allowTimezone ?? true}
              onCheckedChange={(checked) => onUpdate('regional.allowTimezone', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-date-format">Format de date</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer le format de date
              </p>
            </div>
            <Switch
              id="allow-date-format"
              checked={settings?.regional?.allowDateFormat ?? true}
              onCheckedChange={(checked) => onUpdate('regional.allowDateFormat', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-time-format">Format d'heure</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer le format d'heure
              </p>
            </div>
            <Switch
              id="allow-time-format"
              checked={settings?.regional?.allowTimeFormat ?? true}
              onCheckedChange={(checked) => onUpdate('regional.allowTimeFormat', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto"
          onClick={onSave}
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
