import React, { useState } from 'react';
import { useAuth, DEMO_ADMIN, DEMO_OPERATOR } from '../context/AuthContext';
import {
  Anchor,
  Box,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HardHat,
  Database,
  CheckCircle,
  AlertCircle,
  Truck,
  Ship,
  Sparkles,
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail, registerWithEmail, quickDemoLogin, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'admin' | 'operator' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Harap isi email dan password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'operator') => {
    setActiveDemo(role);
    setLoading(true);
    setError(null);
    try {
      if (role === 'admin') {
        setEmail(DEMO_ADMIN.email);
        setPassword(DEMO_ADMIN.password);
      } else {
        setEmail(DEMO_OPERATOR.email);
        setPassword(DEMO_OPERATOR.password);
      }
      await quickDemoLogin(role);
      if (onLoginSuccess) onLoginSuccess();
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
      setActiveDemo(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50/40 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden">
        {/* Left Side: Brand & Port Info Banner */}
        <div className="lg:col-span-5 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric pattern */}
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

        {/* Right Side: Login & Quick Demo Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Autentikasi Petugas JAPARA
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isRegisterMode ? 'Daftar Akun Petugas' : 'Masuk ke Sistem Operasional JAPARA'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Gunakan akun Anda atau klik tombol demo instan di bawah.
            </p>
          </div>

          {/* Quick Demo Login Cards (Requested in Prompt) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Login Cepat User Demo
              </span>
              <span className="text-[11px] text-slate-400">1-Klik Langsung Masuk</span>
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
                  <div className="text-xs text-slate-500 truncate">admin@japara.id</div>
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
                  <div className="text-xs text-slate-500 truncate">operator@japara.id</div>
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
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
              atau gunakan email & password
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* Error feedback */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@terminalpetikemas.id"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{activeDemo ? `Memproses Demo ${activeDemo}...` : 'Memverifikasi...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Daftarkan Akun Baru' : 'Masuk ke Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold focus:outline-none transition-colors"
            >
              {isRegisterMode
                ? 'Sudah memiliki akun? Masuk di sini'
                : 'Belum punya akun? Buat akun operator baru'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
