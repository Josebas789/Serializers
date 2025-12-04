import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Eliminar", cancelText = "Cancelar" }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative animate-scale-in">
        
        {/* Botón Cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icono de Advertencia */}
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>

        {/* Contenido */}
        <div className="text-left">
          <h3 className="text-lg font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400">
            {message}
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-lg shadow-red-500/20 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}