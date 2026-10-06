import React from 'react';
import type { ContainerRecord, VesselRecord, GateTransactionRecord } from '../types/terminal';
import {
  Box,
  Layers,
  Ship,
  Truck,
  Thermometer,
  Scale,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Plus,
} from 'lucide-react';

interface DashboardOverviewProps {
  containers: ContainerRecord[];
  vessels: VesselRecord[];
  gateTransactions: GateTransactionRecord[];
  onNavigateTab: (tab: 'containers' | 'yard' | 'vessels' | 'gate') => void;
  onOpenCreateContainer: () => void;
  onSeedData: () => void;
  seeding: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  containers,
  vessels,
  gateTransactions,
  onNavigateTab,
  onOpenCreateContainer,
  onSeedData,
  seeding,
}) => {
  // Calculations
  const inYard = containers.filter((c) => c.status === 'YARD');
  const totalTeus = containers.reduce((acc, c) => acc + (c.size === 40 ? 2 : 1), 0);
  const totalWeightTon = Math.round(containers.reduce((acc, c) => acc + c.grossWeight, 0) / 1000);

  const fclCount = containers.filter((c) => c.loadStatus === 'FCL').length;
  const emptyCount = containers.filter((c) => c.loadStatus === 'EMPTY').length;
  const reeferCount = containers.filter((c) => c.isReefer).length;
  const damagedCount = containers.filter((c) => c.damaged).length;

  const activeVessels = vessels.filter((v) => v.status === 'BERTHED' || v.status === 'WORKING');
  const inspectionCustomsCount = containers.filter((c) => c.customsStatus === 'INSPECTION' || c.customsStatus === 'HOLD').length;

  // Total capacity estimate across all blocks (approx 150 slot capacity demo)
  const occupancyPercent = Math.min(100, Math.round((inYard.length / 120) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 border border-white/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operasional Terminal Siap & Aktif
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ringkasan Operasional Terminal Peti Kemas JAPARA
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-2 leading-relaxed">
            Data tersimpan secara persisten di <strong>Firebase Firestore</strong> sebagai Single Source of Truth. Pantau pergerakan peti kemas, alokasi dermaga, dan antrean truk pelabuhan secara real-time.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={onOpenCreateContainer}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Peti Kemas
          </button>

          {containers.length === 0 && (
            <button
              onClick={onSeedData}
              disabled={seeding}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              {seeding ? 'Memuat Data...' : 'Muat Data Contoh Terminal'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Peti Kemas */}
        <div
          onClick={() => onNavigateTab('containers')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Peti Kemas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {containers.length}
            </span>
            <span className="text-xs text-blue-700 font-bold">Box</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Setara <strong>{totalTeus} TEUs</strong></span>
            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Yard Occupancy */}
        <div
          onClick={() => onNavigateTab('yard')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Okupansi Yard
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {occupancyPercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">({inYard.length} di Lapangan)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Blok A, B, C, D, E</span>
            <span className="text-emerald-600 group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Vessels at Berth */}
        <div
          onClick={() => onNavigateTab('vessels')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kapal Sandar Dermaga
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeVessels.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">dari {vessels.length} armada</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Operasi Stevedoring</span>
            <span className="text-cyan-600 group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Gate Transactions */}
        <div
          onClick={() => onNavigateTab('gate')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Transaksi Gate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {gateTransactions.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Truk Log</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Receiving & Delivery</span>
            <span className="text-amber-600 group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Operational Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Yard Block Breakdown & Status */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Kondisi Lapangan & Kategori Peti Kemas
            </h3>
            <button
              onClick={() => onNavigateTab('yard')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Buka Yard Planner <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
              <span className="text-[11px] text-blue-700 font-semibold block">Muatan Penuh (FCL)</span>
              <span className="text-xl font-bold text-blue-950 font-mono">{fclCount} Box</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-semibold block">Kontainer Kosong</span>
              <span className="text-xl font-bold text-slate-800 font-mono">{emptyCount} Box</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 text-center">
              <span className="text-[11px] text-cyan-700 font-semibold block">Unit Reefer</span>
              <span className="text-xl font-bold text-cyan-950 font-mono">{reeferCount} Box</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
              <span className="text-[11px] text-amber-700 font-semibold block">Pemeriksaan Bea Cukai</span>
              <span className="text-xl font-bold text-amber-950 font-mono">{inspectionCustomsCount} Box</span>
            </div>
          </div>

          {/* Block visual distribution */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-600 block">
              Distribusi Penumpukan per Blok Lapangan:
            </span>
            {[
              { id: 'A', name: 'Blok A (Impor Umum)', color: 'bg-blue-600' },
              { id: 'B', name: 'Blok B (Reefer Pendingin)', color: 'bg-cyan-500' },
              { id: 'C', name: 'Blok C (Ekspor Siap Muat)', color: 'bg-emerald-500' },
              { id: 'D', name: 'Blok D (Transshipment)', color: 'bg-purple-500' },
              { id: 'E', name: 'Blok E (Empty Container)', color: 'bg-amber-500' },
            ].map((block) => {
              const inThisBlock = containers.filter((c) => c.block === block.id).length;
              const percent = containers.length > 0 ? Math.round((inThisBlock / containers.length) * 100) : 0;
              return (
                <div key={block.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{block.name}</span>
                    <span className="font-mono text-slate-500">{inThisBlock} Box ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${block.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Berth Vessel Schedule */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-600" />
                Kapal Sandar & Stevedoring
              </h3>
              <button
                onClick={() => onNavigateTab('vessels')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {vessels.slice(0, 3).map((v) => {
                const percent = v.totalTeus > 0 ? Math.round((v.completedTeus / v.totalTeus) * 100) : 0;
                return (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{v.vesselName}</h4>
                        <p className="text-[11px] text-slate-500">{v.shippingLine} • {v.berthNumber}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        v.status === 'WORKING' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Progres Bongkar/Muat:</span>
                        <span className="font-mono font-bold text-blue-700">{v.completedTeus}/{v.totalTeus} TEUs ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gate preview prompt */}
          <div className="mt-4 p-4 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-amber-600" />
              <div>
                <h5 className="text-xs font-bold text-amber-950">Inspeksi Gate Truk</h5>
                <p className="text-[11px] text-amber-800">
                  {gateTransactions.length} transaksi tercatat hari ini
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('gate')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Buka Gate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
