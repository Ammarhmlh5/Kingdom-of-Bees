import { NativeModules } from 'react-native';

export interface TFLiteDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
  className: string;
}

export interface TFLiteConfig {
  modelPath: string;
  labelsPath?: string;
  numThreads?: number;
  useNnapi?: boolean;
}

const DEFAULT_CONFIG: TFLiteConfig = {
  modelPath: 'bee_counter.tflite',
  labelsPath: 'bee_labels.txt',
  numThreads: 4,
  useNnapi: true,
};

export class TFLiteBeeDetector {
  private config: TFLiteConfig;
  private isLoaded = false;

  constructor(config: Partial<TFLiteConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async loadModel(): Promise<void> {
    try {
      const { FastTFLite } = NativeModules;
      if (!FastTFLite) {
        throw new Error('FastTFLite native module not available');
      }

      await FastTFLite.loadModel(this.config.modelPath, {
        numThreads: this.config.numThreads,
        useNnapi: this.config.useNnapi,
      });

      this.isLoaded = true;
      console.log('TFLite model loaded successfully');
    } catch (error) {
      console.error('Failed to load TFLite model:', error);
      throw error;
    }
  }

  async detect(imageData: ArrayBuffer): Promise<TFLiteDetection[]> {
    if (!this.isLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      const { FastTFLite } = NativeModules;
      const results = await FastTFLite.detect(imageData, {
        inputSize: 640,
        confidenceThreshold: 0.5,
        nmsThreshold: 0.4,
      });

      return results.detections.map((d: any) => ({
        x: d.x,
        y: d.y,
        width: d.width,
        height: d.height,
        confidence: d.confidence,
        classId: d.classId,
        className: d.classId === 0 ? 'bee' : 'unknown',
      }));
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  }

  async countBees(imageData: ArrayBuffer): Promise<number> {
    const detections = await this.detect(imageData);
    return detections.length;
  }

  unloadModel(): void {
    this.isLoaded = false;
  }
}

export const tfliteDetector = new TFLiteBeeDetector();
