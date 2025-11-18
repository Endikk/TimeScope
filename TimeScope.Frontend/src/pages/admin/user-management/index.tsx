import { useState, useEffect } from "react"
import { useUsers, useUserMutations } from "@/lib/hooks/use-users"
import type { User as ApiUser, CreateUserDto } from "@/lib/api/services/users.service"
import { roleNumberToString } from "@/lib/api/services/users.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCards, UserFilters, UsersTable, EditUserDialog } from './components'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "Admin" | "Manager" | "Employee"
  department?: string
  jobTitle?: string
  hireDate?: string
  status: "active" | "inactive"
  joinDate: string
  avatar?: string
}

const apiUserToLocal = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: `${apiUser.firstName} ${apiUser.lastName}`,
  email: apiUser.email,
  phone: apiUser.phoneNumber || "",
  role: roleNumberToString(apiUser.role),
  department: apiUser.department || "",
  jobTitle: apiUser.jobTitle || "",
  hireDate: apiUser.hireDate || "",
  status: apiUser.isActive ? "active" : "inactive",
  joinDate: apiUser.hireDate || new Date().toISOString(),
  avatar: apiUser.avatar
})

const initialUsers: User[] = [
  {
    id: "1",
    name: "Alice Martin",
    email: "alice.martin@timescope.com",
    phone: "+33 6 12 34 56 78",
    role: "Admin",
    department: "IT",
    status: "active",
    joinDate: "2023-01-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
  },
  {
    id: "2",
    name: "Bob Dupont",
    email: "bob.dupont@timescope.com",
    phone: "+33 6 23 45 67 89",
    role: "Manager",
    department: "Marketing",
    status: "active",
    joinDate: "2023-03-20",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
  },
  {
    id: "3",
    name: "Claire Bernard",
    email: "claire.bernard@timescope.com",
    phone: "+33 6 34 56 78 90",
    role: "Employee",
    department: "Sales",
    status: "active",
    joinDate: "2023-05-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire"
  },
  {
    id: "4",
    name: "David Laurent",
    email: "david.laurent@timescope.com",
    phone: "+33 6 45 67 89 01",
    role: "Employee",
    department: "IT",
    status: "inactive",
    joinDate: "2023-02-28",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  },
  {
    id: "5",
    name: "Emma Rousseau",
    email: "emma.rousseau@timescope.com",
    phone: "+33 6 56 78 90 12",
    role: "Manager",
    department: "HR",
    status: "active",
    joinDate: "2023-04-05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
  },
  {
    id: "6",
    name: "François Petit",
    email: "francois.petit@timescope.com",
    phone: "+33 6 67 89 01 23",
    role: "Employee",
    department: "Finance",
    status: "active",
    joinDate: "2023-06-18",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Francois"
  },
  {
    id: "7",
    name: "Sophie Moreau",
    email: "sophie.moreau@timescope.com",
    phone: "+33 6 78 90 12 34",
    role: "Employee",
    department: "Marketing",
    status: "active",
    joinDate: "2023-07-22",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
  },
  {
    id: "8",
    name: "Thomas Leroy",
    email: "thomas.leroy@timescope.com",
    phone: "+33 6 89 01 23 45",
    role: "Manager",
    department: "Sales",
    status: "active",
    joinDate: "2023-08-30",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas"
  }
]

export default function UserManagement() {
  const { users: apiUsers, loading: loadingUsers, error: errorUsers, refetch } = useUsers()
  const { createUser, updateUser, deleteUser } = useUserMutations()

  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<{
    firstName: string
    lastName: string
    email: string
    password: string
    role: "Admin" | "Manager" | "Employee"
    phoneNumber?: string
    jobTitle?: string
    department?: string
    hireDate?: string
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Employee",
    phoneNumber: "",
    jobTitle: "",
    department: "",
    hireDate: "",
  })

  useEffect(() => {
    if (apiUsers && apiUsers.length > 0) {
      setUsers(apiUsers.map(apiUserToLocal))
    }
  }, [apiUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    inactive: users.filter(u => u.status === "inactive").length,
    admins: users.filter(u => u.role === "Admin").length,
    managers: users.filter(u => u.role === "Manager").length,
    employees: users.filter(u => u.role === "Employee").length,
  }

  const handleAddUser = async () => {
    try {
      const createDto: CreateUserDto = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        jobTitle: newUser.jobTitle,
        department: newUser.department,
        hireDate: newUser.hireDate
      }
      await createUser(createDto)
      await refetch()
      setIsAddDialogOpen(false)
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "Employee",
        phoneNumber: "",
        jobTitle: "",
        department: "",
        hireDate: "",
      })
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
    }
  }

  const handleEditUser = async () => {
    if (selectedUser) {
      try {
        const [firstName, ...lastNameParts] = selectedUser.name.split(' ')
        const lastName = lastNameParts.join(' ')

        await updateUser(selectedUser.id, {
          firstName,
          lastName,
          email: selectedUser.email,
          isActive: selectedUser.status === "active",
          phoneNumber: selectedUser.phone,
          jobTitle: selectedUser.jobTitle,
          department: selectedUser.department,
          hireDate: selectedUser.hireDate || undefined
        })
        await refetch()
        setIsEditDialogOpen(false)
        setSelectedUser(null)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    {
      try {
        await deleteUser(userId)
        await refetch()
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error)
      }
    }
  }

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      try {
        const [firstName, ...lastNameParts] = user.name.split(' ')
        const lastName = lastNameParts.join(' ')

        await updateUser(userId, {
          firstName,
          lastName,
          email: user.email,
          isActive: user.status === "inactive"
        })
        await refetch()
      } catch (error) {
        console.error("Erreur lors du changement de statut:", error)
      }
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive"
      case "Manager": return "default"
      case "Employee": return "secondary"
      default: return "secondary"
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loadingUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  if (errorUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">{errorUsers}</p>
            <Button onClick={refetch}>Réessayer</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Gestion des Utilisateurs</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez les utilisateurs, leurs rôles et leurs permissions
        </p>
      </div>

      <StatsCards stats={stats} />

      <UserFilters
        searchTerm={searchTerm}
        filterRole={filterRole}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onRoleChange={setFilterRole}
        onStatusChange={setFilterStatus}
        isAddDialogOpen={isAddDialogOpen}
        onAddDialogChange={setIsAddDialogOpen}
        newUser={newUser}
        onNewUserChange={setNewUser}
        onAddUser={handleAddUser}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={filteredUsers}
            onEdit={(user) => {
              setSelectedUser(user)
              setIsEditDialogOpen(true)
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteUser}
            getRoleBadgeVariant={getRoleBadgeVariant}
            getInitials={getInitials}
          />
        </CardContent>
      </Card>

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedUser={selectedUser}
        onUserChange={setSelectedUser}
        onSave={handleEditUser}
      />
    </div>
  )
}
