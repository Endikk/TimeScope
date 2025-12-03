import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import HomePage from "@/pages/home"
import ContactPage from "@/pages/contact"
import RequestPage from "@/pages/request"
import DashboardPage from "@/pages/dashboard"
import TimesheetPage from "@/pages/timesheet"
import ProfilePage from "@/pages/profile"
import LoginPage from "@/pages/login"
import AdminPage from "@/pages/admin"
import UserManagementPage from "@/pages/admin/user-management"
import ProjectsManagementPage from "@/pages/admin/projects"
import TasksManagementPage from "@/pages/admin/tasks"
import DatabaseMaintenancePage from "@/pages/admin/database-maintenance"
import ReportsPage from "@/pages/admin/reports"
import SettingsPage from "@/pages/admin/settings"
import UserSettingsPage from "@/pages/settings"
import MonitoringPage from "@/pages/admin/monitoring"
import { MainLayout } from "@/components/layout/MainLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useAuth } from "@/contexts/AuthContext"
import './App.css'

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <Toaster />
      <Routes>
        {/* Route publique */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />}
        />

        {/* Redirection de la racine */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />

        {/* Routes protégées - Tous les utilisateurs authentifiés */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/timesheet" element={<TimesheetPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
        </Route>

        {/* Routes Admin - Réservées aux Admin et Manager */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><MainLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/monitoring" element={<MonitoringPage />} />
          <Route path="/request" element={<RequestPage />} />
        </Route>

        {/* Routes Admin - Réservées uniquement aux Admin */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout /></ProtectedRoute>}>
          <Route path="/admin/user_management" element={<UserManagementPage />} />
          <Route path="/admin/projects" element={<ProjectsManagementPage />} />
          <Route path="/admin/tasks" element={<TasksManagementPage />} />
          <Route path="/admin/database-maintenance" element={<DatabaseMaintenancePage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* Route par défaut pour les chemins non trouvés */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
