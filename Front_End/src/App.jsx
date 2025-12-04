import { useState } from 'react'
import { Toaster } from 'sonner' // Notificaciones Toast
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import PhotoGallery from './components/PhotoGallery'

// Componente interno para manejar la lógica de vista
function AppContent() {
  const { isAuthenticated } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
        <Toaster position="top-right" richColors theme="dark" />
        <PhotoGallery />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" richColors theme="dark" />
      {/* Lógica de Toggle */}
      {isRegistering ? (
        <Register onSwitchToLogin={() => setIsRegistering(false)} />
      ) : (
        <>
          <Login />
          {/* Botón flotante o enlace para ir a registro */}
          <div className="fixed bottom-8 w-full text-center z-20">
            <span className="text-slate-400 text-sm">¿No tienes cuenta? </span>
            <button 
              onClick={() => setIsRegistering(true)}
              className="text-indigo-400 hover:text-white font-medium text-sm underline transition-colors"
            >
              Regístrate aquí
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Componente principal que provee el contexto
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App