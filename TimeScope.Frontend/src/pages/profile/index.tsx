import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from './components/ProfileHeader';
import { PersonalInfoCard } from './components/PersonalInfoCard';
import { ProfessionalInfoCard } from './components/ProfessionalInfoCard';
import { ActivityStatsCard } from './components/ActivityStatsCard';
import { SecurityCard } from './components/SecurityCard';
import axios from 'axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  // Mock statistics data - in real app, this would come from API
  const activityStats = {
    tasksCompleted: 47,
    tasksInProgress: 8,
    totalHours: 156,
    projectsCount: 5,
  };

  const handleUploadPhoto = () => {
    // TODO: Implement photo upload functionality
    console.log('Upload photo');
  };

  const handleSavePersonalInfo = () => {
    // TODO: Call API to save changes
    setIsEditingPersonalInfo(false);
    console.log('Save personal info');
  };

  const handleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!user?.id) {
      throw new Error('User not found');
    }

    try {
      await axios.post(`/api/users/${user.id}/change-password`, {
        currentPassword,
        newPassword,
      });

      alert('Mot de passe changé avec succès');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Mot de passe actuel incorrect');
        }
        throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
      }
      throw error;
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
              userId={user?.id || ''}
              onPasswordChange={handlePasswordChange}
            />
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
