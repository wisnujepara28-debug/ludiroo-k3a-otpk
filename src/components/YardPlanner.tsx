import React, { useState } from 'react';
import type { ContainerRecord } from '../types/terminal';
import {
  Layers,
  MapPin,
  Box,
  Thermometer,
  AlertTriangle,
  Info,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react';

interface YardPlannerProps {
  containers: ContainerRecord[];
  onSelectContainer: (container: ContainerRecord) => void;
  onAddAtSlot: (block: string, bay: number, row: number, tier: number) => void;
}

const YARD_BLOCKS = [
  { id: 'A', name: 'Blok A', type: 'Impor Umum', totalBays: 12, color: 'border-blue-500 bg-blue-50/50' },
  { id: 'B', name: 'Blok B', type: 'Reefer (Berpendingin)', totalBays: 8, color: 'border-cyan-500 bg-cyan-50/50' },
  { id: 'C', name: 'Blok C', type: 'Ekspor Siap Muat', totalBays: 12, color: 'border-emerald-500 bg-emerald-50/50' },
  { id: 'D', name: 'Blok D', type: 'Transshipment', totalBays: 8, color: 'border-purple-500 bg-purple-50/50' },
  { id: 'E', name: 'Blok E', type: 'Empty Depot', totalBays: 6, color: 'border-amber-500 bg-amber-50/50' },
];

export const YardPlanner: React.FC<YardPlannerProps> = ({
  containers,
  onSelectContainer,
  onAddAtSlot,
}) => {
  const [selectedBlock, setSelectedBlock] = useState('A');
  const [selectedBay, setSelectedBay] = useState<number>(4);

  const blockInfo = YARD_BLOCKS.find((b) => b.id === selectedBlock) || YARD_BLOCKS[0];
  const blockContainers = containers.filter((c) => c.block === selectedBlock && c.status === 'YARD');
  const bayContainers = blockContainers.filter((c) => c.bay === selectedBay);

  // Maximum grid dimensions for bay view
  const ROWS = [1, 2, 3, 4, 5, 6];
  const TIERS = [5, 4, 3, 2, 1]; // from top to bottom (Tier 5 is top, Tier 1 is ground)

  const getContainerAt = (row: number, tier: number) => {
    return bayContainers.find((c) => c.row === row && c.tier === tier);
  };

  // Block capacity stats
  const totalSlotsInBlock = blockInfo.totalBays * 6 * 4; // approximate
  const occupancyPercent = Math.min(100, Math.round((blockContainers.length / totalSlotsInBlock) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Block Selector */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Yard Planner (Denah Lapangan Penumpukan)
              </h2>
              <p className="text-xs text-slate-500">
                Peta visual alokasi slot peti kemas per Blok, Bay, Row, dan Tier secara real-time dari Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Block quick switcher tabs */}
        <div className="flex flex-wrap gap-2">
          {YARD_BLOCKS.map((b) => {
            const countInBlock = containers.filter((c) => c.block === b.id && c.status === 'YARD').length;
            const isSelected = selectedBlock === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBlock(b.id);
                  setSelectedBay(2);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{b.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {countInBlock}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Yard Bay Cross-Section Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bay Cross-section Interactive Grid */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {/* Bay selector pills */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Penampang Potongan Melintang (Cross-Section)
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {blockInfo.name} — Bay {String(selectedBay).padStart(2, '0')}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              <span className="text-xs font-medium text-slate-500 mr-1">Pilih Bay:</span>
              {Array.from({ length: blockInfo.totalBays }, (_, i) => i + 1).map((bayNum) => {
                const count = blockContainers.filter((c) => c.bay === bayNum).length;
                const isCurrent = selectedBay === bayNum;
                return (
                  <button
                    key={bayNum}
                    onClick={() => setSelectedBay(bayNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : count > 0
                        ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stacking Grid: Tiers (Y-axis) vs Rows (X-axis) */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[550px]">
              {/* Row Header Labels on Top */}
              <div className="grid grid-cols-7 gap-3 mb-2 text-center text-xs font-bold text-slate-500 font-mono">
                <div className="text-left text-slate-400 font-normal">Tier \ Row</div>
                {ROWS.map((r) => (
                  <div key={r} className="p-1 rounded-md bg-slate-100 text-slate-700">
                    Row {r}
                  </div>
                ))}
              </div>

              {/* Tiers from 5 down to 1 */}
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <div key={tier} className="grid grid-cols-7 gap-3 items-center">
                    {/* Tier Level Label */}
                    <div className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] text-slate-700">
                        T{tier}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        {tier === 1 ? '(Dasar)' : `(Lantai ${tier})`}
                      </span>
                    </div>

                    {/* 6 Rows for this Tier */}
                    {ROWS.map((row) => {
                      const container = getContainerAt(row, tier);
                      if (container) {
                        return (
                          <div
                            key={row}
                            onClick={() => onSelectContainer(container)}
                            className={`p-2 rounded-2xl border-2 transition-all cursor-pointer shadow-xs hover:scale-102 hover:shadow-md ${
                              container.isReefer
                                ? 'bg-cyan-50 border-cyan-400 text-cyan-950'
                                : container.damaged
                                ? 'bg-amber-50 border-amber-400 text-amber-950'
                                : container.loadStatus === 'EMPTY'
                                ? 'bg-slate-50 border-slate-300 text-slate-800'
                                : 'bg-blue-50 border-blue-400 text-blue-950'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-extrabold">{container.isoType}</span>
                              {container.isReefer && <Thermometer className="w-3 h-3 text-cyan-600" />}
                              {container.damaged && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            </div>
                            <div className="font-mono font-bold text-[11px] tracking-tight truncate mt-0.5">
                              {container.containerNumber}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                              <span>{Math.round(container.grossWeight / 1000)}T</span>
                              <span className="font-semibold text-blue-700">{container.loadStatus}</span>
                            </div>
                          </div>
                        );
                      }

                      // Empty Slot
                      return (
                        <div
                          key={row}
                          onClick={() => onAddAtSlot(selectedBlock, selectedBay, row, tier)}
                          className="h-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group"
                          title={`Slot Kosong: ${selectedBlock}-${selectedBay}-${row}-${tier}. Klik untuk alokasi.`}
                        >
                          <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-mono text-slate-300 group-hover:text-blue-600">
                            R{row}T{tier}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Ground representation */}
              <div className="mt-4 pt-2 border-t-4 border-slate-800 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>◄ Sisi Dermaga (Quay Side)</span>
                <span>ASPAL LAPANGAN PENUMPUKAN</span>
                <span>Sisi Gerbang (Gate Side) ►</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Yard Block Insights & Legend */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Status {blockInfo.name} ({blockInfo.type})
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Tingkat Okupansi Blok</span>
                  <span className="text-blue-700">{occupancyPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occupancyPercent > 80 ? 'bg-rose-500' : occupancyPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(8, occupancyPercent)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Total Peti Kemas</span>
                  <span className="text-xl font-extrabold text-slate-900">{blockContainers.length} Box</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Isi di Bay {selectedBay}</span>
                  <span className="text-xl font-extrabold text-blue-700">{bayContainers.length} Box</span>
                </div>
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">Keterangan Warna Slot:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-400" />
                  <span className="text-slate-600">Peti Kemas Standar (FCL/LCL)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-cyan-100 border border-cyan-400" />
                  <span className="text-slate-600">Reefer (Berpendingin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400" />
                  <span className="text-slate-600">Kondisi Rusak / Perlu Inspeksi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300" />
                  <span className="text-slate-600">Empty Container (Kosong)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Slot Selection summary */}
          <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" /> Petunjuk Operator
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Klik pada <strong>kontainer terisi</strong> untuk melihat rincian lengkap atau mengedit data. Klik pada <strong>slot garis putus-putus</strong> untuk langsung menambahkan peti kemas di posisi koordinat tersebut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
