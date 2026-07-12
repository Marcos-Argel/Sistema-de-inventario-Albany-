import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import unibanLogo from '../assets/uniban-logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-content">
            <img src={unibanLogo} alt="Fundación Uniban" className="login-uniban-logo" />
            <h1 className="login-brand-title">Albany</h1>
            <p className="login-brand-subtitle">Sistema de clasificación e inventario</p>
            <ul className="login-brand-list">
              <li>Codificación inteligente por colores y tallas</li>
              <li>Control digital de inventario en tiempo real</li>
              <li>Etapa productiva &middot; Instituto Técnico Unibán</li>
            </ul>
          </div>
        </div>

        <div className="login-form-side">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-form-title">Bienvenido</h2>
            <p className="login-form-subtitle">Ingresa tus credenciales para continuar</p>

            <div className="login-field">
              <label>Usuario</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                autoFocus
                required
              />
            </div>
            <div className="login-field">
              <label>Contraseña</label>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6.5 0-10-6.5-10-8 0-.83.99-2.68 2.66-4.32M9.9 4.24A10.87 10.87 0 0 1 12 4c6.5 0 10 6.5 10 8a12.8 12.8 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.64-8 10-8 10 8 10 8-3.64 8-10 8-10-8-10-8Z" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="error login-error">{error}</div>}

            <button className="btn login-submit" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
