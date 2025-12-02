import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Informations Professionnelles</CardTitle>
            <CardDescription className="mt-1.5">
              Détails de votre poste et activité dans l'entreprise
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-1 gap-4">
          {/* Section Principale: Poste & Département */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 p-5 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase className="h-24 w-24 text-blue-600 dark:text-blue-400 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <div className="relative z-10">
                <div className="mb-3 inline-flex p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">Poste Actuel</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {user?.jobTitle || 'Non renseigné'}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30 p-5 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building className="h-24 w-24 text-purple-600 dark:text-purple-400 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <div className="relative z-10">
                <div className="mb-3 inline-flex p-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Building className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-purple-600/80 dark:text-purple-400/80 uppercase tracking-wider">Département</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {user?.department || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

          {/* Section Secondaire: Rôle & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rôle & Permissions</p>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user?.role)} className="px-2.5 py-0.5">
                      {user?.role || 'Employee'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'embauche</p>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {formatDate(user?.hireDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
