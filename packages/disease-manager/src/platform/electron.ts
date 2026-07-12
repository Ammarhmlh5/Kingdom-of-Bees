/**
 * Electron Platform Adapter
 * محول منصة Electron
 * 
 * ملاحظة: يتطلب تثبيت المكتبات التالية:
 * - electron-store
 */

import type {
  PlatformAdapter,
  StorageAdapter,
  NotificationAdapter,
  CameraAdapter,
  FileSystemAdapter,
  NotificationConfig,
  ScheduledNotification,
  CameraOptions,
  PickerOptions,
  ImageData,
} from './types';

/**
 * محول التخزين لـ Electron (electron-store)
 */
class ElectronStorageAdapter implements StorageAdapter {
  private store: any;

  constructor() {
    try {
      const Store = require('electron-store');
      this.store = new Store();
    } catch (error) {
      console.warn('electron-store not available:', error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.store) {
      throw new Error('electron-store is not available');
    }
    this.store.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.store) {
      throw new Error('electron-store is not available');
    }
    return this.store.get(key, null);
  }

  async removeItem(key: string): Promise<void> {
    if (!this.store) {
      throw new Error('electron-store is not available');
    }
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    if (!this.store) {
      throw new Error('electron-store is not available');
    }
    this.store.clear();
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.store) {
      throw new Error('electron-store is not available');
    }
    return Object.keys(this.store.store);
  }
}

/**
 * محول الإشعارات لـ Electron
 */
class ElectronNotificationAdapter implements NotificationAdapter {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  async requestPermission(): Promise<boolean> {
    // Electron يدعم الإشعارات بشكل افتراضي
    return true;
  }

  async scheduleNotification(config: NotificationConfig): Promise<string> {
    const id = `notif-${Date.now()}-${Math.random()}`;

    if (config.scheduledTime) {
      const delay = config.scheduledTime.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          this.showNotification(config);
          this.scheduledNotifications.delete(id);
        }, delay);

        this.scheduledNotifications.set(id, {
          id,
          config,
          scheduledTime: config.scheduledTime,
        });
      }
    } else {
      await this.showNotification(config);
    }

    return id;
  }

  private async showNotification(config: NotificationConfig): Promise<void> {
    try {
      const { Notification } = require('electron');
      const notification = new Notification({
        title: config.title,
        body: config.body,
      });
      notification.show();
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications.delete(id);
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values());
  }
}

/**
 * محول الكاميرا لـ Electron (يستخدم MediaDevices API)
 */
class ElectronCameraAdapter implements CameraAdapter {
  isAvailable(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async captureImage(options?: CameraOptions): Promise<ImageData> {
    if (!this.isAvailable()) {
      throw new Error('Camera is not available');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = options?.maxWidth || video.videoWidth;
      canvas.height = options?.maxHeight || video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          options?.quality || 0.9
        );
      });

      return {
        data: blob,
        format: 'jpeg',
        width: canvas.width,
        height: canvas.height,
        metadata: {
          captureDate: new Date(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to capture image: ${error}`);
    }
  }

  async pickImage(options?: PickerOptions): Promise<ImageData> {
    try {
      const { dialog } = require('electron').remote;
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        throw new Error('No file selected');
      }

      const fs = require('fs');
      const path = result.filePaths[0];
      const buffer = fs.readFileSync(path);

      // تحميل الصورة للحصول على الأبعاد
      const img = new Image();
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({
            data: buffer,
            format: 'jpeg',
            width: img.width,
            height: img.height,
            metadata: {
              captureDate: new Date(),
            },
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        img.src = url;
      });
    } catch (error) {
      throw new Error(`Failed to pick image: ${error}`);
    }
  }
}

/**
 * محول نظام الملفات لـ Electron (Node.js fs)
 */
class ElectronFileSystemAdapter implements FileSystemAdapter {
  private fs: any;
  private path: any;

  constructor() {
    try {
      this.fs = require('fs').promises;
      this.path = require('path');
    } catch (error) {
      console.warn('fs module not available:', error);
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    return await this.fs.readFile(path, 'utf8');
  }

  async writeFile(path: string, data: Buffer | string): Promise<void> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    await this.fs.writeFile(path, data);
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    await this.fs.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    try {
      await this.fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async createDirectory(path: string): Promise<void> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    await this.fs.mkdir(path, { recursive: true });
  }

  async listDirectory(path: string): Promise<string[]> {
    if (!this.fs) {
      throw new Error('fs module is not available');
    }
    return await this.fs.readdir(path);
  }
}

/**
 * محول منصة Electron الرئيسي
 */
export class ElectronPlatformAdapter implements PlatformAdapter {
  private storageAdapter: StorageAdapter;
  private notificationAdapter: NotificationAdapter;
  private cameraAdapter: CameraAdapter;
  private fileSystemAdapter: FileSystemAdapter;

  constructor() {
    this.storageAdapter = new ElectronStorageAdapter();
    this.notificationAdapter = new ElectronNotificationAdapter();
    this.cameraAdapter = new ElectronCameraAdapter();
    this.fileSystemAdapter = new ElectronFileSystemAdapter();
  }

  getPlatformType() {
    return 'electron' as const;
  }

  getStorageAdapter(): StorageAdapter {
    return this.storageAdapter;
  }

  getNotificationAdapter(): NotificationAdapter {
    return this.notificationAdapter;
  }

  getCameraAdapter(): CameraAdapter {
    return this.cameraAdapter;
  }

  getFileSystemAdapter(): FileSystemAdapter {
    return this.fileSystemAdapter;
  }
}
