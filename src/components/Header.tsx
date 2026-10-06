import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  LayoutDashboard,
  Layers,
  Ship,
  Truck,
  LogOut,
  ShieldCheck,
  HardHat,
  Database,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'containers' | 'yard' | 'vessels' | 'gate';
  setActiveTab: (tab: 'overview' | 'containers' | 'yard' | 'vessels' | 'gate') => void;
  onSeedData: () => void;
  seeding: boolean;
  containersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSeedData,
  seeding,
  containersCount,
}) => {
  const { user, role, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  JAPARA
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  TOS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Terminal Peti Kemas JAPARA
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('containers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'containers'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Peti Kemas</span>
              {containersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono">
                  {containersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('yard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'yard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Yard Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('vessels')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'vessels'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Ship className="w-4 h-4" />
              <span>Jadwal Kapal</span>
            </button>

            <button
              onClick={() => setActiveTab('gate')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'gate'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Pemeriksaan Gate</span>
            </button>
          </nav>

          {/* Right Tools & User Info */}
          <div className="flex items-center gap-2.5">
            {/* Realtime Firebase Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore Real-Time</span>
            </div>

            {/* Seed Button */}
            {containersCount === 0 && (
              <button
                onClick={onSeedData}
                disabled={seeding}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Isi data awal pelabuhan ke Firebase"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{seeding ? 'Memuat...' : 'Muat Contoh Data'}</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {user?.email?.split('@')[0] || 'Petugas'}
                </div>
                <div className="text-[10px] font-semibold text-blue-700 flex items-center justify-end gap-1">
                  {role === 'ADMIN' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> Admin Terminal
                    </>
                  ) : (
                    <>
                      <HardHat className="w-3 h-3 text-indigo-600" /> Operator Lapangan
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('containers')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'containers' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Peti Kemas ({containersCount})
          </button>
          <button
            onClick={() => setActiveTab('yard')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'yard' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Yard Planner
          </button>
          <button
            onClick={() => setActiveTab('vessels')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'vessels' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Kapal
          </button>
          <button
            onClick={() => setActiveTab('gate')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'gate' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Gate
          </button>
        </div>
      </div>
    </header>
  );
};
