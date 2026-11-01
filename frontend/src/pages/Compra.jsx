import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatCOP } from '../utils/format.js'

const proveedorVacio = { proveedor: '', proveedorNit: '', facturaProveedor: '', fechaFactura: '', observacion: '' }

export default function Compra() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [lineas, setLineas] = useState([]) // [{producto, cantidad, costoUnitario}]
  const [datos, setDatos] = useState(proveedorVacio)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/productos').then((res) => setProductos(res.data))
  }, [])

  // En compras se muestran todos los productos, incluso los que estan en cero
  const filtrados = productos.filter((p) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)
  })

  const agregarProducto = (producto) => {
    setLineas((ls) => {
      if (ls.some((l) => l.producto.id === producto.id)) {
        return ls.map((l) => (l.producto.id === producto.id ? { ...l, cantidad: Number(l.cantidad) + 1 } : l))
      }
      return [...ls, { producto, cantidad: 1, costoUnitario: '' }]
    })
  }

  const cambiarLinea = (productoId, campo, valor) => {
    setLineas((ls) => ls.map((l) => (l.producto.id === productoId ? { ...l, [campo]: valor } : l)))
  }

  const quitarLinea = (productoId) => {
    setLineas((ls) => ls.filter((l) => l.producto.id !== productoId))
  }

  const handleDatos = (e) => {
    const { name, value } = e.target
    setDatos((d) => ({ ...d, [name]: value }))
  }

  const subtotal = (l) => (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0)
  const total = Math.round(lineas.reduce((sum, l) => sum + subtotal(l), 0) * 100) / 100
  const unidades = lineas.reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0)

  const registrarCompra = async (e) => {
    e.preventDefault()
    setError('')
    if (lineas.length === 0) {
      setError('Agrega al menos un producto a la compra')
      return
    }
    if (lineas.some((l) => !(Number(l.cantidad) > 0) || l.costoUnitario === '' || Number(l.costoUnitario) < 0)) {
      setError('Revisa que cada producto tenga cantidad y costo unitario')
      return
    }
    setGuardando(true)
    try {
      const payload = {
        proveedor: datos.proveedor,
        proveedorNit: datos.proveedorNit || null,
        facturaProveedor: datos.facturaProveedor || null,
        fechaFactura: datos.fechaFactura || null,
        observacion: datos.observacion || null,
        items: lineas.map((l) => ({
          productoId: l.producto.id,
          cantidad: Number(l.cantidad),
          costoUnitario: Number(l.costoUnitario),
        })),
      }
      const { data } = await api.post('/compras', payload)
      navigate(`/compras/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la compra')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>Registrar compra</h2>
          <p className="text-muted">Copia aquí la factura del proveedor. Al guardar, el stock se suma automáticamente.</p>
        </div>
        <Link to="/compras" className="btn btn-secondary">Ver compras</Link>
      </div>

      <form onSubmit={registrarCompra}>
        <div className="card">
          <h3 className="card-title">Datos del proveedor</h3>
          <div className="form-grid">
            <div>
              <label>Proveedor *</label>
              <input name="proveedor" value={datos.proveedor} onChange={handleDatos} required placeholder="Nombre o razón social" />
            </div>
            <div>
              <label>NIT</label>
              <input name="proveedorNit" value={datos.proveedorNit} onChange={handleDatos} placeholder="Opcional" />
            </div>
            <div>
              <label>N.º de factura del proveedor</label>
              <input name="facturaProveedor" value={datos.facturaProveedor} onChange={handleDatos} placeholder="Ej: FV-1234" />
            </div>
            <div>
              <label>Fecha de la factura</label>
              <input type="date" name="fechaFactura" value={datos.fechaFactura} onChange={handleDatos} />
            </div>
          </div>
          <div>
            <label>Observación</label>
            <input name="observacion" value={datos.observacion} onChange={handleDatos} placeholder="Opcional" />
          </div>
        </div>

        <div className="pos-grid">
          <div className="card">
            <label>Buscar producto</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Código o nombre..." />
            <div className="pos-product-list">
              {filtrados.length === 0 && <p className="empty-state">No hay productos con ese criterio.</p>}
              {filtrados.map((p) => (
                <button type="button" key={p.id} className="pos-product-item" onClick={() => agregarProducto(p)}>
                  <div>
                    <div className="pos-product-name">{p.nombre}</div>
                    <div className="text-muted text-xs">{p.codigo} · {p.rangoTalla?.nombre} · stock: {p.cantidad}</div>
                  </div>
                  <span className="text-muted text-xs">+ agregar</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Productos comprados</h3>
            {lineas.length === 0 ? (
              <p className="empty-state">Selecciona los productos que llegaron en la factura.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>Costo unit.</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.producto.id}>
                      <td>{l.producto.nombre} <span className="text-muted text-xs">{l.producto.codigo}</span></td>
                      <td className="col-narrow">
                        <input
                          type="number"
                          min="1"
                          value={l.cantidad}
                          onChange={(e) => cambiarLinea(l.producto.id, 'cantidad', e.target.value)}
                        />
                      </td>
                      <td className="col-costo">
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={l.costoUnitario}
                          onChange={(e) => cambiarLinea(l.producto.id, 'costoUnitario', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>{formatCOP(subtotal(l))}</td>
                      <td>
                        <button type="button" className="btn btn-danger" onClick={() => quitarLinea(l.producto.id)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="pos-total">
              <span>Total compra <span className="text-muted text-sm">({unidades} und.)</span></span>
              <span>{formatCOP(total)}</span>
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn btn-block" type="submit" disabled={guardando || lineas.length === 0}>
              {guardando ? 'Guardando...' : 'Registrar compra y sumar al inventario'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
