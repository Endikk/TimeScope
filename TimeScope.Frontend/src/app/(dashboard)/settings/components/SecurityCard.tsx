import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Key, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

interface SecurityCardProps {
    onPasswordChange: (current: string, newPass: string) => Promise<void>;
    currentEmail?: string;
}

export function SecurityCard({ onPasswordChange, currentEmail }: SecurityCardProps) {
    // Password state
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
                {/* Email Display (Read Only) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Adresse Email
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {currentEmail || 'Non définie'}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        L'adresse email ne peut pas être modifiée ici. Contactez votre administrateur si nécessaire.
                    </p>
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
