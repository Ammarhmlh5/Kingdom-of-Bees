import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { BeeCounter } from '../components/BeeCounter';
import { BeeCountResult } from '../lib/services/bee-counter.service';
import { useNavigate } from 'react-router-dom';

export function BeeCounterPage() {
  const [result, setResult] = useState<BeeCountResult | null>(null);
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const navigate = useNavigate();

  const handleCountComplete = (countResult: BeeCountResult) => {
    setResult(countResult);
  };

  const handleError = (error: Error) => {
    Alert.alert('خطأ', error.message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>عد النحل</Text>
      </View>

      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, !useOfflineMode && styles.modeButtonActive]}
          onPress={() => setUseOfflineMode(false)}
        >
          <Text style={[styles.modeButtonText, !useOfflineMode && styles.modeButtonTextActive]}>
            عبر الإنترنت
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, useOfflineMode && styles.modeButtonActive]}
          onPress={() => setUseOfflineMode(true)}
        >
          <Text style={[styles.modeButtonText, useOfflineMode && styles.modeButtonTextActive]}>
            أوفلاين
          </Text>
        </TouchableOpacity>
      </View>

      <BeeCounter
        onCountComplete={handleCountComplete}
        onError={handleError}
        useOfflineMode={useOfflineMode}
      />

      {result && (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>عدد النحل المكتشف</Text>
            <Text style={styles.resultValue}>{result.count}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>متوسط الثقة</Text>
            <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(1)}%</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>الوقت</Text>
            <Text style={styles.resultValue}>
              {new Date(result.timestamp).toLocaleTimeString('ar-SA')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Alert.alert('نجاح', 'تم حفظ النتائج');
            }}
          >
            <Text style={styles.saveButtonText}>حفظ النتائج</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#E6A23C',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#E6A23C',
  },
  modeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
