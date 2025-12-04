import { Toaster } from 'sonner' // Notificaciones Toast
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import PhotoGallery from './components/PhotoGallery'

// Componente interno para manejar la lógica de vista
function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Sistema de notificaciones (Toast) */}
      <Toaster position="top-right" richColors theme="dark" />

      {isAuthenticated ? (
        <PhotoGallery />
      ) : (
        <Login />
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