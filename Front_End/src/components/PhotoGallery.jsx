import { useEffect, useState, useCallback } from 'react'
import { api } from '../api'
import { toast } from 'sonner'
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import PhotoCard from './PhotoCard'
import PhotoForm from './PhotoForm'
import AlbumFilter from './AlbumFilter'
import AlbumForm from './AlbumForm'
import ConfirmationModal from './ConfirmationModal'
import PhotoEditForm from './PhotoEditForm'
import PhotographerForm from './PhotographerForm'

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [flippedId, setFlippedId] = useState(null)
  
  // Estados de Paginación y Filtro
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)
  const [currentAlbumId, setCurrentAlbumId] = useState(null)

  // Modales
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null) // <--- Estado para el modal de borrar

  const [showPhotographerModal, setShowPhotographerModal] = useState(false)
  
  const [photoToEdit, setPhotoToEdit] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estado para Drag & Drop
  const [draggedPhotoId, setDraggedPhotoId] = useState(null)

  // --- CARGA DE DATOS ---
  const loadPhotos = useCallback(async (url = 'photos/') => {
    setLoading(true)
    try {
      const res = await api.get(url)
      const data = res.data
      
      if (data.results) {
        // Ordenamos por 'position' para asegurar consistencia visual
        const sorted = data.results.sort((a, b) => a.position - b.position)
        setPhotos(sorted)
        setNextPage(data.next)
        setPrevPage(data.previous)
      } else {
        setPhotos(data)
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status !== 401) toast.error('Error cargando fotos')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAlbums = async () => {
    try {
      const res = await api.get('albums/')
      setAlbums(res.data.results || res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadPhotos()
    loadAlbums()
  }, [loadPhotos])

  // --- HANDLERS DRAG & DROP ---
  const handleDragStart = (e, photoId) => {
    setDraggedPhotoId(photoId)
    // Efecto visual opcional en el elemento arrastrado
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault() // Necesario para permitir el drop
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e, targetPhotoId) => {
    e.preventDefault()
    if (!draggedPhotoId || draggedPhotoId === targetPhotoId) return

    // 1. Reordenar localmente (Optimistic UI)
    const currentPhotos = [...photos]
    const fromIndex = currentPhotos.findIndex(p => p.id === draggedPhotoId)
    const toIndex = currentPhotos.findIndex(p => p.id === targetPhotoId)

    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = currentPhotos.splice(fromIndex, 1)
    currentPhotos.splice(toIndex, 0, moved)

    // Reasignar posiciones visuales (0, 1, 2...)
    const updated = currentPhotos.map((p, index) => ({
      ...p,
      position: index
    }))

    setPhotos(updated)
    setDraggedPhotoId(null)

    // 2. Persistir en Backend
    try {
        // Enviamos las actualizaciones en paralelo
        await Promise.all(
            updated.map(p => 
                api.patch(`photos/${p.id}/`, { position: p.position })
            )
        )
        // Opcional: toast.success('Orden actualizado')
    } catch (err) {
        console.error('Error guardando orden', err)
        toast.error('Error al guardar el nuevo orden')
        loadPhotos() // Revertir si falla
    }
  }

  // --- HANDLERS OTROS ---
  const handleFilterByAlbum = (albumId) => {
    setCurrentAlbumId(albumId)
    const url = albumId ? `photos/?album=${albumId}` : 'photos/'
    loadPhotos(url)
  }

  const handlePageChange = (url) => { if (url) loadPhotos(url) }

  const handleFlip = (id) => { setFlippedId(prev => (prev === id ? null : id)) }

  // Abre el modal de confirmación
  const handleDeleteClick = (photo) => {
    setPhotoToDelete(photo)
  }

  // Ejecuta el borrado real
  const confirmDelete = async () => {
    if (!photoToDelete) return
    try {
      await api.delete(`photos/${photoToDelete.id}/`)
      loadPhotos(currentAlbumId ? `photos/?album=${currentAlbumId}` : 'photos/')
      toast.success('Foto eliminada correctamente')
    } catch (err) {
      toast.error('No se pudo eliminar la foto')
    } finally {
      setPhotoToDelete(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-80px)]">
      
      {/* HEADER y FILTROS (Igual que antes) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mi Galería</h1>
          <p className="text-slate-400 mt-1">
            {currentAlbumId 
              ? `Viendo álbum: ${albums.find(a => a.id === currentAlbumId)?.titulo || '...'}`
              : 'Todas las fotos recientes'}
          </p>
        </div>
        <button onClick={() => setShowPhotoModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95">
          <Plus size={18} /> Nueva Foto
        </button>
        
        <button 
          onClick={() => setShowPhotographerModal(true)}
          className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus size={14} /> Añadir Fotógrafo
        </button>
      </div>

      <AlbumFilter albums={albums} selectedAlbumId={currentAlbumId} onSelectAlbum={handleFilterByAlbum} onNewAlbum={() => setShowAlbumModal(true)} />

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[200px]">
            {photos.length > 0 ? (
              photos.map(photo => (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo} 
                  isFlipped={flippedId === photo.id}
                  onFlip={() => handleFlip(photo.id)}
                  onEdit={() => {
                    setPhotoToEdit(photo)
                    setShowEditModal(true)
                  }}
                  onDelete={() => handleDeleteClick(photo)} // <--- Abre el Modal
                  
                  // Pasamos los handlers de arrastre
                  dragHandlers={{ onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop }}
                />
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
                <ImageIcon className="h-16 w-16 mb-4 opacity-40" />
                <p className="text-lg font-medium">No hay fotos aquí</p>
              </div>
            )}
          </div>

          {/* PAGINACIÓN */}
          {(nextPage || prevPage) && (
            <div className="flex justify-center gap-4 mt-10">
              <button onClick={() => handlePageChange(prevPage)} disabled={!prevPage} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"><ChevronLeft size={18} /> Anterior</button>
              <button onClick={() => handlePageChange(nextPage)} disabled={!nextPage} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors">Siguiente <ChevronRight size={18} /></button>
            </div>
          )}
        </>
      )}

      {/* MODAL DE SUBIDA (Igual que antes) */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-scale-in">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Subir Nueva Foto</h2>
            <PhotoForm onPhotoCreated={(newPhoto) => {
                if (!currentAlbumId && !prevPage) setPhotos([newPhoto, ...photos]);
                else loadPhotos(currentAlbumId ? `photos/?album=${currentAlbumId}` : 'photos/');
                setShowPhotoModal(false);
                toast.success('Foto subida con éxito');
              }} 
            />
          </div>
        </div>
      )}

      {/* MODAL ÁLBUM */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
              <button onClick={() => setShowAlbumModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h2 className="text-xl font-bold text-white mb-4">Crear Álbum</h2>
              <AlbumForm onAlbumCreated={(newAlbum) => { setAlbums([...albums, newAlbum]); setShowAlbumModal(false); toast.success('Álbum creado'); }} />
           </div>
        </div>
      )}

      {/* NUEVO MODAL DE CONFIRMACIÓN */}
      <ConfirmationModal 
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Foto"
        message={`¿Estás seguro que deseas eliminar "${photoToDelete?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
      />

      {/* MODAL EDITAR FOTO */}
      {showEditModal && photoToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Editar Foto</h2>
            <PhotoEditForm 
              photo={photoToEdit}
              onPhotoUpdated={(updatedPhoto) => {
                // Actualizamos la lista localmente
                setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p))
                setShowEditModal(false)
                toast.success('Foto actualizada')
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL FOTÓGRAFO */}
      {showPhotographerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
              <button onClick={() => setShowPhotographerModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h2 className="text-xl font-bold text-white mb-4">Nuevo Fotógrafo</h2>
              <PhotographerForm 
                onPhotographerCreated={() => {
                  setShowPhotographerModal(false)
                  toast.success('Fotógrafo añadido')
                  // Opcional: recargar formulario de fotos si fuera necesario, 
                  // pero como se carga al montar, no es crítico inmediato.
                }}
              />
           </div>
        </div>
      )}

    </div>
  )
}