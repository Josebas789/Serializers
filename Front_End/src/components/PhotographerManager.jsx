import { useEffect, useState } from 'react'
import { api } from '../api'
import { Trash2, User } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmationModal from './ConfirmationModal'

export default function PhotographerManager({ onClose }) {
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [photographerToDelete, setPhotographerToDelete] = useState(null)

  const loadPhotographers = async () => {
    try {
      const res = await api.get('photographers/')
      setPhotographers(res.data.results || res.data)
    } catch (err) {
      console.error(err)
      toast.error('Error cargando fotógrafos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPhotographers()
  }, [])

  const handleDelete = async () => {
    if (!photographerToDelete) return
    try {
      await api.delete(`photographers/${photographerToDelete.id}/`)
      setPhotographers(prev => prev.filter(p => p.id !== photographerToDelete.id))
      toast.success('Fotógrafo eliminado')
      setPhotographerToDelete(null)
    } catch (err) {
      console.error(err)
      toast.error('No se puede eliminar (probablemente tiene fotos asociadas)')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold text-white mb-4">Gestionar Fotógrafos</h2>
        
        {loading ? (
          <div className="text-center py-4 text-slate-400">Cargando...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {photographers.length === 0 ? (
               <p className="text-slate-500 text-center text-sm">No hay fotógrafos registrados.</p>
            ) : (
              photographers.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-700 p-2 rounded-full"><User size={16} className="text-indigo-400" /></div>
                    <span className="text-slate-200 text-sm font-medium">{p.nombre}</span>
                  </div>
                  <button 
                    onClick={() => setPhotographerToDelete(p)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!photographerToDelete}
        onClose={() => setPhotographerToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Fotógrafo"
        message={`¿Eliminar a "${photographerToDelete?.nombre}"? Las fotos asociadas quedarán sin autor.`}
        confirmText="Eliminar"
      />
    </div>
  )
}