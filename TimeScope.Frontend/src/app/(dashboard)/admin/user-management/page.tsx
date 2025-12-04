"use client";
import { useState, useMemo } from "react"
import { useUsers, useUserMutations } from "@/lib/hooks/use-users"
import type { CreateUserDto } from "@/lib/api/services/users.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCards, UserFilters, UsersTable, EditUserDialog } from './components'
import { User } from "@/types/user"



export default function UserManagement() {
  const { users: apiUsers, loading: loadingUsers, error: errorUsers, refetch } = useUsers()
  const { createUser, updateUser, deleteUser } = useUserMutations()

  const users = useMemo(() => {
    return apiUsers || []
  }, [apiUsers])

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

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" ? user.isActive : !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
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
        await updateUser(selectedUser.id, {
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          isActive: selectedUser.isActive,
          phoneNumber: selectedUser.phoneNumber,
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
        await updateUser(userId, {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: !user.isActive
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
