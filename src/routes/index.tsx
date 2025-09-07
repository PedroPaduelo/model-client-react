import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '@/pages/auth/Layout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import DahsLayout from '@/pages/dahs/Layout'
import DahsHome from '@/pages/dahs/Home'
import DahsAgout from '@/pages/dahs/Agout'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth area */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard area */}
      <Route element={<DahsLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dahs">
          <Route index element={<DahsHome />} />
          <Route path="home" element={<DahsHome />} />
          <Route path="agout" element={<DahsAgout />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  )
}
