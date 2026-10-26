import { useEffect, useState } from 'react'
import api from '../api/client'

const emptyForm = { username: '', password: '', nombreCompleto: '', rol: 'VENDEDOR', activo: true }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => api.get('/usuarios').then((res) => setUsuarios(res.data))
  useEffect(() => { cargar() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, form)
      } else {
        await api.post('/usuarios', form)
      }
      setForm(emptyForm)
      setEditId(null)
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el usuario')
    }
  }

  const editar = (u) => {
    setForm({ username: u.username, password: '', nombreCompleto: u.nombreCompleto, rol: u.rol, activo: u.activo })
    setEditId(u.id)
    setError('')
  }

  const cancelarEdicion = () => {
    setForm(emptyForm)
    setEditId(null)
    setError('')
  }

  const cambiarEstado = async (u) => {
    try {
      await api.patch(`/usuarios/${u.id}/estado`, { activo: !u.activo })
      cargar()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar el estado')
    }
  }

  return (
    <div className="container">
      <h2>Usuarios</h2>
      <p className="text-muted">Crea, edita y activa o desactiva los usuarios que pueden entrar al sistema.</p>

      <form className="card" onSubmit={handleSubmit}>
        <h3 className="card-title">{editId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <div className="form-grid">
          <div>
            <label>Usuario</label>
            <input name="username" value={form.username} onChange={handleChange} required disabled={!!editId} />
          </div>
          <div>
            <label>Nombre completo</label>
            <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required />
          </div>
          <div>
            <label>Rol</label>
            <select name="rol" value={form.rol} onChange={handleChange}>
              <option value="VENDEDOR">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div>
            <label>{editId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editId ? 'Dejar en blanco para no cambiarla' : ''}
              required={!editId}
            />
          </div>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
          <span>Usuario activo (puede iniciar sesión)</span>
        </label>

        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">{editId ? 'Guardar cambios' : 'Crear usuario'}</button>
        {editId && (
          <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.nombreCompleto}</td>
                <td>{u.rol}</td>
                <td>
                  <span className={`badge ${u.activo ? "badge-activo" : "badge-inactivo"}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => editar(u)}>Editar</button>
                  <button className={u.activo ? 'btn btn-danger' : 'btn'} onClick={() => cambiarEstado(u)}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
