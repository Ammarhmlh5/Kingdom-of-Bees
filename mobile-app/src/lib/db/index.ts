import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'kingdom-of-bees';
const DB_VERSION = 1;

const SCHEMA = {
  apiaries: '++id, name, type, location',
  hives: '++id, apiaryId, name, type, status',
  inspections: '++id, hiveId, date',
  disease_records: '++id, hiveId, disease, date',
  feeding_records: '++id, hiveId, date',
  harvest_records: '++id, hiveId, date',
  queen_batches: '++id, hiveId, startDate',
  bee_counts: '++id, timestamp, count',
  sync_queue: '++id, table, synced, timestamp',
  local_settings: 'key',
};

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const [storeName, indexes] of Object.entries(SCHEMA)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          const indexList = indexes.split(', ').slice(1);
          for (const idx of indexList) {
            store.createIndex(idx, idx);
          }
        }
      }
    },
  });

  return dbInstance;
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function getById<T>(storeName: string, id: number | string): Promise<T | undefined> {
  const db = await getDB();
  return db.get(storeName, id as any);
}

export async function put<T>(storeName: string, data: T): Promise<IDBValidKey> {
  const db = await getDB();
  return db.put(storeName, data);
}

export async function add<T>(storeName: string, data: T): Promise<IDBValidKey> {
  const db = await getDB();
  return db.add(storeName, data);
}

export async function remove(storeName: string, id: number | string): Promise<void> {
  const db = await getDB();
  return db.delete(storeName, id as any);
}

export async function clear(storeName: string): Promise<void> {
  const db = await getDB();
  return db.clear(storeName);
}

export async function addToSyncQueue(table: string, action: 'create' | 'update' | 'delete', data: any): Promise<void> {
  const db = await getDB();
  await db.add('sync_queue', {
    table,
    action,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getPendingSyncItems() {
  const db = await getDB();
  return db.getAllFromIndex('sync_queue', 'synced', 0);
}

export async function markSynced(id: number): Promise<void> {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.synced = 1;
    await db.put('sync_queue', item);
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const item = await db.get('local_settings', key);
  return item?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.put('local_settings', { key, value });
}
