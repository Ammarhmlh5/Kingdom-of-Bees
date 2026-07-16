export interface Apiary {
  id: string;
  name: string;
  type: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hiveCount?: number;
  createdAt?: string;
}

export interface Hive {
  id: string;
  apiaryId: string;
  name: string;
  type: string;
  status: string;
  queenYear?: number;
  queenSource?: string;
  framesCount?: number;
  createdAt?: string;
}

export interface Inspection {
  id: string;
  hiveId: string;
  date: string;
  temperament?: string;
  queenSeen?: boolean;
  eggsSeen?: boolean;
  storesAdequate?: boolean;
  notes?: string;
  frames?: FrameData[];
}

export interface FrameData {
  position: number;
  type: string;
  broodPercent?: number;
  honeyPercent?: number;
  pollenPercent?: number;
  foundationPercent?: number;
}

export interface DiseaseRecord {
  id: string;
  hiveId: string;
  disease: string;
  severity: string;
  treatment?: string;
  date: string;
  notes?: string;
}

export interface FeedingRecord {
  id: string;
  hiveId: string;
  type: string;
  amount: string;
  date: string;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  hiveId: string;
  amount: string;
  type: string;
  date: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface SyncQueueItem {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}
