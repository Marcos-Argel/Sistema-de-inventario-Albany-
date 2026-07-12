import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="navbar">
      <div>
        <Link to="/"><strong>Albany</strong></Link>
        <Link to="/venta">Venta</Link>
        <Link to="/ventas">Facturas</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/movimientos">Movimientos</Link>
        {isAdmin && <Link to="/reportes">Reportes</Link>}
        {isAdmin && <Link to="/codificacion">Codificación</Link>}
        {isAdmin && <Link to="/usuarios">Usuarios</Link>}
      </div>
      <div className="navbar-actions">
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <span style={{ fontSize: 13 }}>{user?.nombreCompleto} ({user?.rol})</span>
        <button className="btn btn-secondary" onClick={logout}>Salir</button>
      </div>
    </div>
  )
}
