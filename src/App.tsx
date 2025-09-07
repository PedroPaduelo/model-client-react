import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.tsx'
import DahsLayout from './pages/dahs/Layout.tsx'
import DahsHome from './pages/dahs/Home.tsx'
import DahsAgout from './pages/dahs/Agout.tsx'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DahsLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dahs">
            <Route index element={<DahsHome />} />
            <Route path="home" element={<DahsHome />} />
            <Route path="agout" element={<DahsAgout />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}

export default App
