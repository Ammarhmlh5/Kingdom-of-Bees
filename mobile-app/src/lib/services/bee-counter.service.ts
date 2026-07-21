export interface BeeDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
}

export interface BeeCountResult {
  count: number;
  detections: BeeDetection[];
  confidence: number;
  timestamp: string;
}

const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_ROBOFLOW_API_KEY || '',
  modelId: 'bees-tbdsg/bee-counting',
  apiUrl: 'https://serverless.roboflow.com',
};

export class BeeCounterService {
  private config: { apiKey: string; modelId: string; apiUrl: string };

  constructor(config: { apiKey?: string; modelId?: string; apiUrl?: string } = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async countBeesFromImage(imageBase64: string): Promise<BeeCountResult> {
    if (!this.config.apiKey) {
      throw new Error('يجب إعداد مفتاح Roboflow API. أضف VITE_ROBOFLOW_API_KEY في ملف .env');
    }

    const response = await fetch(
      `${this.config.apiUrl}/${this.config.modelId}?api_key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const detections: BeeDetection[] = data.predictions || [];

    return {
      count: detections.length,
      detections,
      confidence: this.calculateAverageConfidence(detections),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateAverageConfidence(detections: BeeDetection[]): number {
    if (detections.length === 0) return 0;
    const total = detections.reduce((sum, d) => sum + d.confidence, 0);
    return total / detections.length;
  }
}

export const beeCounter = new BeeCounterService();
