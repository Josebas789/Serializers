import { useState } from 'react'
import { api } from '../api'
import { toast } from 'sonner'
import { UserPlus, Lock, User, Mail, ArrowLeft } from 'lucide-react'
import ParticlesBackground from './Animations/ParticlesBackground'

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('register/', { username, email, password })
      toast.success('¡Cuenta creada! Ahora inicia sesión.')
      onSwitchToLogin() // Volver al login automáticamente
    } catch (err) {
      console.error(err)
      if (err.response?.data?.username) {
        toast.error('El usuario ya existe')
      } else {
        toast.error('Error al registrarse. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <ParticlesBackground />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10 animate-scale-in">
        <button onClick={onSwitchToLogin} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft size={16} /> Volver al Login
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-green-500/10 rounded-full mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <UserPlus className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Crear Cuenta</h2>
          <p className="text-slate-400 text-sm">Únete a IGallery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 ml-1">Usuario</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-green-400 transition-colors" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 p-2.5 outline-none placeholder:text-slate-600" placeholder="ej. nuevo_usuario" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-green-400 transition-colors" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 p-2.5 outline-none placeholder:text-slate-600" placeholder="correo@ejemplo.com" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-green-400 transition-colors" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 block pl-10 p-2.5 outline-none placeholder:text-slate-600" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 hover:shadow-green-500/40">
            {loading ? 'Creando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  )
}