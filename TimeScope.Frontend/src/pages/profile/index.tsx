import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from './components/ProfileHeader';
import { PersonalInfoCard, PersonalInfoData } from './components/PersonalInfoCard';
import { ProfessionalInfoCard } from './components/ProfessionalInfoCard';
import { ActivityStatsCard } from './components/ActivityStatsCard';
import { SecurityCard } from './components/SecurityCard';
import { UserPreferencesCard } from './components/UserPreferencesCard';
import { profileApiService, UserStatsResponse } from '@/lib/api/services/profile.service';
import { tokenStorage } from '@/lib/api/services/auth.service';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(authUser);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [activityStats, setActivityStats] = useState<UserStatsResponse>({
    tasksCompleted: 0,
    tasksInProgress: 0,
    totalHours: 0,
    projectsCount: 0,
  });

  // Load fresh user data and statistics on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser?.id) return;

      try {
        // Load fresh user data from API
        const freshUserData = await profileApiService.getUserProfile(authUser.id);
        setUser(freshUserData);

        // Update localStorage with fresh data
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          freshUserData
        );

        // Load user stats
        const stats = await profileApiService.getUserStats(authUser.id);
        setActivityStats(stats);
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fall back to auth context user if API fails
        setUser(authUser);
      }
    };

    loadUserData();
  }, [authUser?.id]);

  const handleUploadPhoto = async () => {
    if (!user?.id) return;

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5 Mo');
        return;
      }

      try {
        const updatedUser = await profileApiService.uploadAvatar(user.id, file);

        // Update user in localStorage
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          updatedUser
        );

        alert('Photo de profil mise à jour avec succès');
        // Reload page to refresh user context
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

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 10MB for banners)
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 10 Mo');
        return;
      }

      try {
        const updatedUser = await profileApiService.uploadBanner(user.id, file);

        // Update user in localStorage
        tokenStorage.save(
          tokenStorage.getToken() || '',
          tokenStorage.getRefreshToken() || '',
          updatedUser
        );

        alert('Bannière mise à jour avec succès');
        // Reload page to refresh user context
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

      // Update user in localStorage
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

      // Update user in localStorage
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

      // Update user in localStorage
      tokenStorage.save(
        tokenStorage.getToken() || '',
        tokenStorage.getRefreshToken() || '',
        updatedUser
      );

      setIsEditingPersonalInfo(false);
      alert('Informations mises à jour avec succès');

      // Reload page to refresh user context
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!user?.id) {
      throw new Error('User not found');
    }

    try {
      await profileApiService.changePassword(user.id, {
        currentPassword,
        newPassword,
      });

      alert('Mot de passe changé avec succès');
    } catch (error: any) {
      if (error?.response?.status === 401) {
        throw new Error('Mot de passe actuel incorrect');
      }
      throw new Error(error?.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow-sm mb-8">
          <ProfileHeader
            user={user}
            onUploadPhoto={handleUploadPhoto}
            onUploadBanner={handleUploadBanner}
            onDeletePhoto={handleDeletePhoto}
            onDeleteBanner={handleDeleteBanner}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-8">
          {/* Left Column - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard
              user={user}
              isEditing={isEditingPersonalInfo}
              onSave={handleSavePersonalInfo}
              onEdit={handleEditPersonalInfo}
            />
            <ProfessionalInfoCard user={user} />
            <SecurityCard
              onPasswordChange={handlePasswordChange}
            />
            <UserPreferencesCard />
          </div>

          {/* Right Column - Spans 1 column on large screens */}
          <div className="lg:col-span-1 space-y-6">
            <ActivityStatsCard stats={activityStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
