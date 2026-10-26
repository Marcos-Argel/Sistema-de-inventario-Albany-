import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ productoId: '', tipo: 'SALIDA', cantidad: 1, observacion: '' })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = () => {
    api.get('/movimientos').then((res) => setMovimientos(res.data))
    api.get('/productos').then((res) => setProductos(res.data))
  }

  useEffect(cargar, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      await api.post('/movimientos', { ...form, productoId: Number(form.productoId), cantidad: Number(form.cantidad) })
      setMensaje('Movimiento registrado correctamente')
      setForm({ productoId: '', tipo: 'SALIDA', cantidad: 1, observacion: '' })
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el movimiento')
    }
  }

  return (
    <div className="container">
      <h2>Movimientos de inventario</h2>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label>Producto</label>
            <select name="productoId" value={form.productoId} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.nombre} (disp: {p.cantidad})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>
          <div>
            <label>Cantidad</label>
            <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="1" required />
          </div>
          <div>
            <label>Observación</label>
            <input name="observacion" value={form.observacion} onChange={handleChange} placeholder="Opcional" />
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        {mensaje && <div className="success">{mensaje}</div>}
        <button className="btn" type="submit">Registrar movimiento</button>
      </form>

      <div className="card">
        <h3 className="card-title">Historial</h3>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th><th>Observación</th></tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.fecha).toLocaleString('es-CO')}</td>
                <td>{m.producto?.codigo} - {m.producto?.nombre}</td>
                <td>
                  <span className={`badge badge-${m.tipo.toLowerCase()}`}>
                    {m.tipo}
                  </span>
                </td>
                <td>{m.cantidad}</td>
                <td>{m.usuario?.nombreCompleto}</td>
                <td>{m.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
