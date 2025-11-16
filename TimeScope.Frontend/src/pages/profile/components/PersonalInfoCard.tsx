import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Calendar, Save } from 'lucide-react';

interface PersonalInfoCardProps {
  user: any;
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
}

export function PersonalInfoCard({ user, isEditing, onSave, onEdit }: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Prénom
            </Label>
            <Input
              id="firstName"
              defaultValue={user?.firstName}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nom
            </Label>
            <Input
              id="lastName"
              defaultValue={user?.lastName}
              disabled={!isEditing}
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
            defaultValue={user?.email}
            disabled={!isEditing}
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
            defaultValue={user?.phone || '+33 6 12 34 56 78'}
            disabled={!isEditing}
            className={!isEditing ? 'bg-muted' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Adresse
          </Label>
          <Input
            id="address"
            defaultValue={user?.address || '123 Rue de la Paix, 75001 Paris'}
            disabled={!isEditing}
            className={!isEditing ? 'bg-muted' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date de naissance
          </Label>
          <Input
            id="birthdate"
            type="date"
            defaultValue={user?.birthdate || '1990-01-01'}
            disabled={!isEditing}
            className={!isEditing ? 'bg-muted' : ''}
          />
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onEdit()}>
              Annuler
            </Button>
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
