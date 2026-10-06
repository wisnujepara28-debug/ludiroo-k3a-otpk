import React, { useState } from 'react';
import { useAuth, DEMO_ADMIN, DEMO_OPERATOR, UserRole } from '../context/AuthContext';
import {
  Box,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HardHat,
  Database,
  Truck,
  Ship,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { loginUser, loginWithGoogle, quickDemoLogin, error } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActiveAction('form');
    try {
      await loginUser(username || 'admin', password || '123', selectedRole);
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'operator') => {
    setActiveAction(role);
    setLoading(true);
    try {
      if (role === 'admin') {
        setUsername(DEMO_ADMIN.username);
        setPassword(DEMO_ADMIN.password);
        setSelectedRole('ADMIN');
      } else {
        setUsername(DEMO_OPERATOR.username);
        setPassword(DEMO_OPERATOR.password);
        setSelectedRole('OPERATOR');
      }
      await quickDemoLogin(role);
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setActiveAction('google');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50/40 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden">
        {/* Left Side: Brand & Port Info Banner */}
        <div className="lg:col-span-5 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Box className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  JAPARA <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/30 text-cyan-300 font-mono font-medium">TOS v2.5</span>
                </h1>
                <p className="text-xs text-blue-200">PT Terminal Peti Kemas JAPARA</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Sistem Operasional Terminal Peti Kemas JAPARA
              </h2>
              <p className="text-sm text-blue-200 leading-relaxed">
                Manajemen terintegrasi pergerakan peti kemas, penataan lapangan penumpukan (yard planning), jadwal sandar kapal, dan pemeriksaan gate in/out secara real-time.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-blue-100 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Terhubung langsung ke <strong>Firebase Firestore</strong> (Single Source of Truth)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Ship className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Monitoring bongkar muat & status sandar kapal di Pelabuhan JAPARA</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Pemeriksaan gate transaksi truck receiving & delivery</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-blue-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Server Status: Aktif
            </span>
            <span>Pelabuhan JAPARA</span>
          </div>
        </div>

        {/* Right Side: Free Username & Password Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Login Mudah Bebas Akses
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Masuk Sistem JAPARA
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bebas ketik username dan password apa saja untuk langsung masuk ke dashboard.
            </p>
          </div>

          {/* Quick Demo Login Cards */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Klik Cepat 1-Detik (Demo)
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Tinggal Klik</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="group relative p-3.5 rounded-2xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                    Admin
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="font-semibold text-sm text-slate-900">Demo Admin JAPARA</div>
                  <div className="text-xs text-slate-500">User: admin • Pass: 123</div>
                  <div className="mt-1 text-[11px] text-blue-700 font-medium flex items-center gap-1">
                    Akses Penuh CRUD & Yard
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('operator')}
                disabled={loading}
                className="group relative p-3.5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-slate-50 hover:bg-indigo-50/50 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Operator
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="font-semibold text-sm text-slate-900">Demo Operator JAPARA</div>
                  <div className="text-xs text-slate-500">User: operator • Pass: 123</div>
                  <div className="mt-1 text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                    Input Lapangan & Gate
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              atau tulis username & password bebas
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* Free Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username / Nama / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik apa saja, misal: admin, wisnu, fuhjl89..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password apa saja, misal: 123..."
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Peran Pengguna (Hak Akses):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Terminal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('OPERATOR')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedRole === 'OPERATOR'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <HardHat className="w-4 h-4" />
                  <span>Operator Lapangan</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && activeAction === 'form' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem JAPARA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In option */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs rounded-xl shadow-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading && activeAction === 'google' ? 'Menghubungkan ke Google...' : 'Atau Masuk dengan Akun Google'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
