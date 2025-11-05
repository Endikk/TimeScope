import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from "@/pages/home"
import ContactPage from "@/pages/contact"
import DashboardPage from "@/pages/dashboard"
import TimesheetPage from "@/pages/timesheet"
import LoginPage from "@/pages/login"
import AdminPage from "@/pages/admin"
import UserManagementPage from "@/pages/admin/user-management"
import ProjectsManagementPage from "@/pages/admin/projects"
import TasksManagementPage from "@/pages/admin/tasks"
import DatabaseMaintenancePage from "@/pages/admin/database-maintenance"
import ReportsPage from "@/pages/admin/reports"
import SettingsPage from "@/pages/admin/settings"
import MonitoringPage from "@/pages/admin/monitoring"
import { MainLayout } from "@/components/layout/MainLayout"
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/timesheet" element={<TimesheetPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/user_management" element={<UserManagementPage />} />
        <Route path="/admin/projects" element={<ProjectsManagementPage />} />
        <Route path="/admin/tasks" element={<TasksManagementPage />} />
        <Route path="/admin/database-maintenance" element={<DatabaseMaintenancePage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/monitoring" element={<MonitoringPage />} />
      </Route>
    </Routes>
  )
}

export default App
