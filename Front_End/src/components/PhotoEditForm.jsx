import { useEffect, useState } from 'react'
import { api } from '../api'

export default function PhotoEditForm({ photo, onPhotoUpdated, onClose }) {
  const [titulo, setTitulo] = useState(photo.titulo || '')
  const [imagenUrl, setImagenUrl] = useState(photo.imagen_url || '')
  const [descripcion, setDescripcion] = useState(photo.descripcion || '')
  const [size, setSize] = useState(photo.size || 'M')
  const [album, setAlbum] = useState(photo.album || '')
  const [photographer, setPhotographer] = useState(photo.photographer || '')
  const [destacado, setDestacado] = useState(photo.destacado || false)

  const [albums, setAlbums] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsRes, photographersRes] = await Promise.all([
          api.get('albums/'),
          api.get('photographers/')
        ])
        setAlbums(albumsRes.data)
        setPhotographers(photographersRes.data)
      } catch (err) {
        console.error('Error cargando álbumes/fotógrafos', err)
        setError('No se pudieron cargar álbumes o fotógrafos')
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!titulo || !imagenUrl || !album || !photographer) {
      setError('Completa título, URL, álbum y fotógrafo')
      return
    }

    const payload = {
      titulo,
      imagen_url: imagenUrl,
      descripcion,
      size,
      album,
      photographer,
      destacado,
    }

    try {
      setLoading(true)
      const res = await api.put(`photos/${photo.id}/`, payload)
      onPhotoUpdated(res.data)
    } catch (err) {
      console.error('Error actualizando foto', err.response || err)
      setError('No se pudo actualizar la foto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="photo-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <div className="form-row">
        <label>
          Título
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
        </label>

        <label>
          URL de la imagen
          <input
            type="text"
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Álbum
          <select
            value={album}
            onChange={e => setAlbum(e.target.value)}
          >
            <option value="">Selecciona un álbum</option>
            {albums.map(a => (
              <option key={a.id} value={a.id}>
                {a.titulo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fotógrafo
          <select
            value={photographer}
            onChange={e => setPhotographer(e.target.value)}
          >
            <option value="">Selecciona un fotógrafo</option>
            {photographers.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Tamaño
          <select
            value={size}
            onChange={e => setSize(e.target.value)}
          >
            <option value="S">Pequeña</option>
            <option value="M">Mediana</option>
            <option value="L">Grande</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={destacado}
            onChange={e => setDestacado(e.target.checked)}
          />
          Destacada
        </label>
      </div>

      <label className="descripcion-label">
        Descripción
        <textarea
          rows={3}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onClose}
          className="secondary-button"
        >
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
