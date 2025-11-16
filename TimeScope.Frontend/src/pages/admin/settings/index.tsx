import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSettings, useCategories, useSettingMutations } from '@/lib/hooks/use-settings';
import { AppSetting, CreateSettingDto, UpdateSettingDto } from '@/lib/api/services';
import { SettingsHeader } from './components/SettingsHeader';
import { SearchFilters } from './components/SearchFilters';
import { SettingsTabs } from './components/SettingsTabs';
import { EditSettingDialog } from './components/EditSettingDialog';

export default function SettingsPageAPI() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AppSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { settings, loading, refetch } = useSettings({
    category: selectedCategory === 'all' ? undefined : selectedCategory
  });
  const { categories } = useCategories();
  const { createSetting, updateSetting, deleteSetting, resetToDefaults, loading: mutating } = useSettingMutations();

  const [newSetting, setNewSetting] = useState<CreateSettingDto>({
    key: '',
    value: '',
    category: '',
    description: '',
    dataType: 'string',
    isPublic: false
  });

  const [editedSetting, setEditedSetting] = useState<UpdateSettingDto>({
    value: '',
    category: '',
    description: '',
    dataType: 'string',
    isPublic: false
  });

  const filteredSettings = settings.filter(s =>
    s.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSetting = async () => {
    try {
      await createSetting(newSetting);
      setIsCreateOpen(false);
      setNewSetting({
        key: '',
        value: '',
        category: '',
        description: '',
        dataType: 'string',
        isPublic: false
      });
      refetch();
    } catch (error: any) {
    }
  };

  const handleEditSetting = async () => {
    if (!editingSetting) return;

    try {
      await updateSetting(editingSetting.key, editedSetting);
      setIsEditOpen(false);
      setEditingSetting(null);
      refetch();
    } catch (error: any) {
    }
  };

  const handleDeleteSetting = async (key: string) => {
    try {
      await deleteSetting(key);
      refetch();
    } catch (error: any) {
    }
  };

  const handleResetDefaults = async () => {
    try {
      await resetToDefaults();
      refetch();
    } catch (error: any) {
    }
  };

  const openEditDialog = (setting: AppSetting) => {
    setEditingSetting(setting);
    setEditedSetting({
      value: setting.value,
      category: setting.category,
      description: setting.description,
      dataType: setting.dataType,
      isPublic: setting.isPublic
    });
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  const settingsByCategory = (categories || []).reduce((acc, category) => {
    acc[category] = filteredSettings.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, AppSetting[]>);

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6">
      <SettingsHeader
        onResetDefaults={handleResetDefaults}
        mutating={mutating}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        onCreateSetting={handleCreateSetting}
        newSetting={newSetting}
        setNewSetting={setNewSetting}
      />

      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories || []}
      />

      <SettingsTabs
        categories={categories || []}
        settingsByCategory={settingsByCategory}
        onEdit={openEditDialog}
        onDelete={handleDeleteSetting}
      />

      <EditSettingDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editingSetting={editingSetting}
        editedSetting={editedSetting}
        setEditedSetting={setEditedSetting}
        onSave={handleEditSetting}
        mutating={mutating}
      />
    </div>
  );
}
