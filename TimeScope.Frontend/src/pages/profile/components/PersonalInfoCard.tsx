import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, Phone, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/lib/api/services/auth.service';

interface PersonalInfoCardProps {
  user: User | null;
  isEditing: boolean;
  onSave: (data: PersonalInfoData) => Promise<void>;
  onEdit: () => void;
}

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function PersonalInfoCard({ user, isEditing, onSave, onEdit }: PersonalInfoCardProps) {
  const [formData, setFormData] = useState<PersonalInfoData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setError('');
    setIsLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      });
    }
    setError('');
    onEdit();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de contact et détails personnels
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Prénom
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing || isLoading}
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Nom
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing || isLoading}
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing || isLoading}
            className={!isEditing ? 'bg-muted' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            disabled={!isEditing || isLoading}
            placeholder="+33 6 12 34 56 78"
            className={!isEditing ? 'bg-muted' : ''}
          />
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
