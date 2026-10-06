import React, { useState } from 'react';
import type { VesselRecord, VesselStatus } from '../types/terminal';
import {
  Ship,
  Anchor,
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Save,
  Compass,
} from 'lucide-react';

interface VesselOperationsProps {
  vessels: VesselRecord[];
  onAddVessel: (vessel: Omit<VesselRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateVessel: (id: string, updates: Partial<VesselRecord>) => Promise<void>;
  onDeleteVessel: (id: string) => Promise<void>;
}

export const VesselOperations: React.FC<VesselOperationsProps> = ({
  vessels,
  onAddVessel,
  onUpdateVessel,
  onDeleteVessel,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselRecord | null>(null);
  const [deleteVesselId, setDeleteVesselId] = useState<string | null>(null);

  // Form states
  const [vesselName, setVesselName] = useState('');
  const [voyageIn, setVoyageIn] = useState('');
  const [voyageOut, setVoyageOut] = useState('');
  const [shippingLine, setShippingLine] = useState('Meratus Line');
  const [berthNumber, setBerthNumber] = useState('Dermaga 01 (Utara)');
  const [eta, setEta] = useState(new Date().toISOString().slice(0, 16));
  const [etd, setEtd] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
  const [status, setStatus] = useState<VesselStatus>('SCHEDULED');
  const [totalTeus, setTotalTeus] = useState<number>(850);
  const [completedTeus, setCompletedTeus] = useState<number>(0);
  const [craneAssigned, setCraneAssigned] = useState('Quay Crane 01 & 02');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingVessel(null);
    setVesselName('');
    setVoyageIn('');
    setVoyageOut('');
    setShippingLine('Meratus Line');
    setBerthNumber('Dermaga 01 (Utara)');
    setEta(new Date().toISOString().slice(0, 16));
    setEtd(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
    setStatus('SCHEDULED');
    setTotalTeus(850);
    setCompletedTeus(0);
    setCraneAssigned('Quay Crane 01 & 02');
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (v: VesselRecord) => {
    setEditingVessel(v);
    setVesselName(v.vesselName);
    setVoyageIn(v.voyageIn);
    setVoyageOut(v.voyageOut);
    setShippingLine(v.shippingLine);
    setBerthNumber(v.berthNumber);
    setEta(v.eta.slice(0, 16));
    setEtd(v.etd.slice(0, 16));
    setStatus(v.status);
    setTotalTeus(v.totalTeus);
    setCompletedTeus(v.completedTeus);
    setCraneAssigned(v.craneAssigned || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vesselName.trim() || !voyageIn.trim()) {
      setError('Nama kapal dan nomor voyage wajib diisi.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingVessel) {
        await onUpdateVessel(editingVessel.id, {
          vesselName: vesselName.trim().toUpperCase(),
          voyageIn: voyageIn.trim().toUpperCase(),
          voyageOut: voyageOut.trim().toUpperCase(),
          shippingLine,
          berthNumber,
          eta,
          etd,
          status,
          totalTeus: Number(totalTeus),
          completedTeus: Number(completedTeus),
          craneAssigned,
        });
      } else {
        await onAddVessel({
          vesselName: vesselName.trim().toUpperCase(),
          voyageIn: voyageIn.trim().toUpperCase(),
          voyageOut: voyageOut.trim().toUpperCase(),
          shippingLine,
          berthNumber,
          eta,
          etd,
          status,
          totalTeus: Number(totalTeus),
          completedTeus: Number(completedTeus),
          craneAssigned,
        });
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Gagal menyimpan data kapal.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st: VesselStatus) => {
    switch (st) {
      case 'BERTHED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WORKING':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse';
      case 'SCHEDULED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'DEPARTED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Jadwal Sandar Kapal & Stevedoring
            </h2>
            <p className="text-xs text-slate-500">
              Alokasi dermaga (Berth Planning) dan progres bongkar/muat peti kemas per armada kapal.
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal Kapal
        </button>
      </div>

      {/* Vessel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vessels.map((v) => {
          const progressPercent = v.totalTeus > 0 ? Math.min(100, Math.round((v.completedTeus / v.totalTeus) * 100)) : 0;
          return (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadge(v.status)}`}>
                    {v.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {v.berthNumber}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{v.vesselName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{v.shippingLine}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Voyage In / Out:</span>
                    <span className="font-mono font-bold text-slate-800">{v.voyageIn} / {v.voyageOut || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alat Ditugaskan:</span>
                    <span className="font-medium text-blue-900">{v.craneAssigned || 'Quay Crane Standby'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimasi Tiba (ETA):</span>
                    <span className="font-mono text-slate-700">{new Date(v.eta).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Bongkar Muat Progress */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Progres Bongkar/Muat</span>
                    <span className="text-blue-700 font-mono">{v.completedTeus} / {v.totalTeus} TEUs ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">ID: {v.id.slice(-6)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
                    title="Edit Jadwal Kapal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteVesselId(v.id)}
                    className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    title="Hapus Kapal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vessel Modal (Add/Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                {editingVessel ? 'Perbarui Jadwal Sandar Kapal' : 'Tambah Jadwal Kapal Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kapal (Vessel Name)</label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="MV WAN HAI 315"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voyage In</label>
                  <input
                    type="text"
                    value={voyageIn}
                    onChange={(e) => setVoyageIn(e.target.value)}
                    placeholder="W-088N"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voyage Out</label>
                  <input
                    type="text"
                    value={voyageOut}
                    onChange={(e) => setVoyageOut(e.target.value)}
                    placeholder="W-089S"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pelayaran (Carrier)</label>
                  <input
                    type="text"
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alokasi Dermaga (Berth)</label>
                  <select
                    value={berthNumber}
                    onChange={(e) => setBerthNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Dermaga 01 (Utara)">Dermaga 01 (Utara)</option>
                    <option value="Dermaga 02 (Selatan)">Dermaga 02 (Selatan)</option>
                    <option value="Dermaga 03 (Timur)">Dermaga 03 (Timur)</option>
                    <option value="Dermaga 04 (Barat)">Dermaga 04 (Barat)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Sandar</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="SCHEDULED">SCHEDULED (Terjadwal)</option>
                    <option value="BERTHED">BERTHED (Telah Sandar)</option>
                    <option value="WORKING">WORKING (Operasi Bongkar Muat)</option>
                    <option value="COMPLETED">COMPLETED (Selesai)</option>
                    <option value="DEPARTED">DEPARTED (Berangkat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quay Crane Ditugaskan</label>
                  <input
                    type="text"
                    value={craneAssigned}
                    onChange={(e) => setCraneAssigned(e.target.value)}
                    placeholder="Quay Crane 01 & 02"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Total TEUs</label>
                  <input
                    type="number"
                    min={1}
                    value={totalTeus}
                    onChange={(e) => setTotalTeus(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selesai (TEUs)</label>
                  <input
                    type="number"
                    min={0}
                    value={completedTeus}
                    onChange={(e) => setCompletedTeus(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteVesselId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">Konfirmasi Hapus Kapal</h4>
            <p className="text-xs text-slate-500 mt-2">
              Hapus jadwal kapal ini dari basis data Firestore? Tindakan tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteVesselId(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await onDeleteVessel(deleteVesselId);
                  setDeleteVesselId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
