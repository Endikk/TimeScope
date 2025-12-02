import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Key, Mail } from 'lucide-react';
import { useState } from 'react';

interface SecurityCardProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  onEmailChange: (newEmail: string) => Promise<void>;
  currentEmail?: string;
}

export function SecurityCard({ onPasswordChange, onEmailChange, currentEmail }: SecurityCardProps) {
  // Password state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Email state
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Tous les champs sont requis');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await onPasswordChange(currentPassword, newPassword);

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEmailChange = async () => {
    setEmailError('');

    // Validation
    if (!newEmail || !confirmEmail) {
      setEmailError('Tous les champs sont requis');
      return;
    }

    if (newEmail !== confirmEmail) {
      setEmailError('Les adresses email ne correspondent pas');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Adresse email invalide');
      return;
    }

    setIsEmailLoading(true);
    try {
      await onEmailChange(newEmail);

      // Reset form
      setNewEmail('');
      setConfirmEmail('');
      setShowEmailFields(false);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Erreur lors du changement d'email");
    } finally {
      setIsEmailLoading(false);
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
        {/* Changement d'email */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Adresse Email
              </Label>
              <p className="text-sm text-muted-foreground">
                {currentEmail ? `Actuellement : ${currentEmail}` : 'Modifiez votre adresse email'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowEmailFields(!showEmailFields);
                setEmailError('');
                setNewEmail('');
                setConfirmEmail('');
              }}
            >
              {showEmailFields ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {showEmailFields && (
            <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
              {emailError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {emailError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-email">Nouvel email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isEmailLoading}
                  placeholder="exemple@domaine.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-email">Confirmer l'email</Label>
                <Input
                  id="confirm-email"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  disabled={isEmailLoading}
                  placeholder="exemple@domaine.com"
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleEmailChange}
                disabled={isEmailLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isEmailLoading ? 'Mise à jour...' : "Mettre à jour l'email"}
              </Button>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
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
                  setPasswordError('');
                }}
              >
                {showPasswordFields ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                {passwordError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {passwordError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isPasswordLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPasswordLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPasswordLoading}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handlePasswordChange}
                  disabled={isPasswordLoading}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isPasswordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
