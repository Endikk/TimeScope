import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Users, CalendarDays, Clock } from 'lucide-react';

interface ProfessionalInfoCardProps {
  user: any;
}

export function ProfessionalInfoCard({ user }: ProfessionalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
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
            <p className="text-lg font-semibold">{user?.jobTitle || 'Développeur Full Stack'}</p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              Département
            </Label>
            <p className="text-lg font-semibold">{user?.department || 'Développement'}</p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Manager
            </Label>
            <p className="text-lg font-semibold">{user?.manager || 'Jean Dupont'}</p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Date d'embauche
            </Label>
            <p className="text-lg font-semibold">
              {user?.hireDate ? new Date(user.hireDate).toLocaleDateString('fr-FR') : '01/01/2023'}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            Compétences
          </Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Node.js</Badge>
            <Badge variant="secondary">PostgreSQL</Badge>
            <Badge variant="secondary">Git</Badge>
            <Badge variant="secondary">Agile/Scrum</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
