import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [abierto, setAbierto] = useState(false)
  const location = useLocation()

  // Cerrar el menu movil al cambiar de pagina
  useEffect(() => {
    setAbierto(false)
  }, [location.pathname])

  return (
    <nav className={`navbar${abierto ? ' navbar-open' : ''}`}>
      <div className="navbar-top">
        <Link to="/" className="navbar-brand"><strong>Albany</strong></Link>
        <button
          className="btn-icon navbar-toggle"
          onClick={() => setAbierto((a) => !a)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? '✕' : '☰'}
        </button>
      </div>
      <div className="navbar-links">
        <NavLink to="/venta">Venta</NavLink>
        <NavLink to="/ventas">Facturas</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/movimientos">Movimientos</NavLink>
        {isAdmin && <NavLink to="/reportes">Reportes</NavLink>}
        {isAdmin && <NavLink to="/codificacion">Codificación</NavLink>}
        {isAdmin && <NavLink to="/usuarios">Usuarios</NavLink>}
      </div>
      <div className="navbar-actions">
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <span className="navbar-user">{user?.nombreCompleto} ({user?.rol})</span>
        <button className="btn btn-secondary" onClick={logout}>Salir</button>
      </div>
    </nav>
  )
}
