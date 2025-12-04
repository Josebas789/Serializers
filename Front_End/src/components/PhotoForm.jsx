import { useEffect, useState } from 'react'
import { api } from '../api'
import { UploadCloud, FileImage } from 'lucide-react'

export default function PhotoForm({ onPhotoCreated }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [size, setSize] = useState('M')
  const [album, setAlbum] = useState('')
  const [photographer, setPhotographer] = useState('')
  const [destacado, setDestacado] = useState(false)
  
  // Inputs Híbridos
  const [mode, setMode] = useState('url') // 'url' | 'file'
  const [imagenUrl, setImagenUrl] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  
  // Estado para Drag & Drop
  const [isDragging, setIsDragging] = useState(false)

  const [albums, setAlbums] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(false)

  // === ESTE ES EL EFECTO QUE SE HABÍA PERDIDO ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsRes, photogsRes] = await Promise.all([
          api.get('albums/'),
          api.get('photographers/')
        ])
        
        // Manejo robusto de paginación: si viene paginado, usamos .results
        // si no, usamos .data directamente
        const albumsData = albumsRes.data.results || albumsRes.data
        const photogsData = photogsRes.data.results || photogsRes.data

        // Aseguramos que siempre sea un array para evitar errores de .map
        setAlbums(Array.isArray(albumsData) ? albumsData : [])
        setPhotographers(Array.isArray(photogsData) ? photogsData : [])
        
      } catch (err) {
        console.error('Error cargando datos para el formulario:', err)
      }
    }
    fetchData()
  }, [])
  // ===============================================

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación visual
    if (mode === 'url' && !imagenUrl) return
    if (mode === 'file' && !imagenFile) return

    const formData = new FormData()
    formData.append('titulo', titulo)
    formData.append('descripcion', descripcion)
    formData.append('size', size)
    formData.append('album', album)
    formData.append('photographer', photographer)
    formData.append('destacado', destacado)
    // El backend espera un valor numérico por defecto para position
    formData.append('position', 0) 

    // Lógica Híbrida: enviamos lo que el usuario haya seleccionado
    if (mode === 'url') {
      formData.append('imagen_url', imagenUrl)
    } else if (imagenFile) {
      formData.append('imagen_file', imagenFile)
    }

    try {
      setLoading(true)
      const res = await api.post('photos/', formData)
      
      // Limpiamos el formulario tras el éxito
      setTitulo('')
      setDescripcion('')
      setImagenUrl('')
      setImagenFile(null)
      setAlbum('')
      setPhotographer('')
      setDestacado(false)
      
      if (onPhotoCreated) onPhotoCreated(res.data)
      
    } catch (err) {
      console.error('Error al crear la foto:', err)
      alert('Hubo un error al subir la foto. Revisa la consola.')
    } finally {
      setLoading(false)
    }
  }

  // --- NUEVAS FUNCIONES PARA DRAG & DROP ---
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.startsWith('image/')) {
        setImagenFile(droppedFile)
        setMode('file') // Cambiamos automáticamente al modo archivo
        e.dataTransfer.clearData()
      } else {
        alert("Por favor, suelta un archivo de imagen válido.")
      }
    }
  }

  // Clases comunes de Tailwind
  const inputClass = "w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 block p-2.5 outline-none transition-all"
  const labelClass = "block mb-1 text-xs font-medium text-slate-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Título */}
      <div>
        <label className={labelClass}>Título</label>
        <input 
          type="text" 
          value={titulo} onChange={e => setTitulo(e.target.value)} 
          className={inputClass} 
          required 
          placeholder="Un día en la playa..."
        />
      </div>

      {/* SELECCIÓN DE IMAGEN (Tabs + Drag&Drop) */}
      <div>
        <label className={labelClass}>Imagen</label>
        <div className="flex mb-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-1 text-xs rounded-md transition-colors ${mode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            URL Externa
          </button>
          <button 
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-1 text-xs rounded-md transition-colors ${mode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Subir Archivo
          </button>
        </div>

        {mode === 'url' ? (
          <input 
            type="url" 
            value={imagenUrl} 
            onChange={e => setImagenUrl(e.target.value)} 
            className={inputClass}
            placeholder="https://ejemplo.com/foto.jpg"
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700/80'
                }
                ${imagenFile ? 'border-green-500/50 bg-green-500/5' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                {imagenFile ? (
                   <>
                     <FileImage className="w-8 h-8 mb-2 text-green-500" />
                     <p className="text-sm text-slate-200 font-medium truncate max-w-[200px]">
                       {imagenFile.name}
                     </p>
                     <p className="text-xs text-green-400 mt-1">¡Listo para subir!</p>
                   </>
                ) : (
                   <>
                     <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
                     <p className="text-sm text-slate-400">
                       <span className="font-semibold text-indigo-400">Click para subir</span> o arrastra aquí
                     </p>
                     <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG o GIF</p>
                   </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={e => setImagenFile(e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      {/* Selects Grid */}
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

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea 
          rows="2" 
          value={descripcion} 
          onChange={e => setDescripcion(e.target.value)} 
          className={inputClass}
        />
      </div>

      {/* Tamaño y Destacado */}
      <div className="flex items-center justify-between">
        <div>
           <label className={labelClass}>Tamaño Visual</label>
           <select value={size} onChange={e => setSize(e.target.value)} className={`${inputClass} w-32`}>
             <option value="S">Pequeño</option>
             <option value="M">Mediano</option>
             <option value="L">Grande</option>
           </select>
        </div>
        
        <label className="flex items-center space-x-2 cursor-pointer mt-4">
          <input 
            type="checkbox" 
            checked={destacado} 
            onChange={e => setDestacado(e.target.checked)} 
            className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-600 focus:ring-2"
          />
          <span className="text-sm font-medium text-slate-300">Destacado</span>
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4 transition-all shadow-lg"
      >
        {loading ? 'Guardando...' : 'Crear Foto'}
      </button>
    </form>
  )
}