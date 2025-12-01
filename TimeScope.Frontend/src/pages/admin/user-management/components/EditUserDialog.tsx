import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@/types/user"

// Helper function to format date for input type="date"
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: User | null
  onUserChange: (user: User) => void
  onSave: () => void
}

export function EditUserDialog({
  open,
  onOpenChange,
  selectedUser,
  onUserChange,
  onSave
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">Prénom</Label>
                <Input
                  id="edit-firstName"
                  value={selectedUser.firstName}
                  onChange={(e) => onUserChange({ ...selectedUser, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Nom</Label>
                <Input
                  id="edit-lastName"
                  value={selectedUser.lastName}
                  onChange={(e) => onUserChange({ ...selectedUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedUser.email}
                onChange={(e) => onUserChange({ ...selectedUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={selectedUser.phoneNumber || ''}
                onChange={(e) => onUserChange({ ...selectedUser, phoneNumber: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-jobTitle">Poste</Label>
              <Input
                id="edit-jobTitle"
                value={selectedUser.jobTitle || ''}
                onChange={(e) => onUserChange({ ...selectedUser, jobTitle: e.target.value })}
                placeholder="Développeur Full Stack"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Département</Label>
              <Input
                id="edit-department"
                value={selectedUser.department || ''}
                onChange={(e) => onUserChange({ ...selectedUser, department: e.target.value })}
                placeholder="Développement"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-hireDate">Date d'embauche</Label>
              <Input
                id="edit-hireDate"
                type="date"
                value={formatDateForInput(selectedUser.hireDate)}
                onChange={(e) => onUserChange({ ...selectedUser, hireDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={selectedUser.role}
                onValueChange={(value) => onUserChange({ ...selectedUser, role: value as User["role"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employé</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-status">Statut actif</Label>
              <Switch
                id="edit-status"
                checked={selectedUser.isActive}
                onCheckedChange={(checked) =>
                  onUserChange({ ...selectedUser, isActive: checked })
                }
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
