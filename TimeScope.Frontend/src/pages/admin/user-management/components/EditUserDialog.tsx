import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "Admin" | "Manager" | "Employee"
  department?: string
  status: "active" | "inactive"
  joinDate: string
  avatar?: string
}

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={selectedUser.name}
                onChange={(e) => onUserChange({...selectedUser, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedUser.email}
                onChange={(e) => onUserChange({...selectedUser, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={selectedUser.phone}
                onChange={(e) => onUserChange({...selectedUser, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Département</Label>
              <Input
                id="edit-department"
                value={selectedUser.department}
                onChange={(e) => onUserChange({...selectedUser, department: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={selectedUser.role}
                onValueChange={(value) => onUserChange({...selectedUser, role: value as User["role"]})}
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
                checked={selectedUser.status === "active"}
                onCheckedChange={(checked) =>
                  onUserChange({...selectedUser, status: checked ? "active" : "inactive"})
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
