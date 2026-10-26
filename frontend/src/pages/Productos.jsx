import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'

const emptyForm = {
  codigo: '', nombre: '', categoriaId: '', rangoTallaId: '',
  colorPrenda: '', cantidad: 0, stockMinimo: 5, ubicacion: '', precio: '',
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [rangos, setRangos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const { isAdmin } = useAuth()

  const cargarTodo = () => {
    api.get('/productos').then((res) => setProductos(res.data))
    api.get('/categorias').then((res) => setCategorias(res.data))
    api.get('/rangos-talla').then((res) => setRangos(res.data))
  }

  useEffect(cargarTodo, [])

  const rangoDe = (id) => rangos.find((r) => r.id === id)
  const categoriaDe = (id) => categorias.find((c) => c.id === id)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      categoriaId: Number(form.categoriaId),
      rangoTallaId: Number(form.rangoTallaId),
      cantidad: Number(form.cantidad),
      stockMinimo: Number(form.stockMinimo),
      precio: Number(form.precio),
    }
    try {
      if (editId) {
        await api.put(`/productos/${editId}`, payload)
      } else {
        await api.post('/productos', payload)
      }
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el producto')
    }
  }

  const editar = (p) => {
    setForm({
      codigo: p.codigo, nombre: p.nombre, categoriaId: p.categoria.id, rangoTallaId: p.rangoTalla.id,
      colorPrenda: p.colorPrenda || '', cantidad: p.cantidad, stockMinimo: p.stockMinimo,
      ubicacion: p.ubicacion || '', precio: p.precio,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/productos/${id}`)
    cargarTodo()
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Productos</h2>
        {isAdmin && (
          <button className="btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}>
            {showForm ? 'Cancelar' : '+ Nuevo producto'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Código</label>
              <input name="codigo" value={form.codigo} onChange={handleChange} required disabled={!!editId} />
            </div>
            <div>
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div>
              <label>Categoría</label>
              <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label>Rango de talla (código de color)</label>
              <select name="rangoTallaId" value={form.rangoTallaId} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {rangos.map((r) => <option key={r.id} value={r.id}>{r.nombre} - {r.colorNombre}</option>)}
              </select>
            </div>
            <div>
              <label>Color de la prenda</label>
              <input name="colorPrenda" value={form.colorPrenda} onChange={handleChange} />
            </div>
            <div>
              <label>Ubicación</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Estante A - Nivel 2" />
            </div>
            <div>
              <label>Cantidad inicial</label>
              <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="0" disabled={!!editId} />
            </div>
            <div>
              <label>Stock mínimo</label>
              <input type="number" name="stockMinimo" value={form.stockMinimo} onChange={handleChange} min="0" />
            </div>
            <div>
              <label>Precio</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange} min="0" step="100" required />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit">{editId ? 'Actualizar' : 'Guardar producto'}</button>
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Nombre</th><th>Categoría</th><th>Talla</th><th>Cantidad</th><th>Ubicación</th><th>Precio</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria?.nombre}</td>
                <td>
                  <span className="badge" style={{ background: p.rangoTalla?.colorHex }}>
                    {p.rangoTalla?.nombre}
                  </span>
                </td>
                <td className={p.cantidad <= p.stockMinimo ? "stock-bajo" : undefined}>
                  {p.cantidad}
                </td>
                <td>{p.ubicacion}</td>
                <td>${Number(p.precio).toLocaleString('es-CO')}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-secondary" onClick={() => editar(p)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => eliminar(p.id)}>Eliminar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
