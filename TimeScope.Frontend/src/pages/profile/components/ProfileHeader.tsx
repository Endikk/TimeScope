import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Camera } from 'lucide-react';

interface ProfileHeaderProps {
  user: any;
  onUploadPhoto: () => void;
}

export function ProfileHeader({ user, onUploadPhoto }: ProfileHeaderProps) {
  const getInitials = () => {
    if (!user) return 'TS';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeVariant = () => {
    if (!user) return 'secondary';
    switch (user.role) {
      case 'Admin':
        return 'destructive';
      case 'Manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="relative">
      {/* Bannière de couverture */}
      <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-lg" />

      {/* Photo de profil */}
      <div className="absolute -bottom-16 left-8 flex items-end gap-4">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-400 to-purple-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onUploadPhoto}
            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="pt-20 px-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={getRoleBadgeVariant() as any} className="text-sm">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                {user?.role}
              </Badge>
              {user?.department && (
                <Badge variant="outline" className="text-sm">
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline">
            Modifier le profil
          </Button>
        </div>
      </div>
    </div>
  );
}
