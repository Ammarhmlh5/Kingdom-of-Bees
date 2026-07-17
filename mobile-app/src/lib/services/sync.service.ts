import apiClient from '../apiClient';
import { getAll, getPendingSyncItems, markSynced, put } from '../db';

const SYNC_TABLES = [
  'apiaries',
  'hives',
  'inspections',
  'disease_records',
  'feeding_records',
  'harvest_records',
];

export class SyncService {
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  static async sync(): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline()) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    try {
      // Push local changes to server
      const pendingItems = await getPendingSyncItems();
      for (const item of pendingItems) {
        try {
          switch (item.action) {
            case 'create':
              await apiClient.post(`/${item.table}`, item.data);
              break;
            case 'update':
              await apiClient.put(`/${item.table}/${item.data.id}`, item.data);
              break;
            case 'delete':
              await apiClient.delete(`/${item.table}/${item.data.id}`);
              break;
          }
          await markSynced(item.id);
          synced++;
        } catch {
          failed++;
        }
      }

      // Pull remote data
      for (const table of SYNC_TABLES) {
        try {
          const { data } = await apiClient.get(`/${table}`);
          const items = data.data || data;
          if (Array.isArray(items)) {
            for (const item of items) {
              await put(table, item);
            }
          }
        } catch {
          // Skip tables that fail to fetch
        }
      }
    } catch {
      // Network error
    }

    return { synced, failed };
  }

  static async queueOffline(table: string, action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    const { addToSyncQueue } = await import('../db');
    await addToSyncQueue(table, action, data);
  }
}
