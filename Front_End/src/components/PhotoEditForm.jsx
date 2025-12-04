import { useEffect, useState } from 'react'
import { api } from '../api'
import { UploadCloud, FileImage, Link as LinkIcon } from 'lucide-react'

export default function PhotoEditForm({ photo, onPhotoUpdated }) {
  const [titulo, setTitulo] = useState(photo.titulo || '')
  const [descripcion, setDescripcion] = useState(photo.descripcion || '')
  const [size, setSize] = useState(photo.size || 'M')
  const [album, setAlbum] = useState(photo.album || '')
  const [photographer, setPhotographer] = useState(photo.photographer || '')
  const [destacado, setDestacado] = useState(photo.destacado || false)
  const [position, setPosition] = useState(photo.position || 0)

  // Lógica de Imagen (Solo para reemplazar)
  const [changeImage, setChangeImage] = useState(false)
  const [mode, setMode] = useState('url')
  const [imagenUrl, setImagenUrl] = useState('')
  const [imagenFile, setImagenFile] = useState(null)

  const [albums, setAlbums] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar listas de selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsRes, photogsRes] = await Promise.all([
          api.get('albums/'),
          api.get('photographers/')
        ])
        setAlbums(albumsRes.data.results || albumsRes.data)
        setPhotographers(photogsRes.data.results || photogsRes.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('titulo', titulo)
    formData.append('descripcion', descripcion)
    formData.append('size', size)
    formData.append('album', album)
    formData.append('photographer', photographer)
    formData.append('destacado', destacado)
    formData.append('position', position)

    // Solo enviamos imagen si el usuario decidió cambiarla
    if (changeImage) {
      if (mode === 'url' && imagenUrl) {
        formData.append('imagen_url', imagenUrl)
        formData.append('imagen_file', '') // Limpiar el archivo anterior si pasamos a URL
      } else if (mode === 'file' && imagenFile) {
        formData.append('imagen_file', imagenFile)
        formData.append('imagen_url', '') // Limpiar la URL anterior si pasamos a archivo
      }
    }

    try {
      setLoading(true)
      // Usamos PUT o PATCH. PATCH es mejor para actualizaciones parciales.
      const res = await api.patch(`photos/${photo.id}/`, formData)
      onPhotoUpdated(res.data)
    } catch (err) {
      console.error(err)
      alert('Error al actualizar la foto')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2.5 outline-none transition-all"
  const labelClass = "block mb-1 text-xs font-medium text-slate-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Título */}
      <div>
        <label className={labelClass}>Título</label>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputClass} required />
      </div>

      {/* SECCIÓN DE IMAGEN */}
      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-slate-400">Imagen Actual</label>
          <button 
            type="button" 
            onClick={() => setChangeImage(!changeImage)}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
          >
            {changeImage ? 'Cancelar cambio' : 'Cambiar imagen'}
          </button>
        </div>

        {!changeImage ? (
          <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-600">
            <img src={photo.imagen_url || photo.imagen_file} alt="Preview" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                Manteniendo imagen actual
              </span>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex mb-2 bg-slate-900 rounded-lg p-1 border border-slate-600">
              <button type="button" onClick={() => setMode('url')} className={`flex-1 py-1 text-xs rounded-md transition-colors ${mode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>URL</button>
              <button type="button" onClick={() => setMode('file')} className={`flex-1 py-1 text-xs rounded-md transition-colors ${mode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Archivo</button>
            </div>

            {mode === 'url' ? (
              <input type="url" value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} className={inputClass} placeholder="Nueva URL..." />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-700/50">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  {imagenFile ? (
                    <>
                      <FileImage className="w-6 h-6 mb-1 text-green-500" />
                      <p className="text-xs text-slate-300">{imagenFile.name}</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                      <p className="text-xs text-slate-400">Click para seleccionar</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={e => setImagenFile(e.target.files[0])} />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Selects */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Álbum</label>
          <select value={album} onChange={e => setAlbum(e.target.value)} className={inputClass} required>
            <option value="">Seleccionar...</option>
            {albums.map(a => <option key={a.id} value={a.id}>{a.titulo}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Fotógrafo</label>
          <select value={photographer} onChange={e => setPhotographer(e.target.value)} className={inputClass} required>
            <option value="">Seleccionar...</option>
            {photographers.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea rows="2" value={descripcion} onChange={e => setDescripcion(e.target.value)} className={inputClass} />
      </div>

      <div className="flex items-center justify-between">
        <div>
           <label className={labelClass}>Tamaño</label>
           <select value={size} onChange={e => setSize(e.target.value)} className={`${inputClass} w-24`}>
             <option value="S">Pequeño</option>
             <option value="M">Mediano</option>
             <option value="L">Grande</option>
           </select>
        </div>
        
        <label className="flex items-center space-x-2 cursor-pointer mt-4">
          <input type="checkbox" checked={destacado} onChange={e => setDestacado(e.target.checked)} className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded" />
          <span className="text-sm font-medium text-slate-300">Destacado</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 shadow-lg">
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}