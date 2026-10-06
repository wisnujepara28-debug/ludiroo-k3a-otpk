import React, { useState, useEffect } from 'react';
import type { ContainerRecord, ContainerIsoType, ContainerStatus, TradeCategory, LoadStatus, CustomsStatus } from '../types/terminal';
import { validateContainerNumber } from '../services/terminalService';
import {
  X,
  Box,
  Scale,
  MapPin,
  Ship,
  FileCheck,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Save,
} from 'lucide-react';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: ContainerRecord | null;
  mode: 'create' | 'edit';
}

const ISO_TYPES: { code: ContainerIsoType; name: string; size: 20 | 40; isReefer?: boolean }[] = [
  { code: '20GP', name: '20ft General Purpose (Standard)', size: 20 },
  { code: '40GP', name: '40ft General Purpose (Standard)', size: 40 },
  { code: '40HC', name: '40ft High Cube (Extra Height)', size: 40 },
  { code: '20RF', name: '20ft Reefer (Refrigerated)', size: 20, isReefer: true },
  { code: '40RF', name: '40ft Reefer (Refrigerated High Cube)', size: 40, isReefer: true },
  { code: '20OT', name: '20ft Open Top', size: 20 },
  { code: '40FR', name: '40ft Flat Rack', size: 40 },
];

const SHIPPING_LINES = [
  'Maersk Line',
  'Ocean Network Express (ONE)',
  'Evergreen Marine',
  'Meratus Line',
  'Samudera Indonesia',
  'CMA CGM',
  'MSC (Mediterranean Shipping Co)',
  'Cosco Shipping',
  'Hapag-Lloyd',
  'Temas Line',
  'Tanto Intim Line',
];

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [containerNumber, setContainerNumber] = useState('');
  const [isoType, setIsoType] = useState<ContainerIsoType>('20GP');
  const [size, setSize] = useState<20 | 40>(20);
  const [status, setStatus] = useState<ContainerStatus>('YARD');
  const [category, setCategory] = useState<TradeCategory>('IMPORT');
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('FCL');
  const [grossWeight, setGrossWeight] = useState<number>(18500);
  const [tareWeight, setTareWeight] = useState<number>(2200);
  const [sealNumber, setSealNumber] = useState('');
  const [block, setBlock] = useState('A');
  const [bay, setBay] = useState<number>(4);
  const [row, setRow] = useState<number>(2);
  const [tier, setTier] = useState<number>(2);
  const [vesselName, setVesselName] = useState('MV MERATUS BORNEO');
  const [voyageNumber, setVoyageNumber] = useState('V.2501E');
  const [shippingLine, setShippingLine] = useState('Meratus Line');
  const [consignee, setConsignee] = useState('');
  const [shipper, setShipper] = useState('');
  const [customsStatus, setCustomsStatus] = useState<CustomsStatus>('CLEARED');
  const [isReefer, setIsReefer] = useState(false);
  const [reeferTemp, setReeferTemp] = useState<number>(-18);
  const [reeferPlugStatus, setReeferPlugStatus] = useState(false);
  const [damaged, setDamaged] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setContainerNumber(initialData.containerNumber);
      setIsoType(initialData.isoType);
      setSize(initialData.size);
      setStatus(initialData.status);
      setCategory(initialData.category);
      setLoadStatus(initialData.loadStatus);
      setGrossWeight(initialData.grossWeight);
      setTareWeight(initialData.tareWeight);
      setSealNumber(initialData.sealNumber || '');
      setBlock(initialData.block);
      setBay(initialData.bay);
      setRow(initialData.row);
      setTier(initialData.tier);
      setVesselName(initialData.vesselName || '');
      setVoyageNumber(initialData.voyageNumber || '');
      setShippingLine(initialData.shippingLine || 'Meratus Line');
      setConsignee(initialData.consignee || '');
      setShipper(initialData.shipper || '');
      setCustomsStatus(initialData.customsStatus);
      setIsReefer(initialData.isReefer || false);
      setReeferTemp(initialData.reeferTemp ?? -18);
      setReeferPlugStatus(initialData.reeferPlugStatus || false);
      setDamaged(initialData.damaged || false);
      setDamageNotes(initialData.damageNotes || '');
    } else {
      // Defaults for new container
      setContainerNumber('');
      setIsoType('20GP');
      setSize(20);
      setStatus('YARD');
      setCategory('IMPORT');
      setLoadStatus('FCL');
      setGrossWeight(18500);
      setTareWeight(2200);
      setSealNumber('SL-' + Math.floor(100000 + Math.random() * 900000));
      setBlock('A');
      setBay(4);
      setRow(2);
      setTier(2);
      setVesselName('MV MERATUS BORNEO');
      setVoyageNumber('V.2501E');
      setShippingLine('Meratus Line');
      setConsignee('PT INDO LOGISTIK NUSANTARA');
      setShipper('PT SEGAR ALAM RAYA');
      setCustomsStatus('CLEARED');
      setIsReefer(false);
      setReeferTemp(-18);
      setReeferPlugStatus(false);
      setDamaged(false);
      setDamageNotes('');
    }
    setValidationError(null);
  }, [initialData, mode, isOpen]);

  const handleIsoChange = (val: ContainerIsoType) => {
    setIsoType(val);
    const selected = ISO_TYPES.find((t) => t.code === val);
    if (selected) {
      setSize(selected.size);
      if (selected.isReefer) {
        setIsReefer(true);
      }
      // auto set appropriate tare
      if (selected.size === 40) {
        setTareWeight(val === '40RF' ? 4500 : 3800);
        if (grossWeight < 5000) setGrossWeight(24000);
      } else {
        setTareWeight(val === '20RF' ? 3000 : 2200);
        if (grossWeight < 4000) setGrossWeight(16000);
      }
    }
  };

  const handleContainerNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    setContainerNumber(raw);
    if (raw.length > 0) {
      const check = validateContainerNumber(raw);
      if (!check.isValid) {
        setValidationError(check.message || null);
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Strict Validations
    const checkNum = validateContainerNumber(containerNumber);
    if (!checkNum.isValid) {
      setValidationError(checkNum.message || 'Nomor kontainer tidak valid.');
      return;
    }

    if (grossWeight <= 0 || isNaN(grossWeight)) {
      setValidationError('Berat kotor harus lebih dari 0 kg.');
      return;
    }

    if (grossWeight > 36000) {
      setValidationError('Berat kotor melebihi batas standar terminal (Maksimum 36.000 kg / 36 Ton).');
      return;
    }

    if (tareWeight >= grossWeight && loadStatus !== 'EMPTY') {
      setValidationError('Berat kotor harus lebih besar dari berat tara untuk kontainer berisi (FCL/LCL).');
      return;
    }

    if (bay < 1 || bay > 24) {
      setValidationError('Nomor Bay harus di antara 1 dan 24.');
      return;
    }

    if (row < 1 || row > 6) {
      setValidationError('Nomor Row harus di antara 1 dan 6.');
      return;
    }

    if (tier < 1 || tier > 5) {
      setValidationError('Tingkat Tier penumpukan harus di antara 1 dan 5.');
      return;
    }

    if (isReefer && (reeferTemp < -35 || reeferTemp > 25)) {
      setValidationError('Suhu reefer harus di antara -35°C s/d +25°C.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        containerNumber: containerNumber.trim().toUpperCase(),
        isoType,
        size,
        status,
        category,
        loadStatus,
        grossWeight: Number(grossWeight),
        tareWeight: Number(tareWeight),
        sealNumber: sealNumber.trim(),
        block,
        bay: Number(bay),
        row: Number(row),
        tier: Number(tier),
        vesselName: vesselName.trim(),
        voyageNumber: voyageNumber.trim(),
        shippingLine,
        consignee: consignee.trim(),
        shipper: shipper.trim(),
        customsStatus,
        isReefer,
        reeferTemp: isReefer ? Number(reeferTemp) : undefined,
        reeferPlugStatus: isReefer ? reeferPlugStatus : false,
        damaged,
        damageNotes: damaged ? damageNotes.trim() : '',
        updatedBy: '', // Set by caller
      });
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setValidationError(e.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isNumValid = validateContainerNumber(containerNumber).isValid;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-linear-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Box className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {mode === 'create' ? 'Tambah Data Peti Kemas Baru' : `Perbarui Peti Kemas (${initialData?.containerNumber})`}
              </h3>
              <p className="text-xs text-blue-200">
                Penyimpanan langsung ke Firebase Firestore dengan validasi ketat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Kesalahan Validasi:</span> {validationError}
              </div>
            </div>
          )}

          {/* Section 1: Container Number & Type */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-blue-600" />
              1. Identitas & Tipe Kontainer
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kontainer (ISO 6346) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={handleContainerNumberInput}
                    placeholder="Contoh: MSKU9382104"
                    maxLength={11}
                    required
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono text-sm tracking-widest font-bold uppercase transition-all ${
                      isNumValid
                        ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-500'
                        : containerNumber.length > 0
                        ? 'border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-rose-500'
                        : 'border-slate-300 text-slate-900 focus:ring-blue-600'
                    } focus:outline-none focus:ring-2`}
                  />
                  <div className="absolute right-3 top-2.5">
                    {isNumValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {containerNumber.length}/11
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  4 huruf pemilik/tipe + 7 digit nomor registrasi.
                </p>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe & Ukuran ISO <span className="text-rose-500">*</span>
                </label>
                <select
                  value={isoType}
                  onChange={(e) => handleIsoChange(e.target.value as ContainerIsoType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ISO_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.code} - {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ukuran terdeteksi: <strong>{size} Feet</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Weight & Status */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              2. Status Operasional & Berat (Kg)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Operasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="YARD">YARD (Di Lapangan)</option>
                  <option value="GATE_IN">GATE_IN (Masuk)</option>
                  <option value="GATE_OUT">GATE_OUT (Keluar)</option>
                  <option value="LOADED">LOADED (Di Kapal)</option>
                  <option value="DISCHARGED">DISCHARGED (Bongkar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Arus
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TradeCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="IMPORT">IMPORT (Impor)</option>
                  <option value="EXPORT">EXPORT (Ekspor)</option>
                  <option value="TRANSSHIPMENT">TRANSSHIPMENT</option>
                  <option value="DOMESTIC">DOMESTIC (Domestik)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kondisi Muatan
                </label>
                <select
                  value={loadStatus}
                  onChange={(e) => setLoadStatus(e.target.value as LoadStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="FCL">FCL (Full Container)</option>
                  <option value="LCL">LCL (Less Container)</option>
                  <option value="EMPTY">EMPTY (Kosong)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bea Cukai (SPPB)
                </label>
                <select
                  value={customsStatus}
                  onChange={(e) => setCustomsStatus(e.target.value as CustomsStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="CLEARED">CLEARED (Disetujui)</option>
                  <option value="INSPECTION">INSPECTION (Jalur Merah)</option>
                  <option value="HOLD">HOLD (Ditahan)</option>
                  <option value="PENDING">PENDING (Menunggu)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berat Kotor (Gross Kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={500}
                  max={36000}
                  step={50}
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berat Tara (Tare Kg)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={8000}
                  step={50}
                  value={tareWeight}
                  onChange={(e) => setTareWeight(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Segel (Seal No)
                </label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="ML-881290"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Yard Stacking Position */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              3. Posisi Lapangan Penumpukan (Yard Slot)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blok Lapangan
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="A">Blok A (Impor Umum)</option>
                  <option value="B">Blok B (Reefer / Berpendingin)</option>
                  <option value="C">Blok C (Ekspor Siap Muat)</option>
                  <option value="D">Blok D (Transshipment)</option>
                  <option value="E">Blok E (Empty Container)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bay (1 - 24)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={bay}
                  onChange={(e) => setBay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Row (1 - 6)
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={row}
                  onChange={(e) => setRow(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier (Tingkat 1 - 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={tier}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-700 font-mono font-medium">
              Alamat Slot Terpadu: <strong>{block}-{String(bay).padStart(2, '0')}-{String(row).padStart(2, '0')}-{tier}</strong>
            </div>
          </div>

          {/* Section 4: Shipping Line & Vessel */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-blue-600" />
              4. Pelayaran, Kapal & Pihak Terkait
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator Pelayaran
                </label>
                <select
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {SHIPPING_LINES.map((sl) => (
                    <option key={sl} value={sl}>
                      {sl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kapal (Vessel)
                </label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="MV MERATUS BORNEO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Voyage
                </label>
                <input
                  type="text"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  placeholder="V.2501E"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima (Consignee)
                </label>
                <input
                  type="text"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  placeholder="PT INDOFOOD CBP SUKSES MAKMUR"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pengirim (Shipper)
                </label>
                <input
                  type="text"
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                  placeholder="PT SEGAR MAKMUR UTAMA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Reefer & Physical Inspection */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReefer}
                    onChange={(e) => setIsReefer(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                  Kontainer Berpendingin (Reefer Unit)
                </label>
              </div>

              {isReefer && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-600">Suhu Target:</span>
                    <input
                      type="number"
                      step={0.5}
                      value={reeferTemp}
                      onChange={(e) => setReeferTemp(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                    <span className="text-slate-500">°C</span>
                  </div>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={reeferPlugStatus}
                      onChange={(e) => setReeferPlugStatus(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded-sm"
                    />
                    Plug Listrik Aktif
                  </label>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={damaged}
                  onChange={(e) => setDamaged(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                />
                Terdapat Kerusakan Fisik (Hasil Pemeriksaan Tally / Gate)
              </label>

              {damaged && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Deskripsi kerusakan, misal: dinding kanan penyok 15cm, segel rusak..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Simpan Peti Kemas' : 'Perbarui Perubahan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
