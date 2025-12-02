import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Palette, Loader2 } from 'lucide-react';

interface UserSettings {
  profile?: {
    allowProfilePicture?: boolean;
    allowBanner?: boolean;
  };
  appearance?: {

    allowCompactView?: boolean;
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
                Permettre aux employés de changer leur photo de profil (avatar)
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
              <Label htmlFor="allow-banner">Bannière de profil</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux employés de changer leur bannière de profil
              </p>
            </div>
            <Switch
              id="allow-banner"
              checked={settings?.profile?.allowBanner ?? true}
              onCheckedChange={(checked) => onUpdate('profile.allowBanner', checked)}
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
              checked={settings?.appearance?.allowCompactView ?? true}
              onCheckedChange={(checked) => onUpdate('appearance.allowCompactView', checked)}
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
