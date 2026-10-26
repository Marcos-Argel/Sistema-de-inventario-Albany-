import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import BarList from '../components/BarList.jsx'
import { formatCOP, formatFecha } from '../utils/format.js'

// Agrupa productos sumando unidades; claveDe devuelve { key, label, color?, orden? }
function agrupar(productos, claveDe) {
  const grupos = new Map()
  for (const p of productos) {
    const g = claveDe(p)
    if (!g) continue
    const actual = grupos.get(g.key) || { ...g, value: 0 }
    actual.value += p.cantidad
    grupos.set(g.key, actual)
  }
  return [...grupos.values()]
}

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    api.get('/reportes/resumen').then((res) => setResumen(res.data)).catch(() => {})
    api.get('/productos').then((res) => setProductos(res.data)).catch(() => {})
    api.get('/ventas').then((res) => setVentas(res.data)).catch(() => {})
  }, [])

  const stockBajo = productos
    .filter((p) => p.activo !== false && p.cantidad <= p.stockMinimo)
    .sort((a, b) => a.cantidad - b.cantidad)

  const porTalla = agrupar(productos, (p) => p.rangoTalla && {
    key: p.rangoTalla.id, label: p.rangoTalla.nombre, color: p.rangoTalla.colorHex,
    detalle: p.rangoTalla.colorNombre, orden: p.rangoTalla.orden,
  }).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  const porCategoria = agrupar(productos, (p) => p.categoria && {
    key: p.categoria.id, label: p.categoria.nombre,
  }).sort((a, b) => b.value - a.value)

  const unidades = (v) => `${v.toLocaleString('es-CO')} und.`

  return (
    <div className="container">
      <div className="dash-hero">
        <div>
          <h2>Hola, {user?.nombreCompleto}</h2>
          <p className="text-muted">Así va el inventario de Albany hoy</p>
        </div>
        <Link to="/venta" className="btn">+ Nueva venta</Link>
      </div>

      {resumen && (
        <div className="stat-grid">
          <div className="stat" style={{ '--accent': 'var(--talla-3)' }}>
            <div className="value">{resumen.ventasHoy ?? 0}</div>
            <div className="label">Ventas de hoy</div>
          </div>
          <div className="stat" style={{ '--accent': 'var(--talla-5)' }}>
            <div className="value">{formatCOP(resumen.ingresosHoy)}</div>
            <div className="label">Ingresos de hoy</div>
          </div>
          <div className="stat" style={{ '--accent': 'var(--talla-6)' }}>
            <div className="value">{resumen.totalUnidades.toLocaleString('es-CO')}</div>
            <div className="label">Unidades en {resumen.totalProductos} {resumen.totalProductos === 1 ? 'producto' : 'productos'}</div>
          </div>
          <div className="stat" style={{ '--accent': 'var(--talla-2)' }}>
            <div className="value">{formatCOP(resumen.valorTotalInventario)}</div>
            <div className="label">Valor del inventario</div>
          </div>
          <div
            className={`stat${resumen.productosStockBajo > 0 ? ' stat-alerta' : ''}`}
            style={{ '--accent': resumen.productosStockBajo > 0 ? 'var(--danger)' : 'var(--talla-1)' }}
          >
            <div className="value">
              {resumen.productosStockBajo > 0 && <span aria-hidden="true">⚠ </span>}
              {resumen.productosStockBajo}
            </div>
            <div className="label">Productos con stock bajo</div>
          </div>
        </div>
      )}

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Inventario por talla</h3>
            <span className="text-muted text-xs">unidades</span>
          </div>
          <BarList items={porTalla} formatValue={unidades} vacio="Aún no hay productos registrados." />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Unidades por categoría</h3>
            <span className="text-muted text-xs">unidades</span>
          </div>
          <BarList items={porCategoria} formatValue={unidades} vacio="Aún no hay productos registrados." />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Stock bajo</h3>
            <Link to="/movimientos" className="text-sm">Registrar entrada</Link>
          </div>
          {stockBajo.length === 0 ? (
            <p className="empty-state">Todo el inventario está por encima del mínimo. 👍</p>
          ) : (
            <ul className="dash-list">
              {stockBajo.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <span className="bar-row-label">
                    <span className="dot" style={{ background: p.rangoTalla?.colorHex }} title={p.rangoTalla?.nombre} />
                    <span>
                      {p.nombre} <span className="text-muted text-xs">{p.codigo}</span>
                    </span>
                  </span>
                  <span className="stock-bajo">{p.cantidad} / {p.stockMinimo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Últimas ventas</h3>
            <Link to="/ventas" className="text-sm">Ver todas</Link>
          </div>
          {ventas.length === 0 ? (
            <p className="empty-state">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="dash-list">
              {ventas.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <Link to={`/factura/${v.id}`}>
                    <span className="text-strong">{v.numeroFactura}</span>{' '}
                    <span className="text-muted text-xs">
                      {formatFecha(v.fecha)} · {v.cliente || 'Consumidor final'}
                    </span>
                  </Link>
                  <span className="text-strong">{formatCOP(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
