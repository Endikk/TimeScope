import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Camera, ImageIcon, Trash2, Mail, MapPin } from 'lucide-react';
import { User } from '@/lib/api/services/auth.service';
import { motion } from 'framer-motion';

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
    <div className="relative bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
      {/* Bannière de couverture */}
      <div className="relative group h-64 w-full overflow-hidden">
        {user?.banner ? (
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.banner})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 animate-gradient-xy" />
        )}

        {/* Overlay gradient pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Actions Bannière */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
          <Button
            variant="secondary"
            size="icon"
            onClick={onUploadBanner}
            className="h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm transition-all hover:scale-105"
            title="Changer la bannière"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          {user?.banner && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onDeleteBanner}
              className="h-9 w-9 rounded-full bg-red-500/80 hover:bg-red-600 text-white border-none backdrop-blur-sm transition-all hover:scale-105"
              title="Supprimer la bannière"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contenu Profil */}
      <div className="px-8 pb-8">
        <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-6">

          {/* Avatar avec animation et actions */}
          <div className="relative group">
            {/* Cercle décoratif animé derrière l'avatar */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />

            <div className="relative rounded-full overflow-hidden border-4 border-background shadow-2xl ring-2 ring-background/50 h-32 w-32 md:h-40 md:w-40 bg-background">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={user?.avatar}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 text-white h-full w-full flex items-center justify-center">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {/* Overlay sombre au survol */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                {/* Actions Avatar - Centré avec animation */}
                <div className="flex gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  <Button
                    size="icon"
                    onClick={onUploadPhoto}
                    className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 text-white border border-white/50 shadow-lg backdrop-blur-md transition-transform hover:scale-110"
                    title="Changer la photo"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  {user?.avatar && (
                    <Button
                      size="icon"
                      onClick={onDeletePhoto}
                      className="h-10 w-10 rounded-full bg-red-500/80 hover:bg-red-600/90 text-white border border-white/20 shadow-lg backdrop-blur-md transition-transform hover:scale-110"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations Principales */}
          <div className="flex-1 pt-2 md:pt-0 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-foreground/80">{user?.role}</span>
                  </div>
                  <span className="hidden md:inline text-border">•</span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.department && (
                    <>
                      <span className="hidden md:inline text-border">•</span>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{user.department}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant={getRoleBadgeVariant()} className="px-3 py-1 text-sm shadow-sm">
                  {user?.role}
                </Badge>
                {user?.department && (
                  <Badge variant="outline" className="px-3 py-1 text-sm bg-background/50 backdrop-blur-sm">
                    {user.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
