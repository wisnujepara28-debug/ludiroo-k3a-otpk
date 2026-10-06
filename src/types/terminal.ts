export type ContainerIsoType = '20GP' | '40GP' | '40HC' | '20RF' | '40RF' | '20OT' | '40FR';
export type ContainerStatus = 'YARD' | 'GATE_IN' | 'GATE_OUT' | 'LOADED' | 'DISCHARGED';
export type TradeCategory = 'IMPORT' | 'EXPORT' | 'TRANSSHIPMENT' | 'DOMESTIC';
export type LoadStatus = 'FCL' | 'LCL' | 'EMPTY';
export type CustomsStatus = 'CLEARED' | 'INSPECTION' | 'HOLD' | 'PENDING';

export interface ContainerRecord {
  id: string;
  containerNumber: string; // ISO 6346 (e.g., TGHU1234567)
  isoType: ContainerIsoType;
  size: 20 | 40;
  status: ContainerStatus;
  category: TradeCategory;
  loadStatus: LoadStatus;
  grossWeight: number; // in kg
  tareWeight: number; // in kg
  sealNumber: string;
  block: string; // e.g. "A", "B", "C", "D"
  bay: number; // 1 - 24
  row: number; // 1 - 6
  tier: number; // 1 - 5
  vesselName: string;
  voyageNumber: string;
  shippingLine: string;
  consignee: string;
  shipper: string;
  customsStatus: CustomsStatus;
  isReefer: boolean;
  reeferTemp?: number; // in Celsius
  reeferPlugStatus?: boolean;
  damaged: boolean;
  damageNotes?: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type VesselStatus = 'SCHEDULED' | 'BERTHED' | 'WORKING' | 'COMPLETED' | 'DEPARTED';

export interface VesselRecord {
  id: string;
  vesselName: string;
  voyageIn: string;
  voyageOut: string;
  shippingLine: string;
  berthNumber: string; // e.g. "Dermaga 01", "Dermaga 02"
  eta: string;
  etd: string;
  status: VesselStatus;
  totalTeus: number;
  completedTeus: number;
  craneAssigned?: string;
  createdAt: string;
  updatedAt: string;
}

export type GateTransactionType = 
  | 'GATE_IN_RECEIVING' 
  | 'GATE_IN_DELIVERY' 
  | 'GATE_OUT_RECEIVING' 
  | 'GATE_OUT_DELIVERY';

export type GateStatus = 'INSPECTED' | 'WAITING' | 'APPROVED' | 'REJECTED';

export interface GateTransactionRecord {
  id: string;
  truckNumber: string;
  driverName: string;
  containerNumber: string;
  transactionType: GateTransactionType;
  status: GateStatus;
  gateLane: string;
  notes: string;
  timestamp: string;
  operatorEmail: string;
}

export interface TerminalStats {
  totalContainers: number;
  totalTeus: number;
  yardOccupancyPercent: number;
  fclCount: number;
  emptyCount: number;
  reeferActiveCount: number;
  vesselsActive: number;
  gateTodayCount: number;
}
