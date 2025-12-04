import { Plus, FolderOpen, Layers, X } from 'lucide-react'

export default function AlbumFilter({ albums, selectedAlbumId, onSelectAlbum, onNewAlbum, onDeleteAlbum }) {
  return (
    <div className="w-full mb-6 space-y-2">
      <div className="flex justify-between items-end px-1">
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Layers size={16} /> Álbumes
        </h3>
        {/* Botón Crear Álbum (Pequeño) */}
        <button 
          onClick={onNewAlbum}
          className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Lista Horizontal con Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
        
        {/* Opción "Todos" */}
        <button
          onClick={() => onSelectAlbum(null)}
          className={`
            snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border
            ${selectedAlbumId === null 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'}
          `}
        >
          Todas las fotos
        </button>

        {/* Lista de Álbumes */}
        {albums.map((album) => (
          <div key={album.id} className="relative group snap-start shrink-0">
            <button
              onClick={() => onSelectAlbum(album.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 pr-8
                ${selectedAlbumId === album.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'}
              `}
            >
              <FolderOpen size={16} />
              {album.titulo}
            </button>
            {/* Botón X para borrar (visible en hover) */}
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteAlbum(album); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar álbum"
            >
              <X size={14} /> 
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}