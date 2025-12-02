import { useEffect, useState } from 'react'
import { api } from '../api'

export default function PhotoForm({ onPhotoCreated }) {
  const [titulo, setTitulo] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [size, setSize] = useState('M')
  const [album, setAlbum] = useState('')
  const [photographer, setPhotographer] = useState('')
  const [destacado, setDestacado] = useState(false)

  const [albums, setAlbums] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      setError('Completa al menos título, URL de imagen, álbum y fotógrafo')
      return
    }

    const payload = {
      titulo: titulo,
      imagen_url: imagenUrl,
      descripcion: descripcion,
      size: size,
      album: album,
      photographer: photographer,
      destacado: destacado,
    }

    try {
      setLoading(true)
      const res = await api.post('photos/', payload)
      onPhotoCreated(res.data)  


      setTitulo('')
      setImagenUrl('')
      setDescripcion('')
      setSize('M')
      setAlbum('')
      setPhotographer('')
      setDestacado(false)
      setError('')
    } catch (err) {
      console.error('Error creando foto', err.response || err)
      const detalle = err.response?.data
      setError('No se pudo crear la foto. Revisa los datos.')
      console.log('Detalle del error:', detalle)
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

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear foto'}
      </button>
    </form>
  )
}
