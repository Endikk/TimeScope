import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus } from "lucide-react"

interface UserFiltersProps {
  searchTerm: string
  filterRole: string
  filterStatus: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
  isAddDialogOpen: boolean
  onAddDialogChange: (open: boolean) => void
  newUser: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: "Admin" | "Manager" | "Employee"
    phoneNumber?: string
    jobTitle?: string
    department?: string
    hireDate?: string
  }
  onNewUserChange: (user: any) => void
  onAddUser: () => void
}

export function UserFilters({
  searchTerm,
  filterRole,
  filterStatus,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  isAddDialogOpen,
  onAddDialogChange,
  newUser,
  onNewUserChange,
  onAddUser
}: UserFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou département..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={filterRole} onValueChange={onRoleChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Employee">Employé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={onAddDialogChange}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte utilisateur pour votre organisation
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => onNewUserChange({...newUser, firstName: e.target.value})}
                    placeholder="Jean"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => onNewUserChange({...newUser, lastName: e.target.value})}
                    placeholder="Dupont"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => onNewUserChange({...newUser, email: e.target.value})}
                    placeholder="jean.dupont@timescope.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => onNewUserChange({...newUser, password: e.target.value})}
                    placeholder="********"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => onNewUserChange({...newUser, role: value as "Admin" | "Manager" | "Employee"})}
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
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={newUser.phoneNumber || ''}
                    onChange={(e) => onNewUserChange({...newUser, phoneNumber: e.target.value})}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Poste</Label>
                  <Input
                    id="jobTitle"
                    value={newUser.jobTitle || ''}
                    onChange={(e) => onNewUserChange({...newUser, jobTitle: e.target.value})}
                    placeholder="Développeur Full Stack"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={newUser.department || ''}
                    onChange={(e) => onNewUserChange({...newUser, department: e.target.value})}
                    placeholder="Développement"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hireDate">Date d'embauche</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newUser.hireDate || ''}
                    onChange={(e) => onNewUserChange({...newUser, hireDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onAddDialogChange(false)}>
                  Annuler
                </Button>
                <Button onClick={onAddUser}>
                  Créer l'utilisateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
