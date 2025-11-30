import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Camera, ImageIcon, Trash2 } from 'lucide-react';
import { User } from '@/lib/api/services/auth.service';

interface ProfileHeaderProps {
  user: User;
  onUploadPhoto: () => void;
  onUploadBanner: () => void;
  onDeletePhoto: () => void;
  onDeleteBanner: () => void;
}

export function ProfileHeader({ user, onUploadPhoto, onUploadBanner, onDeletePhoto, onDeleteBanner }: ProfileHeaderProps) {
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
      <div className="relative group">
        {user?.banner ? (
          <div
            className="h-48 rounded-t-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${user.banner})` }}
          />
        ) : (
          <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-lg" />
        )}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onUploadBanner}
            className="p-2 bg-black/50 text-white rounded-full shadow-lg hover:bg-black/70"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          {user?.banner && (
            <button
              onClick={onDeleteBanner}
              className="p-2 bg-red-500/80 text-white rounded-full shadow-lg hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Espace entre la bannière et le contenu */}
      <div className="h-6" />

      {/* Photo de profil - positionnée sur la bannière */}
      <div className="absolute top-32 left-8">
        <div className="relative group">
          {/* Fond blanc derrière la photo */}
          <div className="absolute -inset-2 bg-white rounded-full" />
          <Avatar className="relative h-36 w-36 border-4 border-background shadow-xl">
            <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-400 to-purple-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={onUploadPhoto}
              className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transform"
            >
              <Camera className="h-4 w-4" />
            </button>
            {user?.avatar && (
              <button
                onClick={onDeletePhoto}
                className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-105 transform"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="pt-16 pl-52 pr-8 pb-6">
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
      </div>
    </div>
  );
}
