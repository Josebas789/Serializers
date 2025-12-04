import { motion } from 'framer-motion'
import { Edit2, Trash2, Maximize2 } from 'lucide-react'

export default function PhotoCard({ photo, isFlipped, onFlip, onEdit, onDelete, dragHandlers }) {
  // Mapeo de tamaños a clases de Grid de Tailwind
  const sizeClasses = {
    S: 'col-span-1 row-span-1 h-48',
    M: 'col-span-1 row-span-2 h-96',
    L: 'col-span-2 row-span-2 h-96',
  }

  return (
    <div 
      className={`relative group perspective-1000 ${sizeClasses[photo.size] || 'h-64'}`}
      onClick={onFlip}
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, photo.id)}
      onDragOver={(e) => dragHandlers.onDragOver(e)}
      onDrop={(e) => dragHandlers.onDrop(e, photo.id)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3, animationDirection: "normal" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* === FRENTE === */}
        <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
          <img 
            src={photo.imagen_url || photo.imagen_file} 
            alt={photo.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradiente y Título */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 pt-12">
            <h3 className="text-white font-bold truncate text-shadow-sm">{photo.titulo}</h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 pt-12">
            <h3 className="text-white font-bold truncate text-shadow-sm">{photo.titulo}</h3>
          </div>
          {photo.destacado && (
            <span className="absolute top-2 right-2 bg-yellow-500/90 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
              ★ Destacado
            </span>
          )}
        </div>

        {/* === REVERSO === */}
        <div 
          className="absolute inset-0 h-full w-full bg-slate-800 rounded-xl p-6 backface-hidden rotate-y-180 border border-slate-600 shadow-xl flex flex-col justify-between"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-indigo-400">{photo.titulo}</h3>
                  <div className="flex gap-2">
                    {/* Botones de acción */}
                    <button onClick={(e) => { e.stopPropagation(); onEdit(photo); }} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(photo); }} className="p-1.5 hover:bg-red-900/30 text-red-400 rounded-full transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
            
            <div className="space-y-2 text-sm text-slate-300">
                    <p className="line-clamp-3 italic text-slate-400">"{photo.descripcion || 'Sin descripción'}"</p>
                    <div className="pt-2 border-t border-slate-700 mt-2 space-y-1">
                        <p><span className="text-slate-500">Álbum:</span> {photo.album_nombre}</p>
                        <p><span className="text-slate-500">Fotógrafo:</span> {photo.photographer_nombre || 'N/A'}</p>
                    </div>
                </div>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Click para voltear</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}