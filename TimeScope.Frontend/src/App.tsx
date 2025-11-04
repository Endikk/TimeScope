import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from "@/pages/home"
import ContactPage from "@/pages/contact"
import AdminPage from "@/pages/admin"
import UserManagementPage from "@/pages/admin/user_management"
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/user_management" element={<UserManagementPage />} />
    </Routes>
  )
}

export default App
