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
      <div className="p-4">
        {/* Navegação simples para testar as rotas */}
        <nav className="flex gap-3 mb-4 text-blue-600">
          <Link className="hover:underline" to="/teste">Teste</Link>
          <Link className="hover:underline" to="/login">Login</Link>
          <Link className="hover:underline" to="/dahs/home">Dahs/Home</Link>
          <Link className="hover:underline" to="/dahs/agout">Dahs/Agout</Link>
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
