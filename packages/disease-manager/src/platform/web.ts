/**
 * Web Platform Adapter
 * محول منصة الويب
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
 * محول التخزين للويب (localStorage)
 */
class WebStorageAdapter implements StorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new Error(`Failed to set item: ${error}`);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      throw new Error(`Failed to get item: ${error}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove item: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      throw new Error(`Failed to get all keys: ${error}`);
    }
  }
}

/**
 * محول الإشعارات للويب (Web Notifications API)
 */
class WebNotificationAdapter implements NotificationAdapter {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleNotification(config: NotificationConfig): Promise<string> {
    const id = `notif-${Date.now()}-${Math.random()}`;

    if (config.scheduledTime) {
      // جدولة الإشعار
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
      // عرض الإشعار فوراً
      await this.showNotification(config);
    }

    return id;
  }

  private async showNotification(config: NotificationConfig): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(config.title, {
        body: config.body,
        data: config.data,
        tag: config.data?.tag,
      });
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
 * محول الكاميرا للويب (MediaDevices API)
 */
class WebCameraAdapter implements CameraAdapter {
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
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = options?.allowMultiple || false;

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          reject(new Error('No file selected'));
          return;
        }

        const file = files[0];
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (options?.maxWidth && width > options.maxWidth) {
              height = (height * options.maxWidth) / width;
              width = options.maxWidth;
            }

            if (options?.maxHeight && height > options.maxHeight) {
              width = (width * options.maxHeight) / height;
              height = options.maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({
                    data: blob,
                    format: 'jpeg',
                    width,
                    height,
                    metadata: {
                      captureDate: new Date(file.lastModified),
                    },
                  });
                } else {
                  reject(new Error('Failed to create blob'));
                }
              },
              'image/jpeg',
              options?.quality || 0.9
            );
          };

          img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      };

      input.click();
    });
  }
}

/**
 * محول نظام الملفات للويب (File API)
 */
class WebFileSystemAdapter implements FileSystemAdapter {
  async readFile(path: string): Promise<string> {
    throw new Error('File system operations are not supported in web browsers');
  }

  async writeFile(path: string, data: Buffer | string): Promise<void> {
    throw new Error('File system operations are not supported in web browsers');
  }

  async deleteFile(path: string): Promise<void> {
    throw new Error('File system operations are not supported in web browsers');
  }

  async exists(path: string): Promise<boolean> {
    throw new Error('File system operations are not supported in web browsers');
  }

  async createDirectory(path: string): Promise<void> {
    throw new Error('File system operations are not supported in web browsers');
  }

  async listDirectory(path: string): Promise<string[]> {
    throw new Error('File system operations are not supported in web browsers');
  }
}

/**
 * محول منصة الويب الرئيسي
 */
export class WebPlatformAdapter implements PlatformAdapter {
  private storageAdapter: StorageAdapter;
  private notificationAdapter: NotificationAdapter;
  private cameraAdapter: CameraAdapter;
  private fileSystemAdapter: FileSystemAdapter;

  constructor() {
    this.storageAdapter = new WebStorageAdapter();
    this.notificationAdapter = new WebNotificationAdapter();
    this.cameraAdapter = new WebCameraAdapter();
    this.fileSystemAdapter = new WebFileSystemAdapter();
  }

  getPlatformType() {
    return 'web' as const;
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
