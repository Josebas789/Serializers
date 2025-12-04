import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api/'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Función auxiliar para emitir evento de logout
function triggerLogout() {
  window.dispatchEvent(new Event('auth:logout'))
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si recibimos 401 (No autorizado) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = res.data
          localStorage.setItem('token', access)
          setAuthToken(access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
          
        } catch (refreshError) {
          console.log('Refresh token fallido, cerrando sesión...')
          triggerLogout()
        }
      } else {
        triggerLogout()
      }
    }
    return Promise.reject(error)
  }
)