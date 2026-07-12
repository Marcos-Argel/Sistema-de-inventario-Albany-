import { useEffect, useState } from 'react'
import api from '../api/client'

const emptyRango = { nombre: '', colorNombre: '', colorHex: '#F5C4B3', orden: 1 }
const emptyCategoria = { nombre: '', descripcion: '' }

export default function Codificacion() {
  const [rangos, setRangos] = useState([])
  const [rangoForm, setRangoForm] = useState(emptyRango)
  const [rangoEditId, setRangoEditId] = useState(null)
  const [rangoError, setRangoError] = useState('')

  const [categorias, setCategorias] = useState([])
  const [categoriaForm, setCategoriaForm] = useState(emptyCategoria)
  const [categoriaEditId, setCategoriaEditId] = useState(null)
  const [categoriaError, setCategoriaError] = useState('')

  const cargarRangos = () => api.get('/rangos-talla').then((res) => setRangos(res.data))
  const cargarCategorias = () => api.get('/categorias').then((res) => setCategorias(res.data))

  useEffect(() => {
    cargarRangos()
    cargarCategorias()
  }, [])

  // ---- Rangos de talla ----
  const handleRangoChange = (e) => setRangoForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleRangoSubmit = async (e) => {
    e.preventDefault()
    setRangoError('')
    try {
      const payload = { ...rangoForm, orden: Number(rangoForm.orden) }
      if (rangoEditId) {
        await api.put(`/rangos-talla/${rangoEditId}`, payload)
      } else {
        await api.post('/rangos-talla', payload)
      }
      setRangoForm(emptyRango)
      setRangoEditId(null)
      cargarRangos()
    } catch (err) {
      setRangoError(err.response?.data?.mensaje || 'Error al guardar el rango de talla')
    }
  }

  const editarRango = (r) => {
    setRangoForm({ nombre: r.nombre, colorNombre: r.colorNombre, colorHex: r.colorHex, orden: r.orden })
    setRangoEditId(r.id)
    setRangoError('')
  }

  const cancelarEdicionRango = () => {
    setRangoForm(emptyRango)
    setRangoEditId(null)
    setRangoError('')
  }

  const eliminarRango = async (id) => {
    if (!confirm('¿Eliminar este rango de talla?')) return
    setRangoError('')
    try {
      await api.delete(`/rangos-talla/${id}`)
      cargarRangos()
    } catch (err) {
      setRangoError(err.response?.data?.mensaje || 'Error al eliminar el rango de talla')
    }
  }

  // ---- Categorías ----
  const handleCategoriaChange = (e) => setCategoriaForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCategoriaSubmit = async (e) => {
    e.preventDefault()
    setCategoriaError('')
    try {
      if (categoriaEditId) {
        await api.put(`/categorias/${categoriaEditId}`, categoriaForm)
      } else {
        await api.post('/categorias', categoriaForm)
      }
      setCategoriaForm(emptyCategoria)
      setCategoriaEditId(null)
      cargarCategorias()
    } catch (err) {
      setCategoriaError(err.response?.data?.mensaje || 'Error al guardar la categoría')
    }
  }

  const editarCategoria = (c) => {
    setCategoriaForm({ nombre: c.nombre, descripcion: c.descripcion || '' })
    setCategoriaEditId(c.id)
    setCategoriaError('')
  }

  const cancelarEdicionCategoria = () => {
    setCategoriaForm(emptyCategoria)
    setCategoriaEditId(null)
    setCategoriaError('')
  }

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    setCategoriaError('')
    try {
      await api.delete(`/categorias/${id}`)
      cargarCategorias()
    } catch (err) {
      setCategoriaError(err.response?.data?.mensaje || 'Error al eliminar la categoría')
    }
  }

  return (
    <div className="container">
      <h2>Tabla de codificación por colores</h2>
      <p className="text-muted">Base del sistema de clasificación inteligente: cada rango de talla tiene un color de marbete asociado.</p>

      <form className="card" onSubmit={handleRangoSubmit}>
        <h3 style={{ marginTop: 0 }}>{rangoEditId ? 'Editar rango de talla' : 'Nuevo rango de talla'}</h3>
        <div className="form-grid">
          <div>
            <label>Rango de talla</label>
            <input name="nombre" value={rangoForm.nombre} onChange={handleRangoChange} placeholder="Ej: 0-3 meses" required />
          </div>
          <div>
            <label>Nombre del color</label>
            <input name="colorNombre" value={rangoForm.colorNombre} onChange={handleRangoChange} placeholder="Ej: Rosado" required />
          </div>
          <div>
            <label>Color (marbete)</label>
            <input type="color" name="colorHex" value={rangoForm.colorHex} onChange={handleRangoChange} style={{ height: 38 }} />
          </div>
          <div>
            <label>Orden en estantería</label>
            <input type="number" name="orden" value={rangoForm.orden} onChange={handleRangoChange} min="1" />
          </div>
        </div>
        {rangoError && <div className="error">{rangoError}</div>}
        <button className="btn" type="submit">{rangoEditId ? 'Guardar cambios' : 'Agregar rango'}</button>
        {rangoEditId && (
          <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={cancelarEdicionRango}>
            Cancelar
          </button>
        )}
      </form>

      <div className="card">
        <table>
          <thead><tr><th>Color</th><th>Rango de talla</th><th>Nombre del color</th><th>Orden</th><th></th></tr></thead>
          <tbody>
            {rangos.map((r) => (
              <tr key={r.id}>
                <td><span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: r.colorHex }} /></td>
                <td>{r.nombre}</td>
                <td>{r.colorNombre}</td>
                <td>{r.orden}</td>
                <td>
                  <button className="btn btn-secondary" style={{ marginRight: 6 }} onClick={() => editarRango(r)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => eliminarRango(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 40 }}>Categorías de producto</h2>
      <p className="text-muted">Ej: Body, Pijama, Vestido, Conjunto, Calzado. Se usan al registrar productos nuevos.</p>

      <form className="card" onSubmit={handleCategoriaSubmit}>
        <h3 style={{ marginTop: 0 }}>{categoriaEditId ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <div className="form-grid">
          <div>
            <label>Nombre</label>
            <input name="nombre" value={categoriaForm.nombre} onChange={handleCategoriaChange} placeholder="Ej: Conjunto" required />
          </div>
          <div>
            <label>Descripción (opcional)</label>
            <input name="descripcion" value={categoriaForm.descripcion} onChange={handleCategoriaChange} placeholder="Ej: Conjuntos de dos o más piezas" />
          </div>
        </div>
        {categoriaError && <div className="error">{categoriaError}</div>}
        <button className="btn" type="submit">{categoriaEditId ? 'Guardar cambios' : 'Agregar categoría'}</button>
        {categoriaEditId && (
          <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={cancelarEdicionCategoria}>
            Cancelar
          </button>
        )}
      </form>

      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Descripción</th><th></th></tr></thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td className="text-muted">{c.descripcion}</td>
                <td>
                  <button className="btn btn-secondary" style={{ marginRight: 6 }} onClick={() => editarCategoria(c)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => eliminarCategoria(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && <tr><td colSpan={3} className="text-muted">No hay categorías registradas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
