import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateSettingDto } from '@/lib/api/services';

interface CreateSettingFormProps {
  newSetting: CreateSettingDto;
  setNewSetting: (setting: CreateSettingDto) => void;
}

export function CreateSettingForm({ newSetting, setNewSetting }: CreateSettingFormProps) {
  return (
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
  );
}
