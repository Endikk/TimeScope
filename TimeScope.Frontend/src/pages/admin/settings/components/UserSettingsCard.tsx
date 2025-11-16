import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Bell, Palette, Globe } from 'lucide-react';

interface UserSettingsCardProps {
  settings: any;
  onUpdate: (key: string, value: any) => void;
}

export function UserSettingsCard({ settings, onUpdate }: UserSettingsCardProps) {
  return (
    <div className="space-y-6">
      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Paramètres de Profil
          </CardTitle>
          <CardDescription>
            Paramètres modifiables par chaque employé pour personnaliser son expérience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-profile-picture">Afficher la photo de profil</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés d'afficher leur photo de profil
              </p>
            </div>
            <Switch
              id="show-profile-picture"
              checked={settings?.profile?.showProfilePicture ?? true}
              onCheckedChange={(checked) => onUpdate('profile.showProfilePicture', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-email">Email visible</Label>
              <p className="text-sm text-muted-foreground">
                Afficher l'email dans le profil public
              </p>
            </div>
            <Switch
              id="show-email"
              checked={settings?.profile?.showEmail ?? false}
              onCheckedChange={(checked) => onUpdate('profile.showEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-phone">Téléphone visible</Label>
              <p className="text-sm text-muted-foreground">
                Afficher le numéro de téléphone dans le profil
              </p>
            </div>
            <Switch
              id="show-phone"
              checked={settings?.profile?.showPhone ?? false}
              onCheckedChange={(checked) => onUpdate('profile.showPhone', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications Personnelles
          </CardTitle>
          <CardDescription>
            Configuration des notifications individuelles pour chaque employé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-on-task-assign">Email à l'assignation de tâche</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email quand une tâche vous est assignée
              </p>
            </div>
            <Switch
              id="email-on-task-assign"
              checked={settings?.notifications?.emailOnTaskAssign ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.emailOnTaskAssign', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-on-task-update">Email à la mise à jour de tâche</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email quand une tâche est modifiée
              </p>
            </div>
            <Switch
              id="email-on-task-update"
              checked={settings?.notifications?.emailOnTaskUpdate ?? false}
              onCheckedChange={(checked) => onUpdate('notifications.emailOnTaskUpdate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-on-mention">Email lors d'une mention</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un email quand vous êtes mentionné dans un commentaire
              </p>
            </div>
            <Switch
              id="email-on-mention"
              checked={settings?.notifications?.emailOnMention ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.emailOnMention', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications">Notifications bureau</Label>
              <p className="text-sm text-muted-foreground">
                Afficher des notifications de bureau pour les événements importants
              </p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={settings?.notifications?.desktopNotifications ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.desktopNotifications', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-frequency">Fréquence des résumés</Label>
            <Select
              value={settings?.notifications?.summaryFrequency ?? 'daily'}
              onValueChange={(value) => onUpdate('notifications.summaryFrequency', value)}
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
            <p className="text-sm text-muted-foreground">
              Fréquence d'envoi des résumés d'activité par email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Apparence et Interface
          </CardTitle>
          <CardDescription>
            Personnalisation de l'interface utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Thème</Label>
            <Select
              value={settings?.appearance?.theme ?? 'light'}
              onValueChange={(value) => onUpdate('appearance.theme', value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Sélectionner un thème" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="auto">Automatique</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choisir le thème de couleur de l'application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-scheme">Palette de couleurs</Label>
            <Select
              value={settings?.appearance?.colorScheme ?? 'blue'}
              onValueChange={(value) => onUpdate('appearance.colorScheme', value)}
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-view">Vue compacte</Label>
              <p className="text-sm text-muted-foreground">
                Réduire l'espacement pour afficher plus d'informations
              </p>
            </div>
            <Switch
              id="compact-view"
              checked={settings?.appearance?.compactView ?? false}
              onCheckedChange={(checked) => onUpdate('appearance.compactView', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-avatars">Afficher les avatars</Label>
              <p className="text-sm text-muted-foreground">
                Afficher les photos de profil dans les listes
              </p>
            </div>
            <Switch
              id="show-avatars"
              checked={settings?.appearance?.showAvatars ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.showAvatars', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences régionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Préférences Régionales
          </CardTitle>
          <CardDescription>
            Configuration de la langue et du fuseau horaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select
              value={settings?.regional?.language ?? 'fr'}
              onValueChange={(value) => onUpdate('regional.language', value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select
              value={settings?.regional?.timezone ?? 'Europe/Paris'}
              onValueChange={(value) => onUpdate('regional.timezone', value)}
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

          <div className="space-y-2">
            <Label htmlFor="date-format">Format de date</Label>
            <Select
              value={settings?.regional?.dateFormat ?? 'DD/MM/YYYY'}
              onValueChange={(value) => onUpdate('regional.dateFormat', value)}
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

          <div className="space-y-2">
            <Label htmlFor="time-format">Format d'heure</Label>
            <Select
              value={settings?.regional?.timeFormat ?? '24h'}
              onValueChange={(value) => onUpdate('regional.timeFormat', value)}
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="w-full md:w-auto">
          Enregistrer mes préférences
        </Button>
      </div>
    </div>
  );
}
