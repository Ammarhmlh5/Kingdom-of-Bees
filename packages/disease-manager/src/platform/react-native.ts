/**
 * React Native Platform Adapter
 * محول منصة React Native
 * 
 * ملاحظة: يتطلب تثبيت المكتبات التالية:
 * - @react-native-async-storage/async-storage
 * - react-native-push-notification
 * - react-native-image-picker
 * - react-native-fs
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
 * محول التخزين لـ React Native (AsyncStorage)
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  private AsyncStorage: any;

  constructor() {
    try {
      // تحميل AsyncStorage ديناميكياً
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.AsyncStorage) {
      throw new Error('AsyncStorage is not available');
    }
    await this.AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.AsyncStorage) {
      throw new Error('AsyncStorage is not available');
    }
    return await this.AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    if (!this.AsyncStorage) {
      throw new Error('AsyncStorage is not available');
    }
    await this.AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (!this.AsyncStorage) {
      throw new Error('AsyncStorage is not available');
    }
    await this.AsyncStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.AsyncStorage) {
      throw new Error('AsyncStorage is not available');
    }
    return await this.AsyncStorage.getAllKeys();
  }
}

/**
 * محول الإشعارات لـ React Native
 */
class ReactNativeNotificationAdapter implements NotificationAdapter {
  private PushNotification: any;

  constructor() {
    try {
      this.PushNotification = require('react-native-push-notification');
      this.configure();
    } catch (error) {
      console.warn('PushNotification not available:', error);
    }
  }

  private configure() {
    if (!this.PushNotification) return;

    this.PushNotification.configure({
      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  async requestPermission(): Promise<boolean> {
    if (!this.PushNotification) {
      return false;
    }
    // في React Native، الأذونات تُطلب تلقائياً عند التكوين
    return true;
  }

  async scheduleNotification(config: NotificationConfig): Promise<string> {
    if (!this.PushNotification) {
      throw new Error('PushNotification is not available');
    }

    const id = `${Date.now()}`;

    this.PushNotification.localNotificationSchedule({
      id,
      title: config.title,
      message: config.body,
      date: config.scheduledTime || new Date(Date.now() + 1000),
      userInfo: config.data,
    });

    return id;
  }

  async cancelNotification(id: string): Promise<void> {
    if (!this.PushNotification) {
      throw new Error('PushNotification is not available');
    }

    this.PushNotification.cancelLocalNotification(id);
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    // React Native لا يوفر طريقة مباشرة للحصول على الإشعارات المجدولة
    return [];
  }
}

/**
 * محول الكاميرا لـ React Native
 */
class ReactNativeCameraAdapter implements CameraAdapter {
  private ImagePicker: any;

  constructor() {
    try {
      this.ImagePicker = require('react-native-image-picker');
    } catch (error) {
      console.warn('ImagePicker not available:', error);
    }
  }

  isAvailable(): boolean {
    return !!this.ImagePicker;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.ImagePicker) {
      return false;
    }
    // الأذونات تُطلب تلقائياً عند استخدام الكاميرا
    return true;
  }

  async captureImage(options?: CameraOptions): Promise<ImageData> {
    if (!this.ImagePicker) {
      throw new Error('ImagePicker is not available');
    }

    return new Promise((resolve, reject) => {
      this.ImagePicker.launchCamera(
        {
          mediaType: 'photo',
          quality: options?.quality || 0.9,
          maxWidth: options?.maxWidth,
          maxHeight: options?.maxHeight,
        },
        (response: any) => {
          if (response.didCancel) {
            reject(new Error('User cancelled image capture'));
          } else if (response.errorCode) {
            reject(new Error(response.errorMessage));
          } else {
            const asset = response.assets[0];
            resolve({
              data: asset.uri,
              format: 'jpeg',
              width: asset.width,
              height: asset.height,
              metadata: {
                captureDate: new Date(),
              },
            });
          }
        }
      );
    });
  }

  async pickImage(options?: PickerOptions): Promise<ImageData> {
    if (!this.ImagePicker) {
      throw new Error('ImagePicker is not available');
    }

    return new Promise((resolve, reject) => {
      this.ImagePicker.launchImageLibrary(
        {
          mediaType: options?.mediaType || 'photo',
          quality: options?.quality || 0.9,
          maxWidth: options?.maxWidth,
          maxHeight: options?.maxHeight,
          selectionLimit: options?.allowMultiple ? 0 : 1,
        },
        (response: any) => {
          if (response.didCancel) {
            reject(new Error('User cancelled image picker'));
          } else if (response.errorCode) {
            reject(new Error(response.errorMessage));
          } else {
            const asset = response.assets[0];
            resolve({
              data: asset.uri,
              format: 'jpeg',
              width: asset.width,
              height: asset.height,
              metadata: {
                captureDate: new Date(),
              },
            });
          }
        }
      );
    });
  }
}

/**
 * محول نظام الملفات لـ React Native
 */
class ReactNativeFileSystemAdapter implements FileSystemAdapter {
  private RNFS: any;

  constructor() {
    try {
      this.RNFS = require('react-native-fs');
    } catch (error) {
      console.warn('RNFS not available:', error);
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    return await this.RNFS.readFile(path, 'utf8');
  }

  async writeFile(path: string, data: Buffer | string): Promise<void> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    await this.RNFS.writeFile(path, data, 'utf8');
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    await this.RNFS.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    return await this.RNFS.exists(path);
  }

  async createDirectory(path: string): Promise<void> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    await this.RNFS.mkdir(path);
  }

  async listDirectory(path: string): Promise<string[]> {
    if (!this.RNFS) {
      throw new Error('RNFS is not available');
    }
    return await this.RNFS.readDir(path);
  }
}

/**
 * محول منصة React Native الرئيسي
 */
export class ReactNativePlatformAdapter implements PlatformAdapter {
  private storageAdapter: StorageAdapter;
  private notificationAdapter: NotificationAdapter;
  private cameraAdapter: CameraAdapter;
  private fileSystemAdapter: FileSystemAdapter;

  constructor() {
    this.storageAdapter = new ReactNativeStorageAdapter();
    this.notificationAdapter = new ReactNativeNotificationAdapter();
    this.cameraAdapter = new ReactNativeCameraAdapter();
    this.fileSystemAdapter = new ReactNativeFileSystemAdapter();
  }

  getPlatformType() {
    return 'react-native' as const;
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
