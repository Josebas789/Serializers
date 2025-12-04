import { useState } from 'react'
import { api } from '../api'

export default function PhotographerForm({ onPhotographerCreated }) {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    try {
      setLoading(true)
      const res = await api.post('photographers/', { nombre: nombre.trim() })
      setNombre('')
      if (onPhotographerCreated) onPhotographerCreated(res.data)
    } catch (err) {
      console.error(err)
      alert('Error al crear fotógrafo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-medium text-slate-400">Nombre del Fotógrafo</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2.5 outline-none"
          placeholder="Ej: Ansel Adams"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg"
      >
        {loading ? 'Guardando...' : 'Añadir Fotógrafo'}
      </button>
    </form>
  )
}