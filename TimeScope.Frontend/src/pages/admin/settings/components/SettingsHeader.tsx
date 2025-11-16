import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, RotateCcw } from 'lucide-react';
import { CreateSettingForm } from './CreateSettingForm';

interface SettingsHeaderProps {
  onResetDefaults: () => void;
  mutating: boolean;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  onCreateSetting: () => void;
  newSetting: any;
  setNewSetting: (setting: any) => void;
}

export function SettingsHeader({
  onResetDefaults,
  mutating,
  isCreateOpen,
  setIsCreateOpen,
  onCreateSetting,
  newSetting,
  setNewSetting
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Configuration de l'application
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={onResetDefaults} variant="outline" size="sm" disabled={mutating} className="w-full sm:w-auto">
          <RotateCcw className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Réinitialiser</span>
          <span className="sm:hidden">Réinit.</span>
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nouveau Paramètre</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Paramètre</DialogTitle>
              <DialogDescription>
                Ajouter un nouveau paramètre de configuration
              </DialogDescription>
            </DialogHeader>
            <CreateSettingForm
              newSetting={newSetting}
              setNewSetting={setNewSetting}
            />
            <DialogFooter>
              <Button onClick={onCreateSetting} disabled={mutating}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
