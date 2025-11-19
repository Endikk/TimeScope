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
  const { user } = useAuth();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [activityStats, setActivityStats] = useState<UserStatsResponse>({
    tasksCompleted: 0,
    tasksInProgress: 0,
    totalHours: 0,
    projectsCount: 0,
  });

  // Load user statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      try {
        const stats = await profileApiService.getUserStats(user.id);
        setActivityStats(stats);
      } catch (error) {
        console.error('Failed to load user stats:', error);
        // Keep default stats (0) on error
      }
    };

    loadStats();
  }, [user?.id]);

  const handleUploadPhoto = async () => {
    if (!user?.id) return;

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await profileApiService.uploadAvatar(user.id, file);
        alert('Photo de profil mise à jour avec succès');
        // TODO: Refresh user data in context
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        alert('Erreur lors du téléchargement de la photo');
      }
    };

    input.click();
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
          <ProfileHeader user={user} onUploadPhoto={handleUploadPhoto} />
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
