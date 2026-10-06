import React, { useState } from 'react';
import type { GateTransactionRecord, GateTransactionType, GateStatus } from '../types/terminal';
import {
  Truck,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
} from 'lucide-react';

interface GateOperationsProps {
  transactions: GateTransactionRecord[];
  onAddTransaction: (tx: Omit<GateTransactionRecord, 'id' | 'timestamp'>) => Promise<void>;
  operatorEmail: string;
}

export const GateOperations: React.FC<GateOperationsProps> = ({
  transactions,
  onAddTransaction,
  operatorEmail,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [transactionType, setTransactionType] = useState<GateTransactionType>('GATE_IN_RECEIVING');
  const [status, setStatus] = useState<GateStatus>('APPROVED');
  const [gateLane, setGateLane] = useState('Gate In - Jalur 01');
  const [notes, setNotes] = useState('Pemeriksaan fisik peti kemas normal, segel utuh.');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber.trim() || !driverName.trim()) return;

    setSaving(true);
    try {
      await onAddTransaction({
        truckNumber: truckNumber.trim().toUpperCase(),
        driverName: driverName.trim(),
        containerNumber: containerNumber.trim().toUpperCase(),
        transactionType,
        status,
        gateLane,
        notes: notes.trim(),
        operatorEmail,
      });
      setModalOpen(false);
      setTruckNumber('');
      setDriverName('');
      setContainerNumber('');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st: GateStatus) => {
    switch (st) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INSPECTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeLabel = (t: GateTransactionType) => {
    switch (t) {
      case 'GATE_IN_RECEIVING':
        return 'Gate In: Receiving (Masuk Muatan Ekspor)';
      case 'GATE_IN_DELIVERY':
        return 'Gate In: Delivery (Truk Jemput Impor)';
      case 'GATE_OUT_RECEIVING':
        return 'Gate Out: Receiving (Truk Kosong Keluar)';
      case 'GATE_OUT_DELIVERY':
        return 'Gate Out: Delivery (Bawa Kontainer Keluar)';
      default:
        return t;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pemeriksaan Gate Gerbang Pelabuhan
            </h2>
            <p className="text-xs text-slate-500">
              Pencatatan transaksi truk pengangkut kontainer (Receiving / Delivery) dan status inspeksi segel.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi Gate
        </button>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Plat Truk & Sopir</th>
                <th className="py-3.5 px-4">Jenis Transaksi</th>
                <th className="py-3.5 px-4">Nomor Peti Kemas</th>
                <th className="py-3.5 px-4">Jalur Gate</th>
                <th className="py-3.5 px-4">Status & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada transaksi gate tercatat di Firestore.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{tx.truckNumber}</div>
                      <div className="text-[11px] text-slate-500">{tx.driverName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {getTypeLabel(tx.transactionType)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {tx.containerNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {tx.gateLane}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                          {tx.notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Gate */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Catat Pemeriksaan Truk di Gate
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plat Nomor Truk</label>
                  <input
                    type="text"
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    placeholder="B 9812 UIK"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pengemudi</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Bambang Supriyanto"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Kontainer</label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    placeholder="TGHU9931024"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jalur Gerbang (Lane)</label>
                  <select
                    value={gateLane}
                    onChange={(e) => setGateLane(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Gate In - Jalur 01">Gate In - Jalur 01</option>
                    <option value="Gate In - Jalur 02">Gate In - Jalur 02</option>
                    <option value="Gate Out - Jalur 01">Gate Out - Jalur 01</option>
                    <option value="Gate Out - Jalur 02">Gate Out - Jalur 02</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Transaksi</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as GateTransactionType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="GATE_IN_RECEIVING">Gate In: Receiving (Bawa Ekspor)</option>
                    <option value="GATE_IN_DELIVERY">Gate In: Delivery (Jemput Impor)</option>
                    <option value="GATE_OUT_RECEIVING">Gate Out: Receiving (Kosong Keluar)</option>
                    <option value="GATE_OUT_DELIVERY">Gate Out: Delivery (Bawa Keluar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Inspeksi</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as GateStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="APPROVED">APPROVED (Lolos Pemeriksaan)</option>
                    <option value="INSPECTED">INSPECTED (Pemeriksaan Fisik)</option>
                    <option value="WAITING">WAITING (Menunggu Dokumen)</option>
                    <option value="REJECTED">REJECTED (Ditolak Masuk/Keluar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Inspeksi</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan segel atau kondisi fisik..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
