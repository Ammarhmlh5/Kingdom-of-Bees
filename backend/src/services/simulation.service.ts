import prisma from '../config/prisma';

export interface SimulationRequest {
  scope: 'HIVE' | 'HIVES' | 'APIARY';
  hiveIds?: string[];
  duration: number; // months
  factors: {
    includeWeather: boolean;
    includeBeekeeper: boolean;
    includeSeasons: boolean;
  };
}

export interface MonthlyPrediction {
  month: number;
  hiveId: string;
  predictedState: {
    strength: number;
    broodFrames: number;
    honeyProduction: number;
    diseases: string[];
    queenStatus: string;
  };
  confidence: number;
  recommendations: string[];
}

export class SimulationService {
  /**
   * Run predictive simulation
   */
  async runSimulation(
    apiaryId: string,
    userId: string,
    request: SimulationRequest
  ): Promise<{
    simulationId: string;
    predictions: MonthlyPrediction[];
  }> {
    // 1. Get hives to simulate
    let hiveIds = request.hiveIds || [];
    if (request.scope === 'APIARY') {
      const hives = await prisma.hive.findMany({
        where: { apiaryId, status: 'ACTIVE' },
        select: { id: true }
      });
      hiveIds = hives.map(h => h.id);
    }

    // 2. Get hive data
    const hives = await prisma.hive.findMany({
      where: { id: { in: hiveIds } },
      include: {
        frames: true,
        queen: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5
        },
        feedingRecords: {
          orderBy: { feedingDate: 'desc' },
          take: 10
        }
      }
    });

    // 3. Get beekeeper behavior data
    const beekeeperBehavior = request.factors.includeBeekeeper
      ? await this.analyzeBeekeeperBehavior(apiaryId, userId)
      : null;

    // 4. Run simulation for each hive
    const allPredictions: MonthlyPrediction[] = [];
    const simulationId = `sim_${Date.now()}`;

    for (const hive of hives) {
      const predictions = await this.simulateHive(
        hive,
        request.duration,
        request.factors,
        beekeeperBehavior
      );
      allPredictions.push(...predictions);

      // 5. Store simulation results in OperationAnalysis (predictive analytics)
      await prisma.operationAnalysis.create({
        data: {
          apiaryId: apiaryId,
          hiveId: hive.id,
          analysisType: 'HIVE_SIMULATION',
          predictionPayload: {
            weatherIncluded: request.factors.includeWeather,
            beekeeperIncluded: request.factors.includeBeekeeper,
            seasonsIncluded: request.factors.includeSeasons,
            beekeeperScore: beekeeperBehavior?.score || 0
          },
          factors: predictions as any,
          status: 'SIMULATED',
          operationType: 'SIMULATION' as any,
          predictedDate: new Date()
        } as any
      });
    }

    return {
      simulationId,
      predictions: allPredictions
    };
  }

  /**
   * Simulate single hive over time
   */
  private async simulateHive(
    hive: any,
    duration: number,
    factors: any,
    beekeeperBehavior: any
  ): Promise<MonthlyPrediction[]> {
    const predictions: MonthlyPrediction[] = [];
    const currentMonth = new Date().getMonth() + 1;

    // Initial state
    let currentStrength = hive.strengthScore || 50;
    let currentBroodFrames = hive.frames.filter((f: any) => f.broodPercentage > 50).length;
    let queenAge = hive.queenAge || 12;

    for (let i = 0; i < duration; i++) {
      const month = ((currentMonth + i - 1) % 12) + 1;
      
      // Seasonal factors
      const seasonalImpact = factors.includeSeasons
        ? this.getSeasonalImpact(month)
        : { strength: 0, production: 0 };

      // Queen age impact
      queenAge += 1;
      const queenImpact = this.getQueenAgeImpact(queenAge);

      // Beekeeper impact
      const beekeeperImpact = beekeeperBehavior
        ? beekeeperBehavior.score * 0.2
        : 0;

      // Calculate new state
      currentStrength = Math.max(0, Math.min(100,
        currentStrength + seasonalImpact.strength + queenImpact + beekeeperImpact
      ));

      currentBroodFrames = Math.max(0, Math.min(10,
        Math.round(currentBroodFrames * (1 + seasonalImpact.strength / 100))
      ));

      const honeyProduction = Math.max(0,
        (currentStrength / 10) * seasonalImpact.production
      );

      // Predict diseases
      const diseases = this.predictDiseases(currentStrength, month);

      // Queen status
      const queenStatus = this.getQueenStatus(queenAge, currentStrength);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        currentStrength,
        currentBroodFrames,
        month,
        queenAge
      );

      // Confidence calculation
      const confidence = this.calculateConfidence(i, factors);

      predictions.push({
        month: i + 1,
        hiveId: hive.id,
        predictedState: {
          strength: Math.round(currentStrength),
          broodFrames: currentBroodFrames,
          honeyProduction: Math.round(honeyProduction * 10) / 10,
          diseases,
          queenStatus
        },
        confidence,
        recommendations
      });
    }

    return predictions;
  }

  /**
   * Analyze beekeeper behavior
   */
  private async analyzeBeekeeperBehavior(apiaryId: string, userId: string) {
    const inspections = await prisma.inspection.findMany({
      where: {
        apiaryId,
        inspectedBy: userId,
        inspectionDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      }
    });

    const feedings = await prisma.feedingRecord.findMany({
      where: {
        apiaryId,
        feedingDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Calculate regularity score
    const inspectionRegularity = inspections.length >= 12 ? 10 : (inspections.length / 12) * 10;
    const feedingRegularity = feedings.length >= 6 ? 10 : (feedings.length / 6) * 10;

    const score = (inspectionRegularity + feedingRegularity) / 2;

    return {
      score,
      inspectionCount: inspections.length,
      feedingCount: feedings.length,
      regularity: score >= 8 ? 'ممتاز' : score >= 6 ? 'جيد' : 'يحتاج تحسين'
    };
  }

  /**
   * Get seasonal impact
   */
  private getSeasonalImpact(month: number): { strength: number; production: number } {
    const impacts: Record<number, any> = {
      1: { strength: -2, production: 0.5 },  // Winter
      2: { strength: -1, production: 1 },
      3: { strength: 3, production: 2 },     // Spring
      4: { strength: 5, production: 3 },
      5: { strength: 4, production: 2.5 },
      6: { strength: 2, production: 1.5 },   // Summer
      7: { strength: -1, production: 0.5 },
      8: { strength: -2, production: 0.3 },
      9: { strength: 1, production: 1 },     // Autumn
      10: { strength: 3, production: 4 },    // Sidr season
      11: { strength: 4, production: 5 },
      12: { strength: 0, production: 1 }
    };

    return impacts[month] || { strength: 0, production: 0 };
  }

  /**
   * Get queen age impact
   */
  private getQueenAgeImpact(ageMonths: number): number {
    if (ageMonths < 12) return 2;      // Young queen - positive
    if (ageMonths < 24) return 0;      // Prime age - neutral
    if (ageMonths < 36) return -2;     // Aging - negative
    return -5;                          // Old - very negative
  }

  /**
   * Predict diseases
   */
  private predictDiseases(strength: number, month: number): string[] {
    const diseases: string[] = [];

    // Weak hives are more susceptible
    if (strength < 40) {
      diseases.push('Varroa');
    }

    // Seasonal diseases
    if (month >= 6 && month <= 8 && strength < 60) {
      diseases.push('Nosema');
    }

    return diseases;
  }

  /**
   * Get queen status
   */
  private getQueenStatus(ageMonths: number, strength: number): string {
    if (ageMonths > 36) return 'يجب الاستبدال';
    if (ageMonths > 24) return 'مراقبة الأداء';
    if (strength < 50) return 'ضعيفة - فحص مطلوب';
    return 'جيدة';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    strength: number,
    broodFrames: number,
    month: number,
    queenAge: number
  ): string[] {
    const recommendations: string[] = [];

    if (strength < 50) {
      recommendations.push('تغذية تقوية مطلوبة');
    }

    if (broodFrames < 4) {
      recommendations.push('فحص الملكة وجودة وضع البيض');
    }

    if (queenAge > 24) {
      recommendations.push('التخطيط لاستبدال الملكة');
    }

    if (month >= 9 && month <= 11) {
      recommendations.push('الاستعداد لموسم السدر');
    }

    if (month >= 3 && month <= 5 && strength >= 75) {
      recommendations.push('فرصة جيدة للتقسيم');
    }

    return recommendations;
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(monthsAhead: number, factors: any): number {
    let confidence = 90;

    // Confidence decreases with time
    confidence -= monthsAhead * 5;

    // Increase confidence with more factors
    if (factors.includeWeather) confidence += 5;
    if (factors.includeBeekeeper) confidence += 5;
    if (factors.includeSeasons) confidence += 5;

    return Math.max(30, Math.min(95, confidence));
  }

}

export const simulationService = new SimulationService();
