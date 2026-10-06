import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ContainerTable } from './components/ContainerTable';
import { ContainerModal } from './components/ContainerModal';
import { ContainerDetailModal } from './components/ContainerDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { YardPlanner } from './components/YardPlanner';
import { VesselOperations } from './components/VesselOperations';
import { GateOperations } from './components/GateOperations';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  subscribeContainers,
  addContainer,
  updateContainer,
  deleteContainer,
  subscribeVessels,
  addVessel,
  updateVessel,
  deleteVessel,
  subscribeGateTransactions,
  addGateTransaction,
  seedInitialTerminalData,
} from './services/terminalService';
import type { ContainerRecord, VesselRecord, GateTransactionRecord } from './types/terminal';
import { Box, Loader2 } from 'lucide-react';

const TerminalApp: React.FC = () => {
  const { user, role, loading: authLoading } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'containers' | 'yard' | 'vessels' | 'gate'>('overview');

  // Real-time Firestore state (Single Source of Truth)
  const [containers, setContainers] = useState<ContainerRecord[]>([]);
  const [vessels, setVessels] = useState<VesselRecord[]>([]);
  const [gateTransactions, setGateTransactions] = useState<GateTransactionRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [containerModalOpen, setContainerModalOpen] = useState(false);
  const [containerModalMode, setContainerModalMode] = useState<'create' | 'edit'>('create');
  const [editingContainer, setEditingContainer] = useState<ContainerRecord | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerRecord | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [containerToDelete, setContainerToDelete] = useState<ContainerRecord | null>(null);

  // Pre-filled slot for Yard Planner click
  const [slotPrefill, setSlotPrefill] = useState<{ block: string; bay: number; row: number; tier: number } | null>(null);

  // Seeding
  const [seeding, setSeeding] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time subscriptions to Firestore
  useEffect(() => {
    if (!user) {
      setContainers([]);
      setVessels([]);
      setGateTransactions([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubContainers = subscribeContainers(
      (data) => {
        setContainers(data);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error fetching containers:', err);
        addToast('error', 'Gagal memuat peti kemas', err.message);
        setDataLoading(false);
      }
    );

    const unsubVessels = subscribeVessels(
      (data) => setVessels(data),
      (err) => console.error('Error fetching vessels:', err)
    );

    const unsubGate = subscribeGateTransactions(
      (data) => setGateTransactions(data),
      (err) => console.error('Error fetching gate transactions:', err)
    );

    return () => {
      unsubContainers();
      unsubVessels();
      unsubGate();
    };
  }, [user]);

  // Handle Seeding initial terminal data
  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const count = await seedInitialTerminalData(user.email || 'admin@terminalpetikemas.id');
      if (count > 0) {
        addToast(
          'success',
          'Data Awal Berhasil Dimuat',
          `${count} peti kemas, armada kapal, dan transaksi gate tersimpan di Firestore.`
        );
      } else {
        addToast('info', 'Data Sudah Tersedia', 'Koleksi Firestore telah berisi data terminal.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal memuat data awal', e.message);
    } finally {
      setSeeding(false);
    }
  };

  // CRUD Container Handlers
  const handleOpenCreateContainer = () => {
    setEditingContainer(null);
    setSlotPrefill(null);
    setContainerModalMode('create');
    setContainerModalOpen(true);
  };

  const handleOpenEditContainer = (c: ContainerRecord) => {
    setEditingContainer(c);
    setContainerModalMode('edit');
    setContainerModalOpen(true);
  };

  const handleOpenDeleteContainer = (c: ContainerRecord) => {
    setContainerToDelete(c);
    setDeleteModalOpen(true);
  };

  const handleSelectContainer = (c: ContainerRecord) => {
    setSelectedContainer(c);
    setDetailModalOpen(true);
  };

  const handleAddAtSlot = (block: string, bay: number, row: number, tier: number) => {
    setSlotPrefill({ block, bay, row, tier });
    setEditingContainer(null);
    setContainerModalMode('create');
    setContainerModalOpen(true);
  };

  const handleSaveContainer = async (data: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const operator = user?.email || 'admin@terminalpetikemas.id';
    try {
      if (containerModalMode === 'create') {
        const id = await addContainer(data, operator);
        addToast(
          'success',
          'Peti Kemas Berhasil Ditambahkan',
          `Nomor ${data.containerNumber} dialokasikan di Blok ${data.block}, Bay ${data.bay}.`
        );
      } else if (editingContainer) {
        await updateContainer(editingContainer.id, data, operator);
        addToast(
          'success',
          'Peti Kemas Berhasil Diperbarui',
          `Perubahan pada nomor ${data.containerNumber} telah disimpan ke Firestore.`
        );
      }
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Menyimpan Data', e.message);
      throw err;
    }
  };

  const handleConfirmDeleteContainer = async () => {
    if (!containerToDelete) return;
    try {
      await deleteContainer(containerToDelete.id);
      addToast(
        'success',
        'Peti Kemas Dihapus',
        `Data kontainer ${containerToDelete.containerNumber} telah dihapus dari basis data Firestore.`
      );
      if (selectedContainer?.id === containerToDelete.id) {
        setDetailModalOpen(false);
      }
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Menghapus Peti Kemas', e.message);
      throw err;
    }
  };

  // Vessel Handlers
  const handleAddVessel = async (vesselData: Omit<VesselRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addVessel(vesselData);
      addToast('success', 'Jadwal Kapal Ditambahkan', `${vesselData.vesselName} dialokasikan di ${vesselData.berthNumber}.`);
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Menambah Kapal', e.message);
      throw err;
    }
  };

  const handleUpdateVessel = async (id: string, updates: Partial<VesselRecord>) => {
    try {
      await updateVessel(id, updates);
      addToast('success', 'Jadwal Kapal Diperbarui', 'Perubahan progres dan status sandar disimpan.');
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Memperbarui Kapal', e.message);
      throw err;
    }
  };

  const handleDeleteVessel = async (id: string) => {
    try {
      await deleteVessel(id);
      addToast('success', 'Jadwal Kapal Dihapus', 'Data kapal berhasil dihapus dari Firestore.');
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Menghapus Kapal', e.message);
      throw err;
    }
  };

  // Gate Transaction Handler
  const handleAddGateTransaction = async (txData: Omit<GateTransactionRecord, 'id' | 'timestamp'>) => {
    try {
      await addGateTransaction(txData);
      addToast('success', 'Transaksi Gate Tercatat', `Truk ${txData.truckNumber} berhasil diregistrasi di sistem gate.`);
    } catch (err: unknown) {
      const e = err as Error;
      addToast('error', 'Gagal Mencatat Gate', e.message);
      throw err;
    }
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4 animate-bounce">
          <Box className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">JAPARA TOS</h2>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Memeriksa status sesi autentikasi...
        </p>
      </div>
    );
  }

  // DEFAULT VIEW: Show Login Form if not authenticated
  if (!user) {
    return (
      <>
        <LoginForm
          onLoginSuccess={() => {
            addToast('success', 'Autentikasi Berhasil', 'Selamat datang di Sistem Operasional Terminal Peti Kemas JAPARA.');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSeedData={handleSeed}
        seeding={seeding}
        containersCount={containers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {dataLoading && containers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-800">Menghubungkan ke Firebase Firestore...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil inventaris peti kemas dan jadwal sandar kapal</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DashboardOverview
                containers={containers}
                vessels={vessels}
                gateTransactions={gateTransactions}
                onNavigateTab={setActiveTab}
                onOpenCreateContainer={handleOpenCreateContainer}
                onSeedData={handleSeed}
                seeding={seeding}
              />
            )}

            {activeTab === 'containers' && (
              <ContainerTable
                containers={containers}
                onOpenCreate={handleOpenCreateContainer}
                onOpenEdit={handleOpenEditContainer}
                onOpenDelete={handleOpenDeleteContainer}
                onSelectContainer={handleSelectContainer}
                userRole={role}
              />
            )}

            {activeTab === 'yard' && (
              <YardPlanner
                containers={containers}
                onSelectContainer={handleSelectContainer}
                onAddAtSlot={handleAddAtSlot}
              />
            )}

            {activeTab === 'vessels' && (
              <VesselOperations
                vessels={vessels}
                onAddVessel={handleAddVessel}
                onUpdateVessel={handleUpdateVessel}
                onDeleteVessel={handleDeleteVessel}
              />
            )}

            {activeTab === 'gate' && (
              <GateOperations
                transactions={gateTransactions}
                onAddTransaction={handleAddGateTransaction}
                operatorEmail={user.email || 'admin@terminalpetikemas.id'}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} <strong>JAPARA TOS</strong> — Sistem Operasional Terminal Peti Kemas JAPARA.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Basis Data: Firebase Firestore Enterprise</span>
            <span>•</span>
            <span>Single Source of Truth</span>
          </div>
        </div>
      </footer>

      {/* CRUD Container Modal (Create / Edit) */}
      <ContainerModal
        isOpen={containerModalOpen}
        onClose={() => setContainerModalOpen(false)}
        onSave={handleSaveContainer}
        initialData={
          editingContainer ||
          (slotPrefill
            ? ({
                containerNumber: '',
                isoType: '20GP',
                size: 20,
                status: 'YARD',
                category: 'IMPORT',
                loadStatus: 'FCL',
                grossWeight: 18000,
                tareWeight: 2200,
                sealNumber: '',
                block: slotPrefill.block,
                bay: slotPrefill.bay,
                row: slotPrefill.row,
                tier: slotPrefill.tier,
                vesselName: 'MV MERATUS BORNEO',
                voyageNumber: 'V.2501E',
                shippingLine: 'Meratus Line',
                consignee: '',
                shipper: '',
                customsStatus: 'CLEARED',
                isReefer: slotPrefill.block === 'B',
                damaged: false,
                damageNotes: '',
              } as ContainerRecord)
            : null)
        }
        mode={containerModalMode}
      />

      {/* Container Details Drawer / Modal */}
      <ContainerDetailModal
        container={selectedContainer}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(c) => {
          setDetailModalOpen(false);
          handleOpenEditContainer(c);
        }}
        onDelete={(c) => {
          setDetailModalOpen(false);
          handleOpenDeleteContainer(c);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteContainer}
        title="Hapus Data Peti Kemas"
        itemIdentifier={containerToDelete?.containerNumber || ''}
        description={`Peti kemas di Blok ${containerToDelete?.block} Bay ${containerToDelete?.bay} akan dihapus secara permanen dari Firestore.`}
      />

      {/* Interactive UI Toasts for Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TerminalApp />
    </AuthProvider>
  );
}
