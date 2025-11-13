import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, MoreVertical, Edit, Trash2 } from "lucide-react"

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

interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
  onToggleStatus: (userId: string) => void
  onDelete: (userId: string) => void
  getRoleBadgeVariant: (role: string) => "destructive" | "default" | "secondary"
  getInitials: (name: string) => string
}

export function UsersTable({
  users,
  onEdit,
  onToggleStatus,
  onDelete,
  getRoleBadgeVariant,
  getInitials
}: UsersTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[250px] md:w-[300px]">Utilisateur</TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">Contact</TableHead>
            <TableHead className="hidden xl:table-cell min-w-[120px]">Département</TableHead>
            <TableHead className="min-w-[100px]">Rôle</TableHead>
            <TableHead className="min-w-[100px]">Statut</TableHead>
            <TableHead className="hidden md:table-cell min-w-[120px]">Date d'entrée</TableHead>
            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs md:text-sm">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs md:text-sm truncate">{user.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-xs md:text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex items-center gap-1 text-xs md:text-sm">
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{user.department}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs whitespace-nowrap">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 md:gap-2">
                    {user.status === "active" ? (
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500 shrink-0" />
                    )}
                    <span className="capitalize text-xs md:text-sm whitespace-nowrap">{user.status === "active" ? "Actif" : "Inactif"}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1 text-xs md:text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="whitespace-nowrap">{new Date(user.joinDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
                        {user.status === "active" ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
