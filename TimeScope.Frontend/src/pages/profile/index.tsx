import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from './components/ProfileHeader';
import { PersonalInfoCard, PersonalInfoData } from './components/PersonalInfoCard';
import { ProfessionalInfoCard } from './components/ProfessionalInfoCard';
import { ActivityStatsCard } from './components/ActivityStatsCard';
import { profileApiService, UserStatsResponse } from '@/lib/api/services/profile.service';
import { tokenStorage, User } from '@/lib/api/services/auth.service';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [activityStats, setActivityStats] = useState<UserStatsResponse>({
    tasksCompleted: 0,
    tasksInProgress: 0,
    totalHours: 0,
    projectsCount: 0,
  });

  // Chargement des données utilisateur fraîches et des statistiques au montage
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser?.id) return;

      try {
        // Chargement des données utilisateur depuis l'API
        const freshUserData = await profileApiService.getUserProfile(authUser.id);
        setUser(freshUserData);

        // Mise à jour du localStorage avec les données fraîches
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          freshUserData
        );

        // Chargement des statistiques utilisateur
        const stats = await profileApiService.getUserStats(authUser.id);
        setActivityStats(stats);
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Repli sur l'utilisateur du contexte d'auth si l'API échoue
        setUser(authUser);
      }
    };

    loadUserData();
  }, [authUser?.id, authUser]);

  const handleUploadPhoto = async () => {
    if (!user?.id) return;

    // Création de l'input file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validation de la taille du fichier (max 5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5 Mo');
        return;
      }

      try {
        const updatedUser = await profileApiService.uploadAvatar(user.id, file);

        // Mise à jour de l'utilisateur dans le localStorage
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          updatedUser
        );

        alert('Photo de profil mise à jour avec succès');
        // Rechargement de la page pour rafraîchir le contexte utilisateur
        window.location.reload();
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        alert('Erreur lors du téléchargement de la photo');
      }
    };

    input.click();
  };

  const handleUploadBanner = async () => {
    if (!user?.id) return;

    // Création de l'input file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validation de la taille du fichier (max 10 Mo pour les bannières)
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 10 Mo');
        return;
      }

      try {
        const updatedUser = await profileApiService.uploadBanner(user.id, file);

        // Mise à jour de l'utilisateur dans le localStorage
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          updatedUser
        );

        alert('Bannière mise à jour avec succès');
        // Rechargement de la page pour rafraîchir le contexte utilisateur
        window.location.reload();
      } catch (error) {
        console.error('Failed to upload banner:', error);
        alert('Erreur lors du téléchargement de la bannière');
      }
    };

    input.click();
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) return;

    try {
      const updatedUser = await profileApiService.deleteAvatar(user.id);

      // Mise à jour de l'utilisateur dans le localStorage
      tokenStorage.save(
        tokenStorage.getToken() || '',
        tokenStorage.getRefreshToken() || '',
        updatedUser
      );

      alert('Photo de profil supprimée avec succès');
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      alert('Erreur lors de la suppression de la photo');
    }
  };

  const handleDeleteBanner = async () => {
    if (!user?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre bannière ?')) return;

    try {
      const updatedUser = await profileApiService.deleteBanner(user.id);

      // Mise à jour de l'utilisateur dans le localStorage
      tokenStorage.save(
        tokenStorage.getToken() || '',
        tokenStorage.getRefreshToken() || '',
        updatedUser
      );

      alert('Bannière supprimée avec succès');
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Erreur lors de la suppression de la bannière');
    }
  };

  const handleSavePersonalInfo = async (data: PersonalInfoData) => {
    if (!user?.id) {
      throw new Error('User not found');
    }

    try {
      const updatedUser = await profileApiService.updateProfile(user.id, data);

      // Mise à jour de l'utilisateur dans le localStorage
      tokenStorage.save(
        tokenStorage.getToken() || '',
        tokenStorage.getRefreshToken() || '',
        updatedUser
      );

      setIsEditingPersonalInfo(false);
      alert('Informations mises à jour avec succès');

      // Rechargement de la page pour rafraîchir le contexte utilisateur
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* En-tête de profil */}
        {user && (
          <motion.div variants={itemVariants} className="mb-8">
            <ProfileHeader
              user={user}
              onUploadPhoto={handleUploadPhoto}
              onUploadBanner={handleUploadBanner}
              onDeletePhoto={handleDeletePhoto}
              onDeleteBanner={handleDeleteBanner}
            />
          </motion.div>
        )}

        {/* Grille de contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-8">
          {/* Colonne gauche - S'étend sur 2 colonnes sur les grands écrans */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants}>
              <PersonalInfoCard
                user={user}
                isEditing={isEditingPersonalInfo}
                onSave={handleSavePersonalInfo}
                onEdit={handleEditPersonalInfo}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ProfessionalInfoCard user={user} />
            </motion.div>
          </div>

          {/* Colonne droite - S'étend sur 1 colonne sur les grands écrans */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div variants={itemVariants}>
              <ActivityStatsCard stats={activityStats} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
