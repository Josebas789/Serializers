import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { Camera, Lock, User } from 'lucide-react'
import ParticlesBackground from './Animations/ParticlesBackground'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('token/', { username, password })
      const { access, refresh } = res.data
      login(access, refresh)
      toast.success(`¡Bienvenido, ${username}!`)
    } catch (err) {
      console.error(err)
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* === FONDO ANIMADO REACT BITS STYLE === */}
      <ParticlesBackground />
      {/* ====================================== */}

      {/* Tarjeta de Login (con backdrop-blur para que se vean las partículas detrás) */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10 animate-scale-in">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-full mb-3 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Camera className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">IGallery</h2>
          <p className="text-slate-400 text-sm">Ingresa a tu espacio creativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 ml-1">Usuario</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-10 p-2.5 transition-all outline-none placeholder:text-slate-600"
                placeholder="ej. usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-10 p-2.5 transition-all outline-none placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}