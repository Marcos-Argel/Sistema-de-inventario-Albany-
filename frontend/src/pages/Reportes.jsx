import { useEffect, useState } from 'react'
import api from '../api/client'
import { exportToCsv } from '../utils/csv.js'

export default function Reportes() {
  const [stockBajo, setStockBajo] = useState([])
  const [porCategoria, setPorCategoria] = useState({})
  const [topProductos, setTopProductos] = useState([])
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [ventas, setVentas] = useState([])

  useEffect(() => {
    api.get('/reportes/stock-bajo').then((res) => setStockBajo(res.data))
    api.get('/reportes/por-categoria').then((res) => setPorCategoria(res.data))
    api.get('/reportes/top-productos').then((res) => setTopProductos(res.data))
    api.get('/productos').then((res) => setProductos(res.data))
    api.get('/movimientos').then((res) => setMovimientos(res.data))
    api.get('/ventas').then((res) => setVentas(res.data))
  }, [])

  const maxCantidad = Math.max(1, ...Object.values(porCategoria))
  const maxVendidos = Math.max(1, ...topProductos.map((p) => p.unidadesVendidas))

  const exportarInventario = () => {
    exportToCsv(
      productos.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria?.nombre,
        talla: p.rangoTalla?.nombre,
        cantidad: p.cantidad,
        stockMinimo: p.stockMinimo,
        ubicacion: p.ubicacion,
        precio: p.precio,
      })),
      [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'talla', label: 'Talla' },
        { key: 'cantidad', label: 'Cantidad' },
        { key: 'stockMinimo', label: 'Stock mínimo' },
        { key: 'ubicacion', label: 'Ubicación' },
        { key: 'precio', label: 'Precio' },
      ],
      'inventario_albany'
    )
  }

  const exportarMovimientos = () => {
    exportToCsv(
      movimientos.map((m) => ({
        fecha: new Date(m.fecha).toLocaleString('es-CO'),
        producto: `${m.producto?.codigo} - ${m.producto?.nombre}`,
        tipo: m.tipo,
        cantidad: m.cantidad,
        usuario: m.usuario?.nombreCompleto,
        observacion: m.observacion,
      })),
      [
        { key: 'fecha', label: 'Fecha' },
        { key: 'producto', label: 'Producto' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'cantidad', label: 'Cantidad' },
        { key: 'usuario', label: 'Usuario' },
        { key: 'observacion', label: 'Observación' },
      ],
      'movimientos_albany'
    )
  }

  const exportarTopProductos = () => {
    exportToCsv(
      topProductos.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        unidadesVendidas: p.unidadesVendidas,
        ingresosGenerados: p.ingresosGenerados,
      })),
      [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'unidadesVendidas', label: 'Unidades vendidas' },
        { key: 'ingresosGenerados', label: 'Ingresos generados' },
      ],
      'top_productos_albany'
    )
  }

  const exportarVentas = () => {
    exportToCsv(
      ventas.map((v) => ({
        factura: v.numeroFactura,
        fecha: new Date(v.fecha).toLocaleString('es-CO'),
        cliente: v.cliente || 'Consumidor final',
        vendedor: v.usuario?.nombreCompleto,
        total: v.total,
      })),
      [
        { key: 'factura', label: 'Factura' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'total', label: 'Total' },
      ],
      'ventas_albany'
    )
  }

  return (
    <div className="container">
      <h2>Reportes</h2>

      <div className="card">
        <div className="reporte-card-header">
          <h3 style={{ margin: 0 }}>Top 5 productos más vendidos</h3>
          <button className="btn btn-secondary" onClick={exportarTopProductos}>Exportar CSV</button>
        </div>
        {topProductos.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13 }}>Aún no hay ventas registradas.</p>
        ) : (
          topProductos.map((p) => (
            <div key={p.codigo} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{p.nombre} <span className="text-muted">({p.codigo})</span></span>
                <span>{p.unidadesVendidas} unid. · ${Number(p.ingresosGenerados).toLocaleString('es-CO')}</span>
              </div>
              <div style={{ background: 'var(--border-color)', borderRadius: 4, height: 10 }}>
                <div style={{ width: `${(p.unidadesVendidas / maxVendidos) * 100}%`, background: '#0f766e', height: 10, borderRadius: 4 }} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="reporte-card-header">
          <h3 style={{ margin: 0 }}>Unidades por categoría</h3>
          <button className="btn btn-secondary" onClick={exportarInventario}>Exportar inventario CSV</button>
        </div>
        {Object.entries(porCategoria).map(([nombre, cantidad]) => (
          <div key={nombre} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{nombre}</span><span>{cantidad}</span>
            </div>
            <div style={{ background: 'var(--border-color)', borderRadius: 4, height: 10 }}>
              <div style={{ width: `${(cantidad / maxCantidad) * 100}%`, background: '#0f766e', height: 10, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="reporte-card-header">
          <h3 style={{ margin: 0, color: '#dc2626' }}>Productos con stock bajo</h3>
        </div>
        <table>
          <thead>
            <tr><th>Código</th><th>Nombre</th><th>Cantidad</th><th>Stock mínimo</th><th>Ubicación</th></tr>
          </thead>
          <tbody>
            {stockBajo.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo}</td><td>{p.nombre}</td>
                <td style={{ color: '#dc2626', fontWeight: 700 }}>{p.cantidad}</td>
                <td>{p.stockMinimo}</td><td>{p.ubicacion}</td>
              </tr>
            ))}
            {stockBajo.length === 0 && <tr><td colSpan={5} className="text-muted">No hay productos con stock bajo.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="reporte-card-header">
          <h3 style={{ margin: 0 }}>Historial de movimientos</h3>
          <button className="btn btn-secondary" onClick={exportarMovimientos}>Exportar CSV</button>
        </div>
        <p className="text-muted" style={{ fontSize: 13 }}>{movimientos.length} movimientos registrados.</p>
      </div>

      <div className="card">
        <div className="reporte-card-header">
          <h3 style={{ margin: 0 }}>Ventas</h3>
          <button className="btn btn-secondary" onClick={exportarVentas}>Exportar CSV</button>
        </div>
        <p className="text-muted" style={{ fontSize: 13 }}>{ventas.length} ventas registradas.</p>
      </div>
    </div>
  )
}
