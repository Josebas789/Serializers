import { useEffect, useState } from 'react'
import Login from './components/Login'
import PhotoGallery from './components/PhotoGallery'
import { setAuthToken } from './api'
import './index.css'

function App() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (saved) {
      setToken(saved)
      setAuthToken(saved)
    }
  }, [])

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem('token')
  }

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <h1>Galería Fotográfica</h1>
        {token && (
          <button onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </header>

      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <PhotoGallery />
      )}
    </div>
  )
}

export default App
