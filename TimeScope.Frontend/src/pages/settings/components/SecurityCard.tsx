import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Key, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface SecurityCardProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function SecurityCard({ onPasswordChange }: SecurityCardProps) {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    setError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await onPasswordChange(currentPassword, newPassword);

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Sécurité et Confidentialité
        </CardTitle>
        <CardDescription>
          Gérez vos paramètres de sécurité et de confidentialité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Changement de mot de passe */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Mot de passe
              </Label>
              <p className="text-sm text-muted-foreground">
                Modifiez votre mot de passe
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPasswordFields(!showPasswordFields);
                setError('');
              }}
            >
              {showPasswordFields ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {showPasswordFields && (
            <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handlePasswordChange}
                disabled={isLoading}
              >
                <Key className="h-4 w-4 mr-2" />
                {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                Authentification à deux facteurs
              </Label>
              <p className="text-sm text-muted-foreground">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </p>
            </div>
            <Switch id="two-factor" disabled />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
