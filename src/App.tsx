import './App.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}

export default App
