import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  ContainerRecord,
  VesselRecord,
  GateTransactionRecord,
} from '../types/terminal';

// Validate ISO 6346 Container Number format: 4 capital letters followed by 7 digits
export function validateContainerNumber(code: string): { isValid: boolean; message?: string } {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) {
    return { isValid: false, message: 'Nomor kontainer wajib diisi.' };
  }
  const isoPattern = /^[A-Z]{4}\d{7}$/;
  if (!isoPattern.test(cleaned)) {
    return {
      isValid: false,
      message: 'Format harus standar ISO 6346 (4 huruf kapital + 7 angka, misal: TGHU1234567 atau MSKU7654321).',
    };
  }
  return { isValid: true };
}

// -------------------------------------------------------------
// CONTAINER CRUD OPERATIONS
// -------------------------------------------------------------

export function subscribeContainers(
  onData: (containers: ContainerRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, 'containers'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ContainerRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<ContainerRecord, 'id'>) });
      });
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'containers');
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function addContainer(
  containerData: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>,
  operatorEmail: string
): Promise<string> {
  const now = new Date().toISOString();
  const validCheck = validateContainerNumber(containerData.containerNumber);
  if (!validCheck.isValid) {
    throw new Error(validCheck.message);
  }

  if (containerData.grossWeight <= 0 || containerData.grossWeight > 36000) {
    throw new Error('Berat kotor kontainer harus di antara 500 kg s/d 36.000 kg.');
  }

  // Sanitized document ID
  const sanitizedNumber = containerData.containerNumber.trim().toUpperCase();
  const docId = `CNT-${sanitizedNumber}-${Date.now().toString().slice(-4)}`;
  const docRef = doc(db, 'containers', docId);

  const payload: ContainerRecord = {
    ...containerData,
    id: docId,
    containerNumber: sanitizedNumber,
    updatedBy: operatorEmail,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, payload);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `containers/${docId}`);
    throw err;
  }
}

export async function updateContainer(
  id: string,
  updates: Partial<ContainerRecord>,
  operatorEmail: string
): Promise<void> {
  const docRef = doc(db, 'containers', id);
  const now = new Date().toISOString();

  if (updates.containerNumber) {
    const validCheck = validateContainerNumber(updates.containerNumber);
    if (!validCheck.isValid) {
      throw new Error(validCheck.message);
    }
    updates.containerNumber = updates.containerNumber.trim().toUpperCase();
  }

  if (updates.grossWeight !== undefined && (updates.grossWeight <= 0 || updates.grossWeight > 36000)) {
    throw new Error('Berat kotor kontainer harus di antara 500 kg s/d 36.000 kg.');
  }

  const payload = {
    ...updates,
    updatedBy: operatorEmail,
    updatedAt: now,
  };

  try {
    await updateDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `containers/${id}`);
    throw err;
  }
}

export async function deleteContainer(id: string): Promise<void> {
  const docRef = doc(db, 'containers', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `containers/${id}`);
    throw err;
  }
}

// -------------------------------------------------------------
// VESSEL CRUD OPERATIONS
// -------------------------------------------------------------

export function subscribeVessels(
  onData: (vessels: VesselRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, 'vessels'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: VesselRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<VesselRecord, 'id'>) });
      });
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'vessels');
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function addVessel(
  vesselData: Omit<VesselRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const docId = `VSL-${Date.now()}`;
  const docRef = doc(db, 'vessels', docId);

  const payload: VesselRecord = {
    ...vesselData,
    id: docId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, payload);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `vessels/${docId}`);
    throw err;
  }
}

export async function updateVessel(id: string, updates: Partial<VesselRecord>): Promise<void> {
  const docRef = doc(db, 'vessels', id);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `vessels/${id}`);
    throw err;
  }
}

export async function deleteVessel(id: string): Promise<void> {
  const docRef = doc(db, 'vessels', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `vessels/${id}`);
    throw err;
  }
}

// -------------------------------------------------------------
// GATE TRANSACTION OPERATIONS
// -------------------------------------------------------------

export function subscribeGateTransactions(
  onData: (txs: GateTransactionRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, 'gateTransactions'), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: GateTransactionRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<GateTransactionRecord, 'id'>) });
      });
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, 'gateTransactions');
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function addGateTransaction(
  txData: Omit<GateTransactionRecord, 'id' | 'timestamp'>
): Promise<string> {
  const docId = `GTX-${Date.now()}`;
  const docRef = doc(db, 'gateTransactions', docId);

  const payload: GateTransactionRecord = {
    ...txData,
    id: docId,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload);
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `gateTransactions/${docId}`);
    throw err;
  }
}

// -------------------------------------------------------------
// SEED INITIAL REALISTIC TERMINAL DATA
// -------------------------------------------------------------

export async function seedInitialTerminalData(operatorEmail: string): Promise<number> {
  const existingCheck = await getDocs(collection(db, 'containers'));
  if (!existingCheck.empty) {
    return 0; // Data already exists in Firestore
  }

  const initialContainers: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      containerNumber: 'MSKU1098234',
      isoType: '40HC',
      size: 40,
      status: 'YARD',
      category: 'IMPORT',
      loadStatus: 'FCL',
      grossWeight: 26800,
      tareWeight: 3900,
      sealNumber: 'ML-JKT-882190',
      block: 'A',
      bay: 4,
      row: 2,
      tier: 3,
      vesselName: 'MV MERATUS BORNEO',
      voyageNumber: 'V.2501E',
      shippingLine: 'Maersk Line',
      consignee: 'PT INDOFOOD CBP SUKSES MAKMUR',
      shipper: 'CARGILL AGRI TRADING PTE LTD',
      customsStatus: 'CLEARED',
      isReefer: false,
      damaged: false,
      damageNotes: '',
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'ONEU7239105',
      isoType: '40RF',
      size: 40,
      status: 'YARD',
      category: 'EXPORT',
      loadStatus: 'FCL',
      grossWeight: 24500,
      tareWeight: 4400,
      sealNumber: 'ONE-SEAL-90112',
      block: 'B',
      bay: 2,
      row: 1,
      tier: 2,
      vesselName: 'MV WAN HAI 315',
      voyageNumber: 'W-088N',
      shippingLine: 'Ocean Network Express (ONE)',
      consignee: 'TOKYO SEAFOOD CO LTD',
      shipper: 'PT SEGAR MAKMUR LAUTAN',
      customsStatus: 'CLEARED',
      isReefer: true,
      reeferTemp: -20.5,
      reeferPlugStatus: true,
      damaged: false,
      damageNotes: '',
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'EMCU4492019',
      isoType: '20GP',
      size: 20,
      status: 'YARD',
      category: 'DOMESTIC',
      loadStatus: 'FCL',
      grossWeight: 18200,
      tareWeight: 2200,
      sealNumber: 'EVG-099412',
      block: 'A',
      bay: 8,
      row: 3,
      tier: 1,
      vesselName: 'MV SAMUDERA MAS',
      voyageNumber: 'SM-2025',
      shippingLine: 'Evergreen Marine',
      consignee: 'PT MAYORA INDAH TBK',
      shipper: 'PT SUMBER ALFARIA',
      customsStatus: 'CLEARED',
      isReefer: false,
      damaged: false,
      damageNotes: '',
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'TGHU9931024',
      isoType: '20GP',
      size: 20,
      status: 'GATE_IN',
      category: 'EXPORT',
      loadStatus: 'FCL',
      grossWeight: 14200,
      tareWeight: 2150,
      sealNumber: 'TG-SEAL-44102',
      block: 'C',
      bay: 12,
      row: 2,
      tier: 2,
      vesselName: 'MV MERATUS BORNEO',
      voyageNumber: 'V.2501E',
      shippingLine: 'Meratus Line',
      consignee: 'SINGAPORE LOGISTICS HUB',
      shipper: 'PT ANEKA KIMIA RAYA',
      customsStatus: 'INSPECTION',
      isReefer: false,
      damaged: true,
      damageNotes: 'Penyok ringan pada panel pintu kanan belakang',
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'CMAU3198042',
      isoType: '40HC',
      size: 40,
      status: 'LOADED',
      category: 'TRANSSHIPMENT',
      loadStatus: 'FCL',
      grossWeight: 29100,
      tareWeight: 3880,
      sealNumber: 'CMA-99210-CG',
      block: 'D',
      bay: 6,
      row: 4,
      tier: 4,
      vesselName: 'MV CMA CGM VOLTAIRE',
      voyageNumber: 'FR-004S',
      shippingLine: 'CMA CGM',
      consignee: 'ROTTERDAM PORT HANDLING BV',
      shipper: 'PT DUA KELINCI',
      customsStatus: 'CLEARED',
      isReefer: false,
      damaged: false,
      damageNotes: '',
      updatedBy: operatorEmail,
    },
    {
      containerNumber: 'SITU2001928',
      isoType: '20GP',
      size: 20,
      status: 'YARD',
      category: 'DOMESTIC',
      loadStatus: 'EMPTY',
      grossWeight: 2200,
      tareWeight: 2200,
      sealNumber: 'EMPTY-YARD',
      block: 'E',
      bay: 1,
      row: 1,
      tier: 1,
      vesselName: 'MV SAMUDERA MAS',
      voyageNumber: 'SM-2025',
      shippingLine: 'Samudera Indonesia',
      consignee: 'DEPOT SAMUDERA SURABAYA',
      shipper: 'TERMINAL PETI KEMAS JAPARA',
      customsStatus: 'CLEARED',
      isReefer: false,
      damaged: false,
      damageNotes: '',
      updatedBy: operatorEmail,
    },
  ];

  let count = 0;
  for (const c of initialContainers) {
    await addContainer(c, operatorEmail);
    count++;
  }

  // Also seed initial vessels
  const initialVessels: Omit<VesselRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      vesselName: 'MV MERATUS BORNEO',
      voyageIn: 'V.2501E',
      voyageOut: 'V.2501W',
      shippingLine: 'Meratus Line',
      berthNumber: 'Dermaga 01 (Utara)',
      eta: '2026-10-05T06:00:00.000Z',
      etd: '2026-10-07T18:00:00.000Z',
      status: 'WORKING',
      totalTeus: 850,
      completedTeus: 520,
      craneAssigned: 'Quay Crane 01 & 02',
    },
    {
      vesselName: 'MV CMA CGM VOLTAIRE',
      voyageIn: 'FR-004S',
      voyageOut: 'FR-004N',
      shippingLine: 'CMA CGM',
      berthNumber: 'Dermaga 02 (Selatan)',
      eta: '2026-10-04T12:00:00.000Z',
      etd: '2026-10-06T22:00:00.000Z',
      status: 'BERTHED',
      totalTeus: 1400,
      completedTeus: 1100,
      craneAssigned: 'Quay Crane 03 & 04',
    },
    {
      vesselName: 'MV WAN HAI 315',
      voyageIn: 'W-088N',
      voyageOut: 'W-089S',
      shippingLine: 'Ocean Network Express (ONE)',
      berthNumber: 'Dermaga 03 (Timur)',
      eta: '2026-10-08T08:00:00.000Z',
      etd: '2026-10-10T15:00:00.000Z',
      status: 'SCHEDULED',
      totalTeus: 920,
      completedTeus: 0,
      craneAssigned: 'Quay Crane 05',
    },
  ];

  for (const v of initialVessels) {
    await addVessel(v);
  }

  // Seed initial Gate transaction
  await addGateTransaction({
    truckNumber: 'B 9812 UIK',
    driverName: 'Bambang Supriyanto',
    containerNumber: 'TGHU9931024',
    transactionType: 'GATE_IN_RECEIVING',
    status: 'INSPECTED',
    gateLane: 'Gate In - Jalur 02',
    notes: 'Pemeriksaan fisik peti kemas selesai, ada penyok ringan sisi kanan.',
    operatorEmail,
  });

  return count;
}
