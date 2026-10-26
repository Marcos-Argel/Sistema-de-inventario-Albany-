import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Productos from './pages/Productos.jsx'
import Movimientos from './pages/Movimientos.jsx'
import Reportes from './pages/Reportes.jsx'
import Codificacion from './pages/Codificacion.jsx'
import Venta from './pages/Venta.jsx'
import Ventas from './pages/Ventas.jsx'
import Factura from './pages/Factura.jsx'
import Usuarios from './pages/Usuarios.jsx'

function Privado({ children, soloAdmin }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (soloAdmin && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Privado><Dashboard /></Privado>} />
        <Route path="/productos" element={<Privado><Productos /></Privado>} />
        <Route path="/movimientos" element={<Privado><Movimientos /></Privado>} />
        <Route path="/venta" element={<Privado><Venta /></Privado>} />
        <Route path="/ventas" element={<Privado><Ventas /></Privado>} />
        <Route path="/factura/:id" element={<Privado><Factura /></Privado>} />
        <Route path="/reportes" element={<Privado soloAdmin><Reportes /></Privado>} />
        <Route path="/codificacion" element={<Privado soloAdmin><Codificacion /></Privado>} />
        <Route path="/usuarios" element={<Privado soloAdmin><Usuarios /></Privado>} />
      </Routes>
    </div>
  )
}
