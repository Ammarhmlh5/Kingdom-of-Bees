import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { beeCounter, BeeCounterService, BeeCountResult } from '../lib/services/bee-counter.service';
import { tfliteDetector, TFLiteDetection } from '../lib/services/tflite-bee.service';

interface BeeCounterProps {
  onCountComplete?: (result: BeeCountResult) => void;
  onError?: (error: Error) => void;
  useOfflineMode?: boolean;
  apiKey?: string;
}

export function BeeCounter({
  onCountComplete,
  onError,
  useOfflineMode = false,
  apiKey,
}: BeeCounterProps) {
  const [isCounting, setIsCounting] = useState(false);
  const [result, setResult] = useState<BeeCountResult | null>(null);
  const [offlineDetections, setOfflineDetections] = useState<TFLiteDetection[]>([]);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const handleCount = useCallback(async () => {
    if (!cameraRef.current) {
      Alert.alert('خطأ', 'الكاميرا غير جاهزة');
      return;
    }

    setIsCounting(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
      });

      if (useOfflineMode) {
        const response = await fetch(`file://${photo.path}`);
        const arrayBuffer = await response.arrayBuffer();
        const detections = await tfliteDetector.detect(arrayBuffer);

        const beeCountResult: BeeCountResult = {
          count: detections.filter((d) => d.className === 'bee').length,
          detections: detections
            .filter((d) => d.className === 'bee')
            .map((d) => ({
              x: d.x,
              y: d.y,
              width: d.width,
              height: d.height,
              confidence: d.confidence,
              class: d.className,
            })),
          confidence:
            detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length || 0,
          timestamp: new Date().toISOString(),
        };

        setOfflineDetections(detections.filter((d) => d.className === 'bee'));
        setResult(beeCountResult);
        onCountComplete?.(beeCountResult);
      } else {
        if (!apiKey) {
          Alert.alert('خطأ', 'مفتاح API مطلوب للعد عبر الإنترنت');
          return;
        }

        const counter = BeeCounterService.create({ apiKey });
        const photoResponse = await fetch(`file://${photo.path}`);
        const blob = await photoResponse.blob();
        const base64 = await blobToBase64(blob);

        const countResult = await counter.countBeesFromImage(base64);
        setResult(countResult);
        onCountComplete?.(countResult);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('فشل العد');
      onError?.(err);
      Alert.alert('خطأ', err.message);
    } finally {
      setIsCounting(false);
    }
  }, [useOfflineMode, apiKey, onCountComplete, onError]);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>الكاميرا غير متاحة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.overlay}>
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>عدد النحل: {result.count}</Text>
            <Text style={styles.confidenceText}>
              الثقة: {(result.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.countButton, isCounting && styles.countButtonDisabled]}
          onPress={handleCount}
          disabled={isCounting}
        >
          {isCounting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.countButtonText}>
              {useOfflineMode ? 'عد أوفلاين' : 'عد النحل'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  resultContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  countButton: {
    backgroundColor: '#E6A23C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  countButtonDisabled: {
    backgroundColor: '#999',
  },
  countButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
