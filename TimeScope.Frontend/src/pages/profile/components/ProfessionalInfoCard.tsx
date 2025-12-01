import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, CalendarDays, Award } from 'lucide-react';
import { User } from '@/lib/api/services/auth.service';

interface ProfessionalInfoCardProps {
  user: User | null;
}

export function ProfessionalInfoCard({ user }: ProfessionalInfoCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseignée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Non renseignée';
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'destructive';
      case 'Manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Informations Professionnelles
        </CardTitle>
        <CardDescription>
          Détails de votre poste et activité dans l'entreprise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Poste
            </Label>
            <p className="text-lg font-semibold">
              {user?.jobTitle || <span className="text-muted-foreground">Non renseigné</span>}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              Département
            </Label>
            <p className="text-lg font-semibold">
              {user?.department || <span className="text-muted-foreground">Non renseigné</span>}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              Rôle
            </Label>
            <div>
              <Badge variant={getRoleBadgeVariant(user?.role)}>
                {user?.role || 'Employee'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Date d'embauche
            </Label>
            <p className="text-lg font-semibold">
              {formatDate(user?.hireDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
