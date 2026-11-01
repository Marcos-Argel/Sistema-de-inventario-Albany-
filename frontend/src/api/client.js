import axios from 'axios'

// En desarrollo y con Docker se usa '/api' (proxy de Vite o de nginx).
// En Render, VITE_API_URL apunta al backend, por ejemplo https://albany-backend.onrender.com
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const api = axios.create({
  baseURL: `${API_URL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('albany_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('albany_token')
      localStorage.removeItem('albany_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
