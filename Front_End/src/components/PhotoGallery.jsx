import { useEffect, useState, useCallback } from 'react'
import { api } from '../api'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight, LogOut, Search, Settings, UserPlus, X } from 'lucide-react'
import PhotoCard from './PhotoCard'
import PhotoForm from './PhotoForm'
import AlbumFilter from './AlbumFilter'
import AlbumForm from './AlbumForm'
import ConfirmationModal from './ConfirmationModal'
import PhotoEditForm from './PhotoEditForm'
import PhotographerForm from './PhotographerForm'
import PhotographerManager from './PhotographerManager'

export default function PhotoGallery() {
  const { logout } = useAuth()
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

  const [searchQuery, setSearchQuery] = useState('') // <--- NUEVO
  const [showPhotographerManager, setShowPhotographerManager] = useState(false) // <--- NUEVO
  const [albumToDelete, setAlbumToDelete] = useState(null) // <--- NUEVO (Para borrar álbumes)

  // --- CARGA DE DATOS ---
  const loadPhotos = useCallback(async (url = 'photos/') => {
    setLoading(true)
    try {
      
      let finalUrl = url
      if (searchQuery && url === 'photos/') {
         finalUrl = `photos/?search=${encodeURIComponent(searchQuery)}`
      } 
      // Si estamos filtrando por álbum, agregamos search también
      else if (searchQuery && url.includes('album=')) {
         finalUrl += `&search=${encodeURIComponent(searchQuery)}`
      }

      const res = await api.get(finalUrl)
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
  const handleSearch = (e) => {
    e.preventDefault()
    // Al buscar, reseteamos álbum y paginación
    setCurrentAlbumId(null)
    const url = `photos/?search=${encodeURIComponent(searchQuery)}`
    loadPhotos(url)
  }

  const handleClearSearch = () => {
    setSearchQuery('') // Limpia el estado del texto
    loadPhotos()       // Recarga todas las fotos (sin filtros)
  }

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

  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return
    try {
      await api.delete(`albums/${albumToDelete.id}/`)
      setAlbums(prev => prev.filter(a => a.id !== albumToDelete.id))
      // Si estábamos viendo ese álbum, volver a "Todos"
      if (currentAlbumId === albumToDelete.id) {
          handleFilterByAlbum(null)
      }
      toast.success('Álbum eliminado')
    } catch (err) {
      toast.error('No se pudo eliminar el álbum')
    } finally {
      setAlbumToDelete(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-80px)]">
      
      {/* HEADER y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mi Galería</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {currentAlbumId 
              ? `Viendo álbum: ${albums.find(a => a.id === currentAlbumId)?.titulo || '...'}`
              : 'Todas las fotos recientes'}
          </p>
        </div>
        
        {/* BARRA DE BÚSQUEDA */}
        <form onSubmit={handleSearch} className="relative w-full md:w-64 order-last md:order-none">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
           
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Buscar fotos..."
             // Nota el cambio: pr-10 (padding right) para dejar espacio a la X
             className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-10 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />

           {/* Botón X que aparece solo si hay texto */}
           {searchQuery && (
             <button
               type="button"
               onClick={handleClearSearch}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-slate-700/50 rounded-full p-0.5 transition-colors"
               title="Limpiar búsqueda"
             >
               <X size={14} />
             </button>
           )}
        </form>

        <div className="flex flex-wrap gap-3 items-center">
          <button 
             onClick={() => setShowPhotographerModal(true)}
             className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-1 hover:bg-slate-800 rounded-lg"
             title="Crear nuevo fotógrafo"
           >
             <UserPlus size={16} /> <span className="hidden sm:inline">Nuevo</span>
           </button>

           {/* Botón Gestionar Fotógrafos (Reemplaza al "Añadir" simple anterior) */}
           <button 
             onClick={() => setShowPhotographerManager(true)}
             className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700"
           >
             <Settings size={14} /> Fotógrafos
           </button>

          {/* Botón Nueva Foto */}
          <button 
            onClick={() => setShowPhotoModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Nueva Foto
          </button>

          {/* === BOTÓN CERRAR SESIÓN === */}
          <button 
            onClick={logout}
            className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-full transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <AlbumFilter albums={albums} selectedAlbumId={currentAlbumId} onSelectAlbum={handleFilterByAlbum} onNewAlbum={() => setShowAlbumModal(true)} onDeleteAlbum={(album) => setAlbumToDelete(album)} />

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

      {/* MODAL GESTOR FOTÓGRAFOS */}
    {showPhotographerManager && (
       <PhotographerManager onClose={() => setShowPhotographerManager(false)} />
    )}

    {/* MODAL CONFIRMACIÓN ÁLBUM */}
    <ConfirmationModal 
        isOpen={!!albumToDelete}
        onClose={() => setAlbumToDelete(null)}
        onConfirm={handleDeleteAlbum}
        title="Eliminar Álbum"
        message={`¿Eliminar álbum "${albumToDelete?.titulo}"? Las fotos dentro también se borrarán.`}
        confirmText="Sí, borrar todo"
    />

    </div>
  )
}