import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { formatCOP } from '../utils/format.js'

export default function Compras() {
  const [compras, setCompras] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api.get('/compras').then((res) => setCompras(res.data))
  }, [])

  const filtradas = compras.filter((c) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return [c.numeroCompra, c.proveedor, c.proveedorNit, c.facturaProveedor]
      .some((campo) => campo?.toLowerCase().includes(q))
  })

  const totalFiltrado = filtradas.reduce((sum, c) => sum + Number(c.total), 0)

  return (
    <div className="container">
      <div className="page-header">
        <h2>Compras a proveedores</h2>
        <Link to="/compras/nueva" className="btn">+ Registrar compra</Link>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            className="input-busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por proveedor, NIT o n.º de factura..."
          />
          <span className="text-muted text-sm">
            {filtradas.length} {filtradas.length === 1 ? 'compra' : 'compras'} · {formatCOP(totalFiltrado)}
          </span>
        </div>
        <table>
          <thead>
            <tr><th>Compra</th><th>Fecha registro</th><th>Proveedor</th><th>Factura proveedor</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {filtradas.map((c) => (
              <tr key={c.id}>
                <td className="text-strong">{c.numeroCompra}</td>
                <td>{new Date(c.fecha).toLocaleString('es-CO')}</td>
                <td>
                  {c.proveedor}
                  {c.proveedorNit && <div className="text-muted text-xs">NIT {c.proveedorNit}</div>}
                </td>
                <td>
                  {c.facturaProveedor || <span className="text-muted">—</span>}
                  {c.fechaFactura && (
                    <div className="text-muted text-xs">{new Date(`${c.fechaFactura}T00:00`).toLocaleDateString('es-CO')}</div>
                  )}
                </td>
                <td>{formatCOP(c.total)}</td>
                <td><Link className="btn btn-secondary" to={`/compras/${c.id}`}>Ver factura</Link></td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  {compras.length === 0 ? 'Aún no hay compras registradas.' : 'Ninguna compra coincide con la búsqueda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
