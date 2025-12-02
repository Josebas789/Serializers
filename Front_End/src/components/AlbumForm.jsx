import { useState } from 'react'
import { api } from '../api'

export default function AlbumForm({ onAlbumCreated }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!titulo) {
      setError('El título es obligatorio')
      return
    }

    const payload = {
      titulo,
      descripcion,
    }

    try {
      setLoading(true)
      const res = await api.post('albums/', payload)
      onAlbumCreated(res.data)
      setTitulo('')
      setDescripcion('')
      setError('')
    } catch (err) {
      console.error('Error creando álbum', err.response || err)
      setError('No se pudo crear el álbum.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="photo-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label>
        Título del álbum
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </label>

      <label>
        Descripción
        <textarea
          rows={3}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear álbum'}
      </button>
    </form>
  )
}
