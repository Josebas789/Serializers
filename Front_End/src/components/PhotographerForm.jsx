import { useState } from 'react'
import { api } from '../api'

export default function PhotographerForm({ onPhotographerCreated, onClose }) {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) return

    try {
      setLoading(true)

      const res = await api.post('photographers/', {
        nombre: nombre.trim(),
      })

      if (onPhotographerCreated) {
        onPhotographerCreated(res.data)
      }

      setNombre('')
      if (onClose) onClose()
    } catch (err) {
      console.error('Error creando fotógrafo', err.response || err)
      setError('No se pudo crear el fotógrafo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      {error && <p className="modal-error">{error}</p>}

      <div className="form-group">
        <label htmlFor="photographer-name" className="form-label">
          Nombre del fotógrafo
        </label>
        <input
          id="photographer-name"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Ana Pérez"
          required
          className="form-input"
        />
      </div>

      <div className="modal-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
