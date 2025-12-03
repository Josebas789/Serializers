import { useEffect, useState } from 'react'
import { api } from '../api'
import PhotoForm from './PhotoForm'
import AlbumForm from './AlbumForm'
import PhotoEditForm from './PhotoEditForm'
import PhotoDeleteForm from './PhotoDeleteForm'
import './PhotoGallery.css'
import PhotographerForm from './PhotographerForm'

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([])
  const [albums, setAlbums] = useState([])
  const [flippedId, setFlippedId] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [showPhotographerModal, setShowPhotographerModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [photoToEdit, setPhotoToEdit] = useState(null)
  const [photoToDelete, setPhotoToDelete] =useState(null)
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [menuPhotoId, setMenuPhotoId] = useState(null)
  const [draggedPhotoId, setDraggedPhotoId] = useState(null)

  const loadPhotos = async () => {
    try {
      const res = await api.get('photos/')
      setPhotos(res.data)
    } catch (err) {
      console.error('Error cargando fotos', err)
    }
  }

  const loadAlbums = async () => {
    try {
      const res = await api.get('albums/')
      setAlbums(res.data)
    } catch (err) {
      console.error('Error cargando álbumes', err)
    }
  }

  useEffect(() => {
    loadPhotos()
    loadAlbums()
  }, [])

  const handleFlip = (id) => {
    setFlippedId(prev => (prev === id ? null : id))
    setMenuPhotoId(null) 
  }

  const handlePhotoCreated = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev])
    setShowPhotoModal(false)
  }

  const handleAlbumCreated = (album) => {
    setAlbums(prev => [...prev, album])
    setShowAlbumModal(false)
  }

  const handleAlbumClick = (albumId) => {
    setSelectedAlbumId(prev => (prev === albumId ? null : albumId))
  }

  const clearFilter = () => {
    setSelectedAlbumId(null)
  }

  const toggleMenu = (photoId, e) => {
    e.stopPropagation()
    setPhotoToDelete(photoId)
    setMenuPhotoId(prev => (prev === photoId ? null : photoId))
  }

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation()
    setPhotoToDelete(photoId)
    setShowConfirmDelete(true);
  }

  const handlePhotoDeleted = (deletedPhotoId) => {
    setPhotos(prev => prev.filter(p=> p.id !== deletedPhotoId))
    setPhotoToDelete(null)
    setShowConfirmDelete(false)
  }

  const handleEditPhoto = (photo, e) => {
    e.stopPropagation()
    setPhotoToEdit(photo)
    setShowEditModal(true)
    setMenuPhotoId(null)
  }

  const handlePhotoUpdated = (updatedPhoto) => {
    setPhotos(prev =>
      prev.map(p => (p.id === updatedPhoto.id ? updatedPhoto : p))
    )
    setShowEditModal(false)
    setPhotoToEdit(null)
  }

  // Drag & Drop
  const handleDragStart = (photoId) => {
    setDraggedPhotoId(photoId)
  }

  const handleDragOver = (e) => {
    e.preventDefault() 
  }

  const handleDrop = async (targetPhotoId) => {
    if (!draggedPhotoId || draggedPhotoId === targetPhotoId) return

    const currentPhotos = [...photos]
    const fromIndex = currentPhotos.findIndex(p => p.id === draggedPhotoId)
    const toIndex = currentPhotos.findIndex(p => p.id === targetPhotoId)

    if (fromIndex === -1 || toIndex === -1) return


    const [moved] = currentPhotos.splice(fromIndex, 1)
    currentPhotos.splice(toIndex, 0, moved)


    const updated = currentPhotos.map((p, index) => ({
      ...p,
      position: index
    }))

    setPhotos(updated)
    setDraggedPhotoId(null)

    try {
      await Promise.all(
        updated.map(p =>
          api.patch(`photos/${p.id}/`, { position: p.position })
        )
      )
    } catch (err) {
      console.error('Error actualizando posiciones', err.response || err)
      alert('No se pudo guardar el nuevo orden.')
    }
  }


  const displayedPhotos = selectedAlbumId
    ? photos.filter(photo => photo.album === selectedAlbumId)
    : photos

  return (
    <div className="gallery-page">
      {/* Header con botones */}
      <div className="gallery-header">
        <h2>Mis fotos</h2>

        

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="add-button"
            type="button"
            onClick={() => setShowPhotographerModal(true)}
          >
            + Agregar fotógrafo
          </button>

          <button
            className="add-button"
            type="button"
            onClick={() => setShowAlbumModal(true)}
          >
            + Crear álbum
          </button>

          <button
            className="add-button"
            type="button"
            onClick={() => setShowPhotoModal(true)}
          >
            + Agregar foto
          </button>
        </div>
      </div>

      {/* Sección de álbumes */}
      <div className="albums-bar">
        {albums.length === 0 ? (
          <p className="albums-empty">
            Aún no tienes álbumes. Usa <strong>“Crear álbum”</strong> para comenzar.
          </p>
        ) : (
          <>
            <div className="albums-filter-label">
              Filtrar por álbum:
            </div>
            <div className="albums-list">
              {/* Chip "Todos" */}
              <div
                className={`album-card small-card ${selectedAlbumId === null ? 'active' : ''}`}
                onClick={clearFilter}
              >
                <div className="album-icon">⭐</div>
                <div className="album-info">
                  <h3>Todos</h3>
                  <p>Ver todas las fotos</p>
                  <span className="album-count">
                    {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>
              </div>

              {/* Álbumes del usuario */}
              {albums.map(album => {
                const count = photos.filter(p => p.album === album.id).length
                const isActive = selectedAlbumId === album.id

                return (
                  <div
                    key={album.id}
                    className={`album-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleAlbumClick(album.id)}
                  >
                    <div className="album-icon">📁</div>
                    <div className="album-info">
                      <h3>{album.titulo}</h3>
                      <p>{album.descripcion || 'Sin descripción'}</p>
                      <span className="album-count">
                        {count} {count === 1 ? 'foto' : 'fotos'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal para NUEVA FOTO */}
      {showPhotoModal && (
        <div className="modal-backdrop" onClick={() => setShowPhotoModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Nueva foto</h3>
              <button
                className="close-button"
                type="button"
                onClick={() => setShowPhotoModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PhotoForm onPhotoCreated={handlePhotoCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para NUEVO FOTÓGRAFO */}
      {showPhotographerModal && (
        <div className="modal-backdrop" onClick={() => setShowPhotographerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo fotógrafo</h3>
              <button
                className="close-button"
                type="button"
                onClick={() => setShowPhotographerModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <PhotographerForm
                onPhotographerCreated={() => {}}
                onClose={() => setShowPhotographerModal(false)}
              />
            </div>
          </div>
        </div>
      )}


      {/* Modal para NUEVO ÁLBUM */}
      {showAlbumModal && (
        <div className="modal-backdrop" onClick={() => setShowAlbumModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Nuevo álbum</h3>
              <button
                className="close-button"
                type="button"
                onClick={() => setShowAlbumModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <AlbumForm onAlbumCreated={handleAlbumCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para EDITAR FOTO */}
      {showEditModal && photoToEdit && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Editar foto</h3>
              <button
                className="close-button"
                type="button"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PhotoEditForm
                photo={photoToEdit}
                onPhotoUpdated={handlePhotoUpdated}
                onClose={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && photoToDelete && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDelete(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>¿Seguro que desea eliminar ésta foto?</h3>
              <button
                className="close-button"
                type="button"
                onClick={() => setShowConfirmDelete(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PhotoDeleteForm
                photo = {photoToDelete}
                onClose={() => setShowConfirmDelete(false)}
                onPhotoDeleted={handlePhotoDeleted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Galería de fotos */}
      <div className="gallery-wrapper">
        <div className="gallery-container">
          {displayedPhotos.map(photo => (
            <div
              key={photo.id}
              className={`photo-card size-${photo.size} ${flippedId === photo.id ? 'flipped' : ''}`}
              onClick={() => handleFlip(photo.id)}
              draggable
              onDragStart={() => handleDragStart(photo.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(photo.id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <img src={photo.imagen_url} alt={photo.titulo} />
                  <div className="card-title">
                    {photo.titulo}
                  </div>
                </div>
                <div className="card-back">
                  {/* Botón menú ⋮ */}
                  <button
                    type="button"
                    className="card-menu-button"
                    onClick={(e) => toggleMenu(photo.id, e)}
                  >
                    ⋮
                  </button>

                  {/* Menú contextual */}
                  {menuPhotoId === photo.id && (
                    <div
                      className="card-menu"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleEditPhoto(photo, e)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePhoto(photo.id, e)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                  <h3>{photo.titulo}</h3>
                  <p>{photo.descripcion || 'Sin descripción'}</p>
                  <p><strong>Álbum:</strong> {photo.album_nombre}</p>
                  <p><strong>Fotógrafo:</strong> {photo.photographer_nombre}</p>
                  {photo.destacado && <span className="badge">Destacado</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayedPhotos.length === 0 && (
          <p className="empty-msg">No hay fotos para mostrar.</p>
        )}
      </div>
    </div>
  )
}