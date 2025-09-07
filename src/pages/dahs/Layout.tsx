import { Link, Outlet } from 'react-router-dom'

export default function DahsLayout() {
  return (
    <div>
      <h1>Dahs</h1>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/dahs/home">Home</Link>
        <Link to="/dahs/agout">Agout</Link>
      </nav>
      <Outlet />
    </div>
  )
}
