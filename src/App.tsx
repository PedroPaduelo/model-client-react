import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Teste from './pages/Teste.tsx'
import Login from './pages/Login.tsx'
import DahsLayout from './pages/dahs/Layout.tsx'
import DahsHome from './pages/dahs/Home.tsx'
import DahsAgout from './pages/dahs/Agout.tsx'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <div className="p-4">
        {/* Navegação simples para testar as rotas */}
        <nav className="mb-4 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/teste">Teste</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dahs/home">Dahs/Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dahs/agout">Dahs/Agout</Link>
          </Button>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/teste" replace />} />
          <Route path="/teste" element={<Teste />} />
          <Route path="/login" element={<Login />} />

          {/* Rota de "dahs" com sub-rotas */}
          <Route path="/dahs" element={<DahsLayout />}>
            <Route index element={<DahsHome />} />
            <Route path="home" element={<DahsHome />} />
            <Route path="agout" element={<DahsAgout />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<h2>Página não encontrada</h2>} />
        </Routes>
        <Toaster richColors position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
