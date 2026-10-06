import React from 'react';
import type { ContainerRecord } from '../types/terminal';
import {
  X,
  Box,
  MapPin,
  Scale,
  Ship,
  FileCheck,
  Thermometer,
  AlertTriangle,
  Calendar,
  User,
  Edit,
  Trash2,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface ContainerDetailModalProps {
  container: ContainerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (container: ContainerRecord) => void;
  onDelete: (container: ContainerRecord) => void;
}

export const ContainerDetailModal: React.FC<ContainerDetailModalProps> = ({
  container,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !container) return null;

  const netCargoWeight = Math.max(0, container.grossWeight - container.tareWeight);

  const getStatusBadge = (status: string) => {
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
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCustomsBadge = (cStatus: string) => {
    switch (cStatus) {
      case 'CLEARED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'INSPECTION':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'HOLD':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/20">
                  {container.isoType} • {container.size} FT
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadge(container.status)}`}>
                  {container.status}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
                  {container.loadStatus}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider text-white">
                {container.containerNumber}
              </h2>
              <p className="text-xs text-blue-200 mt-1">
                {container.shippingLine} • Segel: <span className="font-mono">{container.sealNumber || '-'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
          {/* Yard Location Highlight Card */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
                  Alamat Penumpukan di Yard
                </span>
                <h3 className="text-xl font-mono font-extrabold text-slate-900">
                  Blok {container.block} • Bay {container.bay} • Row {container.row} • Tier {container.tier}
                </h3>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white text-xs font-mono font-bold text-blue-900 border border-blue-200 shadow-xs">
              SLOT: {container.block}-{String(container.bay).padStart(2, '0')}-{String(container.row).padStart(2, '0')}-{container.tier}
            </div>
          </div>

          {/* Weight Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              Berat & Beban Peti Kemas
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Berat Kotor (Gross)</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {container.grossWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Berat Tara (Kosong)</span>
                <span className="text-base font-bold text-slate-600 font-mono">
                  {container.tareWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block font-medium">Muatan Bersih (Payload)</span>
                <span className="text-base font-bold text-emerald-950 font-mono">
                  {netCargoWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
            </div>
          </div>

          {/* Vessel & Trade Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-blue-600" />
                Informasi Kapal & Pelayaran
              </h4>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Nama Kapal:</dt>
                  <dd className="font-semibold text-slate-900">{container.vesselName || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Nomor Voyage:</dt>
                  <dd className="font-mono font-medium text-slate-900">{container.voyageNumber || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Operator Pelayaran:</dt>
                  <dd className="font-medium text-slate-900">{container.shippingLine}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Kategori Arus:</dt>
                  <dd className="font-semibold text-blue-700">{container.category}</dd>
                </div>
              </dl>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Pihak Terkait & Kepabeanan
              </h4>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-slate-500">Penerima (Consignee):</dt>
                  <dd className="font-semibold text-slate-900 truncate">{container.consignee || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Pengirim (Shipper):</dt>
                  <dd className="font-medium text-slate-800 truncate">{container.shipper || '-'}</dd>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <dt className="text-slate-500">Bea Cukai (SPPB):</dt>
                  <dd className={`px-2 py-0.5 rounded-md font-bold border text-[11px] ${getCustomsBadge(container.customsStatus)}`}>
                    {container.customsStatus}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Reefer & Damage Details */}
          {(container.isReefer || container.damaged) && (
            <div className="space-y-3">
              {container.isReefer && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="text-xs font-bold text-blue-950">Unit Kontainer Berpendingin (Reefer)</h5>
                      <p className="text-[11px] text-blue-700">
                        Suhu Terprogram: <strong>{container.reeferTemp ?? 0}°C</strong>
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                    container.reeferPlugStatus ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {container.reeferPlugStatus ? 'Power Plug Aktif' : 'Tidak Terhubung Plug'}
                  </span>
                </div>
              )}

              {container.damaged && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-950">Catatan Kerusakan Fisik</h5>
                    <p className="text-xs text-amber-800 mt-0.5">{container.damageNotes || 'Terdapat kerusakan tercatat pada survey fisik.'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata & Audit */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Diperbarui oleh: <strong>{container.updatedBy || 'Sistem'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Terakhir: {new Date(container.updatedAt).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.print();
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Tally Slip
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onDelete(container);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(container);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
