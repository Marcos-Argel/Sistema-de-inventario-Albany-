import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatCOP, METODOS_PAGO } from '../utils/format.js'

export default function Venta() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([]) // [{producto, cantidad}]
  const [cliente, setCliente] = useState('')
  const [clienteDocumento, setClienteDocumento] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [recibido, setRecibido] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/productos').then((res) => setProductos(res.data))
  }, [])

  const disponibles = productos.filter((p) => {
    const enCarrito = carrito.find((c) => c.producto.id === p.id)
    const restante = p.cantidad - (enCarrito ? enCarrito.cantidad : 0)
    if (restante <= 0) return false
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)
  })

  const agregarProducto = (producto) => {
    setCarrito((c) => {
      const existente = c.find((item) => item.producto.id === producto.id)
      if (existente) {
        if (existente.cantidad >= producto.cantidad) return c
        return c.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...c, { producto, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (productoId, cantidad) => {
    setCarrito((c) =>
      c.map((item) => {
        if (item.producto.id !== productoId) return item
        const max = item.producto.cantidad
        const nueva = Math.max(1, Math.min(Number(cantidad) || 1, max))
        return { ...item, cantidad: nueva }
      })
    )
  }

  const quitarDelCarrito = (productoId) => {
    setCarrito((c) => c.filter((item) => item.producto.id !== productoId))
  }

  // Redondeo a centavos para evitar errores de coma flotante al sumar
  const total = Math.round(carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0) * 100) / 100
  const montoRecibido = recibido === '' ? null : Number(recibido)
  const cambio = montoRecibido === null ? null : Math.round((montoRecibido - total) * 100) / 100

  const registrarVenta = async () => {
    setError('')
    if (carrito.length === 0) {
      setError('Agrega al menos un producto al carrito')
      return
    }
    if (metodoPago === 'EFECTIVO' && cambio !== null && cambio < 0) {
      setError('El efectivo recibido es menor que el total')
      return
    }
    setGuardando(true)
    try {
      const payload = {
        cliente: cliente || null,
        clienteDocumento: clienteDocumento || null,
        metodoPago,
        montoRecibido: metodoPago === 'EFECTIVO' ? montoRecibido : null,
        items: carrito.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
      }
      const { data } = await api.post('/ventas', payload)
      navigate(`/factura/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la venta')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="container">
      <h2>Punto de venta</h2>
      <p className="text-muted">Busca un producto, agrégalo al carrito y registra la venta.</p>

      <div className="pos-grid">
        <div className="card">
          <label>Buscar producto</label>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Código o nombre..."
          />
          <div className="pos-product-list">
            {disponibles.length === 0 && (
              <p className="empty-state">
                No hay productos disponibles con ese criterio.
              </p>
            )}
            {disponibles.map((p) => (
              <button key={p.id} className="pos-product-item" onClick={() => agregarProducto(p)}>
                <div>
                  <div className="pos-product-name">{p.nombre}</div>
                  <div className="text-muted text-xs">
                    {p.codigo} · {p.rangoTalla?.nombre} · disp: {p.cantidad}
                  </div>
                </div>
                <div className="text-strong">{formatCOP(p.precio)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Carrito</h3>

          <div className="form-grid">
            <div>
              <label>Cliente (opcional)</label>
              <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div>
              <label>Documento (opcional)</label>
              <input
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
                placeholder="Cédula / NIT"
              />
            </div>
          </div>

          {carrito.length === 0 ? (
            <p className="empty-state">Aún no has agregado productos.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.producto.id}>
                    <td>{item.producto.nombre}</td>
                    <td className="col-narrow">
                      <input
                        type="number"
                        min="1"
                        max={item.producto.cantidad}
                        value={item.cantidad}
                        onChange={(e) => cambiarCantidad(item.producto.id, e.target.value)}
                      />
                    </td>
                    <td>{formatCOP(item.producto.precio)}</td>
                    <td>{formatCOP(item.producto.precio * item.cantidad)}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => quitarDelCarrito(item.producto.id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pos-total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>

          <div className="pos-pago">
            <div>
              <label>Método de pago</label>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                {Object.entries(METODOS_PAGO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </div>
            {metodoPago === 'EFECTIVO' && (
              <div>
                <label>Efectivo recibido</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={recibido}
                  onChange={(e) => setRecibido(e.target.value)}
                  placeholder={total ? String(total) : 'Opcional'}
                />
              </div>
            )}
          </div>
          {metodoPago === 'EFECTIVO' && cambio !== null && carrito.length > 0 && (
            <div className={`pos-cambio${cambio < 0 ? ' pos-cambio-falta' : ''}`}>
              <span>{cambio < 0 ? 'Falta' : 'Cambio'}</span>
              <span>{formatCOP(Math.abs(cambio))}</span>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button className="btn btn-block" onClick={registrarVenta} disabled={guardando || carrito.length === 0}>
            {guardando ? 'Registrando...' : 'Registrar venta e imprimir tiquete'}
          </button>
        </div>
      </div>
    </div>
  )
}
