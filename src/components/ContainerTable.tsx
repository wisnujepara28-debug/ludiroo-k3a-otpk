import React, { useState, useMemo } from 'react';
import type { ContainerRecord, ContainerStatus, LoadStatus } from '../types/terminal';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Thermometer,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Download,
  Box,
} from 'lucide-react';

interface ContainerTableProps {
  containers: ContainerRecord[];
  onOpenCreate: () => void;
  onOpenEdit: (container: ContainerRecord) => void;
  onOpenDelete: (container: ContainerRecord) => void;
  onSelectContainer: (container: ContainerRecord) => void;
  userRole: 'ADMIN' | 'OPERATOR';
}

export const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onSelectContainer,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [loadFilter, setLoadFilter] = useState<string>('ALL');
  const [reeferOnly, setReeferOnly] = useState(false);
  const [damagedOnly, setDamagedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'containerNumber' | 'grossWeight' | 'slot'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered and sorted data
  const filteredContainers = useMemo(() => {
    return containers.filter((c) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        c.containerNumber.toLowerCase().includes(search) ||
        c.shippingLine.toLowerCase().includes(search) ||
        (c.consignee && c.consignee.toLowerCase().includes(search)) ||
        (c.vesselName && c.vesselName.toLowerCase().includes(search)) ||
        `${c.block}-${c.bay}-${c.row}-${c.tier}`.toLowerCase().includes(search);

      if (!matchSearch) return false;

      // Status
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Block
      if (blockFilter !== 'ALL' && c.block !== blockFilter) return false;

      // Load status
      if (loadFilter !== 'ALL' && c.loadStatus !== loadFilter) return false;

      // Reefer
      if (reeferOnly && !c.isReefer) return false;

      // Damaged
      if (damagedOnly && !c.damaged) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'containerNumber') {
        comparison = a.containerNumber.localeCompare(b.containerNumber);
      } else if (sortBy === 'grossWeight') {
        comparison = a.grossWeight - b.grossWeight;
      } else if (sortBy === 'slot') {
        const slotA = `${a.block}${String(a.bay).padStart(2, '0')}${a.row}${a.tier}`;
        const slotB = `${b.block}${String(b.bay).padStart(2, '0')}${b.row}${b.tier}`;
        comparison = slotA.localeCompare(slotB);
      } else {
        // updatedAt
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [containers, searchTerm, statusFilter, blockFilter, loadFilter, reeferOnly, damagedOnly, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = [
      'Nomor Kontainer',
      'Tipe ISO',
      'Ukuran (FT)',
      'Status',
      'Arus',
      'Muatan',
      'Berat Kotor (KG)',
      'Segel',
      'Blok',
      'Bay',
      'Row',
      'Tier',
      'Pelayaran',
      'Kapal',
      'Voyage',
      'Bea Cukai',
      'Reefer',
      'Kondisi',
    ];

    const rows = filteredContainers.map((c) => [
      c.containerNumber,
      c.isoType,
      c.size,
      c.status,
      c.category,
      c.loadStatus,
      c.grossWeight,
      c.sealNumber || '',
      c.block,
      c.bay,
      c.row,
      c.tier,
      c.shippingLine,
      c.vesselName || '',
      c.voyageNumber || '',
      c.customsStatus,
      c.isReefer ? `Ya (${c.reeferTemp}°C)` : 'Tidak',
      c.damaged ? `Rusak: ${c.damageNotes || 'Ya'}` : 'Baik',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Peti_Kemas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ContainerStatus) => {
    switch (status) {
      case 'YARD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GATE_IN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GATE_OUT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LOADED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DISCHARGED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCustomsBadge = (cStatus: string) => {
    switch (cStatus) {
      case 'CLEARED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INSPECTION':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HOLD':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor kontainer, pelayaran, kapal, consignee, atau slot (misal: A-04)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peti Kemas</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="YARD">YARD (Di Lapangan)</option>
            <option value="GATE_IN">GATE_IN (Masuk)</option>
            <option value="GATE_OUT">GATE_OUT (Keluar)</option>
            <option value="LOADED">LOADED (Di Kapal)</option>
            <option value="DISCHARGED">DISCHARGED (Bongkar)</option>
          </select>

          {/* Block Filter */}
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Blok Yard</option>
            <option value="A">Blok A (Impor Umum)</option>
            <option value="B">Blok B (Reefer)</option>
            <option value="C">Blok C (Ekspor)</option>
            <option value="D">Blok D (Transshipment)</option>
            <option value="E">Blok E (Empty)</option>
          </select>

          {/* Load Status Filter */}
          <select
            value={loadFilter}
            onChange={(e) => setLoadFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Muatan</option>
            <option value="FCL">FCL (Full)</option>
            <option value="LCL">LCL (Less)</option>
            <option value="EMPTY">EMPTY (Kosong)</option>
          </select>

          {/* Quick toggle chips */}
          <button
            type="button"
            onClick={() => setReeferOnly(!reeferOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              reeferOnly
                ? 'bg-cyan-50 border-cyan-400 text-cyan-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
            <span>Hanya Reefer</span>
          </button>

          <button
            type="button"
            onClick={() => setDamagedOnly(!damagedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              damagedOnly
                ? 'bg-amber-50 border-amber-400 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Ada Kerusakan Fisik</span>
          </button>

          <div className="ml-auto text-slate-400 text-[11px]">
            Menampilkan <strong>{filteredContainers.length}</strong> dari <strong>{containers.length}</strong> peti kemas
          </div>
        </div>
      </div>

      {/* Main Container Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
              <tr>
                <th
                  onClick={() => {
                    if (sortBy === 'containerNumber') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('containerNumber');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Nomor Kontainer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Tipe ISO & Ukuran</th>
                <th className="py-3.5 px-4">Status & Muatan</th>
                <th
                  onClick={() => {
                    if (sortBy === 'grossWeight') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('grossWeight');
                      setSortOrder('desc');
                    }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Berat Kotor</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'slot') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('slot');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Posisi Yard</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Pelayaran & Kapal</th>
                <th className="py-3.5 px-4">Bea Cukai</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Box className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada peti kemas ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                  </td>
                </tr>
              ) : (
                filteredContainers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectContainer(c)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Container Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm tracking-wide text-slate-900 group-hover:text-blue-700 transition-colors">
                          {c.containerNumber}
                        </span>
                        {c.isReefer && (
                          <span
                            className="p-1 rounded-md bg-cyan-100 text-cyan-700"
                            title={`Reefer Unit (${c.reeferTemp}°C)`}
                          >
                            <Thermometer className="w-3 h-3" />
                          </span>
                        )}
                        {c.damaged && (
                          <span
                            className="p-1 rounded-md bg-amber-100 text-amber-700"
                            title={`Kerusakan fisik: ${c.damageNotes || 'Tercatat'}`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Segel: <span className="font-mono">{c.sealNumber || '-'}</span>
                      </div>
                    </td>

                    {/* ISO Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {c.isoType}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1.5">{c.size} FT</span>
                    </td>

                    {/* Status & Load */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {c.loadStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{c.category}</span>
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800">
                        {c.grossWeight.toLocaleString('id-ID')} kg
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tara: {c.tareWeight.toLocaleString('id-ID')} kg
                      </div>
                    </td>

                    {/* Yard Slot */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 font-mono font-bold text-xs">
                        {c.block}-{String(c.bay).padStart(2, '0')}-{String(c.row).padStart(2, '0')}-{c.tier}
                      </span>
                    </td>

                    {/* Shipping Line & Vessel */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate">{c.shippingLine}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.vesselName} ({c.voyageNumber})
                      </div>
                    </td>

                    {/* Customs */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCustomsBadge(c.customsStatus)}`}>
                        {c.customsStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectContainer(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Edit Peti Kemas"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenDelete(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Peti Kemas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
