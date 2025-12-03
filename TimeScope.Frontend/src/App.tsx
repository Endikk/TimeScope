import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import MaintenancePage from "@/pages/maintenance"
import { MainLayout } from "@/components/layout/MainLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useAuth } from "@/contexts/AuthContext"
import { MaintenanceProvider, useMaintenance } from "@/contexts/MaintenanceContext"
import './App.css'

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode, isLoading } = useMaintenance();
  const { hasRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // Ou un loader global
  }

  // Si le mode maintenance est actif
  if (isMaintenanceMode) {
    // Si l'utilisateur est admin, on le laisse passer
    if (hasRole(['Admin'])) {
      return <>{children}</>;
    }

    // Si on est sur la page de login, on laisse passer (le message sera affiché dans la page)
    if (location.pathname === '/login') {
      return <>{children}</>;
    }

    // Si l'utilisateur n'est pas connecté, on le redirige vers le login
    // (pour qu'il voie le message d'alerte au lieu de la page de maintenance)
    if (!isAuthenticated) {
      if (location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
      }
      return <>{children}</>;
    }

    // Sinon (connecté mais pas admin), redirection vers la page de maintenance
    if (location.pathname !== '/maintenance') {
      return <Navigate to="/maintenance" replace />;
    }
  } else {
    // Si le mode maintenance n'est PAS actif, mais qu'on essaie d'accéder à la page de maintenance
    if (location.pathname === '/maintenance') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <MaintenanceGuard>
      <ErrorBoundary>
        <Toaster />
        <Routes>
          {/* Page de maintenance */}
          <Route path="/maintenance" element={<MaintenancePage />} />

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
    </MaintenanceGuard>
  );
}

function App() {
  return (
    <MaintenanceProvider>
      <AppContent />
    </MaintenanceProvider>
  );
}

export default App
