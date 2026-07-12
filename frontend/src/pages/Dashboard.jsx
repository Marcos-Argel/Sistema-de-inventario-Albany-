import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/reportes/resumen').then((res) => setResumen(res.data)).catch(() => {})
  }, [])

  return (
    <div className="container">
      <h2>Hola, {user?.nombreCompleto}</h2>
      <p className="text-muted">Resumen general del inventario de Albany</p>

      {resumen && (
        <div className="grid-4">
          <div className="stat">
            <div className="value">{resumen.totalProductos}</div>
            <div className="label">Productos activos</div>
          </div>
          <div className="stat">
            <div className="value">{resumen.totalUnidades}</div>
            <div className="label">Unidades en stock</div>
          </div>
          <div className="stat">
            <div className="value">${Number(resumen.valorTotalInventario).toLocaleString('es-CO')}</div>
            <div className="label">Valor del inventario</div>
          </div>
          <div className="stat" style={{ borderLeft: resumen.productosStockBajo > 0 ? '4px solid #dc2626' : 'none' }}>
            <div className="value" style={{ color: resumen.productosStockBajo > 0 ? '#dc2626' : undefined }}>
              {resumen.productosStockBajo}
            </div>
            <div className="label">Productos con stock bajo</div>
          </div>
        </div>
      )}
    </div>
  )
}
