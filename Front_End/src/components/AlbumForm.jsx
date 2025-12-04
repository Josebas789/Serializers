import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AlbumForm({ album = null, onAlbumCreated, onAlbumUpdated }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (album) {
      setTitulo(album.titulo)
      setDescripcion(album.descripcion || '')
    }
  }, [album])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    const payload = { titulo, descripcion }

    try {
      setLoading(true)

      if (album) {
        // Editar
        const res = await api.patch(`albums/${album.id}/`, payload)
        if (onAlbumUpdated) onAlbumUpdated(res.data)
      } else {
        // Crear
        const res = await api.post('albums/', payload)
        if (onAlbumCreated) onAlbumCreated(res.data)
        setTitulo('')
        setDescripcion('')
      }
    } catch (err) {
      console.error(err)
      // Idealmente usamos Toast en el padre, o lanzamos error
      alert(err.response?.data?.detail || 'Error al guardar álbum')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2.5 outline-none transition-all"
  const labelClass = "block mb-1 text-xs font-medium text-slate-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Título del álbum</label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className={inputClass}
          placeholder="Ej: Vacaciones 2024"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Descripción (Opcional)</label>
        <textarea
          rows={3}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          className={inputClass}
          placeholder="Breve descripción..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all shadow-lg mt-2"
      >
        {loading ? 'Guardando...' : (album ? 'Guardar Cambios' : 'Crear Álbum')}
      </button>
    </form>
  )
}