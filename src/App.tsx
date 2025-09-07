import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Teste from './pages/Teste.tsx'
import Login from './pages/Login.tsx'
import DahsLayout from './pages/dahs/Layout.tsx'
import DahsHome from './pages/dahs/Home.tsx'
import DahsAgout from './pages/dahs/Agout.tsx'

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        {/* Navegação simples para testar as rotas */}
        <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Link to="/teste">Teste</Link>
          <Link to="/login">Login</Link>
          <Link to="/dahs/home">Dahs/Home</Link>
          <Link to="/dahs/agout">Dahs/Agout</Link>
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
      </div>
    </BrowserRouter>
  )
}

export default App
