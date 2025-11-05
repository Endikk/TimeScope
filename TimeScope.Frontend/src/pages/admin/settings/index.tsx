import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  RotateCcw,
  Save
} from 'lucide-react';
import { useSettings, useCategories, useSettingMutations } from '@/lib/hooks/use-settings';
import { AppSetting, CreateSettingDto, UpdateSettingDto } from '@/lib/api/services';

export default function SettingsPageAPI() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AppSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { settings, loading, refetch } = useSettings({
    category: selectedCategory || undefined
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
      alert(`Le paramètre "${newSetting.key}" a été créé avec succès.`);
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
      alert(`Erreur: ${error.message || 'Impossible de créer le paramètre'}`);
    }
  };

  const handleEditSetting = async () => {
    if (!editingSetting) return;

    try {
      await updateSetting(editingSetting.key, editedSetting);
      alert(`Le paramètre "${editingSetting.key}" a été modifié avec succès.`);
      setIsEditOpen(false);
      setEditingSetting(null);
      refetch();
    } catch (error: any) {
      alert(`Erreur: ${error.message || 'Impossible de modifier le paramètre'}`);
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${key}" ?`)) return;

    try {
      await deleteSetting(key);
      alert(`Le paramètre "${key}" a été supprimé avec succès.`);
      refetch();
    } catch (error: any) {
      alert(`Erreur: ${error.message || 'Impossible de supprimer le paramètre'}`);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ? Cette action est irréversible.')) return;

    try {
      const result = await resetToDefaults();
      alert(`${result.count} paramètres ont été réinitialisés aux valeurs par défaut.`);
      refetch();
    } catch (error: any) {
      alert(`Erreur: ${error.message || 'Impossible de réinitialiser les paramètres'}`);
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

  const settingsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredSettings.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, AppSetting[]>);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-2">
            Configuration de l'application
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleResetDefaults} variant="outline" size="sm" disabled={mutating}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Paramètre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un Paramètre</DialogTitle>
                <DialogDescription>
                  Ajouter un nouveau paramètre de configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key">Clé *</Label>
                  <Input
                    id="key"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                    placeholder="ex: app.feature_enabled"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Valeur *</Label>
                  <Input
                    id="value"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Input
                    id="category"
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataType">Type de Données</Label>
                  <Select
                    value={newSetting.dataType}
                    onValueChange={(value) => setNewSetting({ ...newSetting, dataType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newSetting.isPublic}
                    onChange={(e) => setNewSetting({ ...newSetting, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic">Public (accessible sans authentification)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSetting} disabled={mutating}>
                  <Save className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recherche et Filtres</CardTitle>
              <CardDescription>Filtrer les paramètres par catégorie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Recherche</Label>
              <Input
                placeholder="Rechercher par clé ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings by Category */}
      <Tabs defaultValue={categories[0] || ''} className="space-y-4">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
              <Badge variant="secondary" className="ml-2">
                {settingsByCategory[category]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  Paramètres de la catégorie {category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settingsByCategory[category]?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun paramètre dans cette catégorie
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clé</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Visibilité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settingsByCategory[category]?.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                          <TableCell className="font-semibold">{setting.value}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{setting.dataType}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{setting.description}</TableCell>
                          <TableCell>
                            <Badge variant={setting.isPublic ? 'default' : 'secondary'}>
                              {setting.isPublic ? 'Public' : 'Privé'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(setting)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSetting(setting.key)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Paramètre</DialogTitle>
            <DialogDescription>
              Modifier le paramètre: {editingSetting?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-value">Valeur *</Label>
              <Input
                id="edit-value"
                value={editedSetting.value}
                onChange={(e) => setEditedSetting({ ...editedSetting, value: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editedSetting.description}
                onChange={(e) => setEditedSetting({ ...editedSetting, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={editedSetting.isPublic}
                onChange={(e) => setEditedSetting({ ...editedSetting, isPublic: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-isPublic">Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSetting} disabled={mutating}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
