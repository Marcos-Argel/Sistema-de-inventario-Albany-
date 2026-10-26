import { useEffect, useState } from 'react'
import api from '../api/client'
import { exportToCsv } from '../utils/csv.js'
import { formatCOP } from '../utils/format.js'
import BarList from '../components/BarList.jsx'

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
        <div className="card-header">
          <h3 className="card-title">Top 5 productos más vendidos</h3>
          <button className="btn btn-secondary" onClick={exportarTopProductos}>Exportar CSV</button>
        </div>
        <BarList
          items={topProductos.map((p) => ({
            key: p.codigo,
            label: `${p.nombre} (${p.codigo})`,
            value: p.unidadesVendidas,
            detalle: `${formatCOP(p.ingresosGenerados)} en ventas`,
          }))}
          formatValue={(v) => `${v} und.`}
          vacio="Aún no hay ventas registradas."
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Unidades por categoría</h3>
          <button className="btn btn-secondary" onClick={exportarInventario}>Exportar inventario CSV</button>
        </div>
        <BarList
          items={Object.entries(porCategoria)
            .map(([nombre, cantidad]) => ({ key: nombre, label: nombre, value: cantidad }))
            .sort((a, b) => b.value - a.value)}
          formatValue={(v) => `${v} und.`}
          vacio="Aún no hay productos registrados."
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-danger">Productos con stock bajo</h3>
        </div>
        <table>
          <thead>
            <tr><th>Código</th><th>Nombre</th><th>Cantidad</th><th>Stock mínimo</th><th>Ubicación</th></tr>
          </thead>
          <tbody>
            {stockBajo.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo}</td><td>{p.nombre}</td>
                <td className="stock-bajo">{p.cantidad}</td>
                <td>{p.stockMinimo}</td><td>{p.ubicacion}</td>
              </tr>
            ))}
            {stockBajo.length === 0 && <tr><td colSpan={5} className="text-muted">No hay productos con stock bajo.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historial de movimientos</h3>
          <button className="btn btn-secondary" onClick={exportarMovimientos}>Exportar CSV</button>
        </div>
        <p className="text-muted text-sm">{movimientos.length} movimientos registrados.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ventas</h3>
          <button className="btn btn-secondary" onClick={exportarVentas}>Exportar CSV</button>
        </div>
        <p className="text-muted text-sm">{ventas.length} ventas registradas.</p>
      </div>
    </div>
  )
}
