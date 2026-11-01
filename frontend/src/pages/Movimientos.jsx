import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

// Motivos de ajuste manual. La mercancía del proveedor NO va aquí: se registra en Compras.
const MOTIVOS = {
  SALIDA: [
    { value: 'DANADO', label: 'Producto dañado o defectuoso' },
    { value: 'PERDIDA', label: 'Pérdida o faltante' },
    { value: 'CONTEO', label: 'Corrección por conteo físico' },
    { value: 'REGALO', label: 'Regalo o muestra' },
    { value: 'DEVOLUCION_PROVEEDOR', label: 'Devolución al proveedor' },
    { value: 'OTRO', label: 'Otro (explicar en observación)' },
  ],
  ENTRADA: [
    { value: 'DEVOLUCION_CLIENTE', label: 'Devolución de un cliente' },
    { value: 'CONTEO', label: 'Corrección por conteo físico' },
    { value: 'INVENTARIO_INICIAL', label: 'Inventario inicial' },
    { value: 'OTRO', label: 'Otro (explicar en observación)' },
  ],
}

const formInicial = { productoId: '', tipo: 'SALIDA', motivo: '', cantidad: 1, observacion: '' }

export default function Movimientos() {
  const { isAdmin } = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(formInicial)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = () => {
    api.get('/movimientos').then((res) => setMovimientos(res.data))
    api.get('/productos').then((res) => setProductos(res.data))
  }

  useEffect(cargar, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    // Al cambiar el tipo, el motivo anterior ya no aplica
    setForm((f) => (name === 'tipo' ? { ...f, tipo: value, motivo: '' } : { ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    if (form.motivo === 'OTRO' && !form.observacion.trim()) {
      setError('Si el motivo es "Otro", explique en la observación qué pasó')
      return
    }
    try {
      await api.post('/movimientos', { ...form, productoId: Number(form.productoId), cantidad: Number(form.cantidad) })
      setMensaje('Ajuste registrado correctamente')
      setForm(formInicial)
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el ajuste')
    }
  }

  const motivos = MOTIVOS[form.tipo] || []

  return (
    <div className="container">
      <h2>Ajustes e historial de inventario</h2>
      <p className="text-muted text-sm">
        Aquí se registran ajustes que no son compras ni ventas: prendas dañadas, devoluciones,
        correcciones por conteo, etc. Las ventas descuentan el stock solas desde el punto de venta.
        {isAdmin
          ? <> La mercancía que llega del proveedor se registra en <Link to="/compras">Compras</Link>, para que quede la factura y el costo.</>
          : ' La mercancía que llega del proveedor la registra el administrador en Compras.'}
      </p>

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
              <option value="SALIDA">Salida (resta stock)</option>
              {isAdmin && <option value="ENTRADA">Entrada manual (suma stock)</option>}
            </select>
          </div>
          <div>
            <label>Motivo</label>
            <select name="motivo" value={form.motivo} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {motivos.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Cantidad</label>
            <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="1" required />
          </div>
          <div>
            <label>Observación</label>
            <input
              name="observacion"
              value={form.observacion}
              onChange={handleChange}
              maxLength={150}
              placeholder={form.motivo === 'OTRO' ? 'Obligatoria: explique qué pasó' : 'Opcional'}
            />
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        {mensaje && <div className="success">{mensaje}</div>}
        <button className="btn" type="submit">Registrar ajuste</button>
      </form>

      <div className="card">
        <h3 className="card-title">Historial de entradas y salidas</h3>
        <p className="text-muted text-sm">Incluye compras, ventas y ajustes manuales.</p>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th><th>Origen / observación</th></tr>
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
