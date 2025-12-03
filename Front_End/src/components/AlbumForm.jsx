import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AlbumForm({ album = null, onAlbumCreated, onAlbumUpdated }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (album) {
      setTitulo(album.titulo)
      setDescripcion(album.descripcion || '')
    }
  }, [album])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!titulo.trim()) {
      setError('El título es obligatorio')
      return
    }

    const payload = {
      titulo,
      descripcion,
    }

    try {
      setLoading(true)

      if (album) {
        // === EDITAR ÁLBUM ===
        const res = await api.patch(`albums/${album.id}/`, payload)
        if (onAlbumUpdated) onAlbumUpdated(res.data)
      } else {
        // === CREAR ÁLBUM ===
        const res = await api.post('albums/', payload)
        if (onAlbumCreated) onAlbumCreated(res.data)
        setTitulo('')
        setDescripcion('')
      }

    } catch (err) {
      console.error('Error guardando álbum', err.response || err)
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('No se pudo guardar el álbum.')
      }
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
        {loading
          ? 'Guardando...'
          : album
            ? 'Guardar cambios'
            : 'Crear álbum'}
      </button>
    </form>
  )
}
