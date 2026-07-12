import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Venta() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([]) // [{producto, cantidad}]
  const [cliente, setCliente] = useState('')
  const [clienteDocumento, setClienteDocumento] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
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

  const total = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)

  const registrarVenta = async () => {
    setError('')
    if (carrito.length === 0) {
      setError('Agrega al menos un producto al carrito')
      return
    }
    setGuardando(true)
    try {
      const payload = {
        cliente: cliente || null,
        clienteDocumento: clienteDocumento || null,
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
              <p className="text-muted" style={{ fontSize: 13, marginTop: 12 }}>
                No hay productos disponibles con ese criterio.
              </p>
            )}
            {disponibles.map((p) => (
              <button key={p.id} className="pos-product-item" onClick={() => agregarProducto(p)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {p.codigo} · {p.rangoTalla?.nombre} · disp: {p.cantidad}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>${Number(p.precio).toLocaleString('es-CO')}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Carrito</h3>

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
            <p className="text-muted" style={{ fontSize: 13 }}>Aún no has agregado productos.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.producto.id}>
                    <td>{item.producto.nombre}</td>
                    <td style={{ width: 70 }}>
                      <input
                        type="number"
                        min="1"
                        max={item.producto.cantidad}
                        value={item.cantidad}
                        onChange={(e) => cambiarCantidad(item.producto.id, e.target.value)}
                      />
                    </td>
                    <td>${Number(item.producto.precio).toLocaleString('es-CO')}</td>
                    <td>${Number(item.producto.precio * item.cantidad).toLocaleString('es-CO')}</td>
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
            <span>${Number(total).toLocaleString('es-CO')}</span>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn" style={{ width: '100%', marginTop: 12 }} onClick={registrarVenta} disabled={guardando}>
            {guardando ? 'Registrando...' : 'Registrar venta y generar factura'}
          </button>
        </div>
      </div>
    </div>
  )
}
