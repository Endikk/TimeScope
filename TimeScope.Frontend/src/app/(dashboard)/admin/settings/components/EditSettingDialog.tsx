import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { AppSetting, UpdateSettingDto } from '@/lib/api/services';

interface EditSettingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingSetting: AppSetting | null;
  editedSetting: UpdateSettingDto;
  setEditedSetting: (setting: UpdateSettingDto) => void;
  onSave: () => void;
  mutating: boolean;
}

export function EditSettingDialog({
  isOpen,
  onOpenChange,
  editingSetting,
  editedSetting,
  setEditedSetting,
  onSave,
  mutating
}: EditSettingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button onClick={onSave} disabled={mutating}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
