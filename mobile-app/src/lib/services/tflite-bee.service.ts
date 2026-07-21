export interface TFLiteDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
  className: string;
}

export class TFLiteBeeDetector {
  async loadModel(): Promise<void> {
    throw new Error('TFLite غير متوفر في تطبيق الويب. استخدم عد النحل عبر Roboflow API.');
  }

  async detect(_imageData: ArrayBuffer): Promise<TFLiteDetection[]> {
    throw new Error('TFLite غير متوفر في تطبيق الويب. استخدم عد النحل عبر Roboflow API.');
  }

  async countBees(imageData: ArrayBuffer): Promise<number> {
    const detections = await this.detect(imageData);
    return detections.length;
  }

  unloadModel(): void {
    // no-op on web
  }
}

export const tfliteDetector = new TFLiteBeeDetector();
