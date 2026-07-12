import frameRepository from '../repositories/frame.repository';
import { HiveFrame, BroodAge } from '@prisma/client';

interface HiveStrength {
  score: number; // 0-100
  rating: 'VERY_WEAK' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  factors: {
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    broodAge: string;
    totalFrames: number;
  };
}

interface FeedingNeed {
  needed: boolean;
  urgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'SUGAR_SYRUP' | 'PROTEIN' | 'POLLEN_SUBSTITUTE' | 'NONE';
  quantityKg: number;
  reason: string;
  recommendations: string[];
}

interface SwarmRisk {
  risk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'IMMINENT';
  score: number; // 0-100
  factors: {
    congestion: boolean;
    noEggs: boolean;
    oldBrood: boolean;
    highHoney: boolean;
  };
  recommendations: string[];
}

interface HiveAnalysis {
  hiveId: string;
  analyzedAt: Date;
  strength: HiveStrength;
  feedingNeed: FeedingNeed;
  swarmRisk: SwarmRisk;
  alerts: string[];
  recommendations: string[];
}

interface FrameTrend {
  frameId: string;
  position: number;
  trends: {
    honeyTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    broodTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    pollenTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
}

export class AnalysisService {
  /**
   * Calculate hive strength based on frames
   */
  async calculateHiveStrength(hiveId: string): Promise<HiveStrength> {
    const frames = await frameRepository.findByHiveId(hiveId);
    
    if (frames.length === 0) {
      return {
        score: 0,
        rating: 'VERY_WEAK',
        factors: {
          broodFrames: 0,
          honeyFrames: 0,
          pollenFrames: 0,
          broodAge: 'NONE',
          totalFrames: 0,
        },
      };
    }

    // Count frames with significant content (>30%)
    const broodFrames = frames.filter(f => 
      (f.sideABroodPercentage + f.sideBBroodPercentage) / 2 > 30
    ).length;
    
    const honeyFrames = frames.filter(f => 
      (f.sideAHoneyPercentage + f.sideBHoneyPercentage) / 2 > 30
    ).length;
    
    const pollenFrames = frames.filter(f => 
      (f.sideAPollenPercentage + f.sideBPollenPercentage) / 2 > 20
    ).length;

    // Check brood age distribution
    const hasEggs = frames.some(f => 
      f.sideABroodAge === 'EGGS' || f.sideBBroodAge === 'EGGS'
    );
    const hasYoungLarvae = frames.some(f => 
      f.sideABroodAge === 'YOUNG_LARVAE' || f.sideBBroodAge === 'YOUNG_LARVAE'
    );
    const hasCapped = frames.some(f => 
      f.sideABroodAge === 'CAPPED' || f.sideBBroodAge === 'CAPPED'
    );

    // Calculate score (0-100)
    let score = 0;
    
    // Brood frames (40 points max)
    score += Math.min((broodFrames / frames.length) * 100 * 0.4, 40);
    
    // Honey frames (20 points max)
    score += Math.min((honeyFrames / frames.length) * 100 * 0.2, 20);
    
    // Pollen frames (15 points max)
    score += Math.min((pollenFrames / frames.length) * 100 * 0.15, 15);
    
    // Brood age diversity (25 points max)
    if (hasEggs) score += 10;
    if (hasYoungLarvae) score += 8;
    if (hasCapped) score += 7;

    // Determine rating
    let rating: HiveStrength['rating'];
    if (score >= 80) rating = 'VERY_STRONG';
    else if (score >= 60) rating = 'STRONG';
    else if (score >= 40) rating = 'MEDIUM';
    else if (score >= 20) rating = 'WEAK';
    else rating = 'VERY_WEAK';

    return {
      score: Math.round(score),
      rating,
      factors: {
        broodFrames,
        honeyFrames,
        pollenFrames,
        broodAge: hasEggs && hasYoungLarvae && hasCapped ? 'DIVERSE' : 
                  hasEggs ? 'EGGS_ONLY' : 
                  hasCapped ? 'CAPPED_ONLY' : 'NONE',
        totalFrames: frames.length,
      },
    };
  }

  /**
   * Calculate feeding need based on honey reserves
   */
  async calculateFeedingNeed(hiveId: string): Promise<FeedingNeed> {
    const frames = await frameRepository.findByHiveId(hiveId);
    
    if (frames.length === 0) {
      return {
        needed: true,
        urgency: 'CRITICAL',
        type: 'SUGAR_SYRUP',
        quantityKg: 5,
        reason: 'No frames found in hive',
        recommendations: ['Add frames immediately', 'Provide emergency feeding'],
      };
    }

    // Calculate average honey percentage
    const avgHoney = frames.reduce((sum, f) => 
      sum + (f.sideAHoneyPercentage + f.sideBHoneyPercentage) / 2, 0
    ) / frames.length;

    // Calculate average pollen percentage
    const avgPollen = frames.reduce((sum, f) => 
      sum + (f.sideAPollenPercentage + f.sideBPollenPercentage) / 2, 0
    ) / frames.length;

    // Determine feeding need
    let needed = false;
    let urgency: FeedingNeed['urgency'] = 'NONE';
    let type: FeedingNeed['type'] = 'NONE';
    let quantityKg = 0;
    let reason = '';
    const recommendations: string[] = [];

    // Check honey levels
    if (avgHoney < 10) {
      needed = true;
      urgency = 'CRITICAL';
      type = 'SUGAR_SYRUP';
      quantityKg = 5;
      reason = 'Critical honey shortage - immediate feeding required';
      recommendations.push('Feed 2:1 sugar syrup immediately');
      recommendations.push('Check daily until honey levels improve');
    } else if (avgHoney < 20) {
      needed = true;
      urgency = 'HIGH';
      type = 'SUGAR_SYRUP';
      quantityKg = 3;
      reason = 'Low honey reserves - feeding recommended';
      recommendations.push('Feed 1:1 sugar syrup');
      recommendations.push('Monitor honey levels weekly');
    } else if (avgHoney < 30) {
      needed = true;
      urgency = 'MEDIUM';
      type = 'SUGAR_SYRUP';
      quantityKg = 2;
      reason = 'Moderate honey reserves - supplemental feeding advised';
      recommendations.push('Consider light feeding');
      recommendations.push('Monitor weather conditions');
    }

    // Check pollen levels
    if (avgPollen < 5 && urgency !== 'CRITICAL') {
      needed = true;
      if (urgency === 'NONE') urgency = 'MEDIUM';
      type = 'POLLEN_SUBSTITUTE';
      quantityKg = 1;
      reason = reason ? `${reason}; Low pollen reserves` : 'Low pollen reserves';
      recommendations.push('Provide pollen substitute or patties');
    }

    return {
      needed,
      urgency,
      type,
      quantityKg,
      reason: reason || 'Hive has adequate reserves',
      recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring'],
    };
  }

  /**
   * Detect swarm risk based on frame conditions
   */
  async detectSwarmRisk(hiveId: string): Promise<SwarmRisk> {
    const frames = await frameRepository.findByHiveId(hiveId);
    
    if (frames.length === 0) {
      return {
        risk: 'NONE',
        score: 0,
        factors: {
          congestion: false,
          noEggs: false,
          oldBrood: false,
          highHoney: false,
        },
        recommendations: [],
      };
    }

    // Check for congestion (high brood percentage)
    const avgBrood = frames.reduce((sum, f) => 
      sum + (f.sideABroodPercentage + f.sideBBroodPercentage) / 2, 0
    ) / frames.length;
    const congestion = avgBrood > 70;

    // Check for lack of eggs
    const hasEggs = frames.some(f => 
      f.sideABroodAge === 'EGGS' || f.sideBBroodAge === 'EGGS'
    );
    const noEggs = !hasEggs;

    // Check for old brood only (capped)
    const hasCappedOnly = frames.every(f => {
      const sideAOld = f.sideABroodAge === 'CAPPED' || f.sideABroodAge === 'OLD_LARVAE';
      const sideBOld = f.sideBBroodAge === 'CAPPED' || f.sideBBroodAge === 'OLD_LARVAE';
      return (f.sideABroodPercentage > 0 ? sideAOld : true) && 
             (f.sideBBroodPercentage > 0 ? sideBOld : true);
    });
    const oldBrood = hasCappedOnly && avgBrood > 30;

    // Check for high honey (>60%)
    const avgHoney = frames.reduce((sum, f) => 
      sum + (f.sideAHoneyPercentage + f.sideBHoneyPercentage) / 2, 0
    ) / frames.length;
    const highHoney = avgHoney > 60;

    // Calculate risk score
    let score = 0;
    if (congestion) score += 30;
    if (noEggs) score += 25;
    if (oldBrood) score += 25;
    if (highHoney) score += 20;

    // Determine risk level
    let risk: SwarmRisk['risk'];
    if (score >= 80) risk = 'IMMINENT';
    else if (score >= 60) risk = 'HIGH';
    else if (score >= 40) risk = 'MODERATE';
    else if (score >= 20) risk = 'LOW';
    else risk = 'NONE';

    // Generate recommendations
    const recommendations: string[] = [];
    if (congestion) {
      recommendations.push('Add supers to provide more space');
      recommendations.push('Consider splitting the hive');
    }
    if (noEggs) {
      recommendations.push('Check for queen presence');
      recommendations.push('Inspect for queen cells');
    }
    if (oldBrood) {
      recommendations.push('Monitor for swarm cells');
      recommendations.push('Ensure adequate space for queen laying');
    }
    if (highHoney) {
      recommendations.push('Consider harvesting honey');
      recommendations.push('Add empty frames for brood expansion');
    }

    return {
      risk,
      score,
      factors: {
        congestion,
        noEggs,
        oldBrood,
        highHoney,
      },
      recommendations,
    };
  }

  /**
   * Perform comprehensive hive analysis
   */
  async analyzeHive(hiveId: string): Promise<HiveAnalysis> {
    const [strength, feedingNeed, swarmRisk] = await Promise.all([
      this.calculateHiveStrength(hiveId),
      this.calculateFeedingNeed(hiveId),
      this.detectSwarmRisk(hiveId),
    ]);

    // Generate alerts
    const alerts: string[] = [];
    if (feedingNeed.urgency === 'CRITICAL') {
      alerts.push('CRITICAL: Immediate feeding required');
    }
    if (swarmRisk.risk === 'IMMINENT' || swarmRisk.risk === 'HIGH') {
      alerts.push(`${swarmRisk.risk} swarm risk detected`);
    }
    if (strength.rating === 'VERY_WEAK' || strength.rating === 'WEAK') {
      alerts.push(`Hive strength is ${strength.rating.toLowerCase()}`);
    }

    // Combine recommendations
    const recommendations = [
      ...feedingNeed.recommendations,
      ...swarmRisk.recommendations,
    ];

    return {
      hiveId,
      analyzedAt: new Date(),
      strength,
      feedingNeed,
      swarmRisk,
      alerts,
      recommendations,
    };
  }

  /**
   * Calculate trends for frames (comparing with historical snapshots)
   */
  async calculateTrends(hiveId: string): Promise<FrameTrend[]> {
    const frames = await frameRepository.findByHiveId(hiveId);
    
    const trends: FrameTrend[] = [];

    for (const frame of frames) {
      const snapshots = await frameRepository.getSnapshots(frame.id, 2);
      
      if (snapshots.length < 2) {
        // Not enough data for trend analysis
        trends.push({
          frameId: frame.id,
          position: frame.position,
          trends: {
            honeyTrend: 'STABLE',
            broodTrend: 'STABLE',
            pollenTrend: 'STABLE',
          },
        });
        continue;
      }

      const latest = snapshots[0];
      const previous = snapshots[1];

      // Calculate average percentages for each side
      const latestHoney = (latest.sideAHoneyPercentage + latest.sideBHoneyPercentage) / 2;
      const previousHoney = (previous.sideAHoneyPercentage + previous.sideBHoneyPercentage) / 2;
      
      const latestBrood = (latest.sideABroodPercentage + latest.sideBBroodPercentage) / 2;
      const previousBrood = (previous.sideABroodPercentage + previous.sideBBroodPercentage) / 2;
      
      const latestPollen = (latest.sideAPollenPercentage + latest.sideBPollenPercentage) / 2;
      const previousPollen = (previous.sideAPollenPercentage + previous.sideBPollenPercentage) / 2;

      // Determine trends (threshold: 10% change)
      const honeyTrend = latestHoney > previousHoney + 10 ? 'INCREASING' :
                        latestHoney < previousHoney - 10 ? 'DECREASING' : 'STABLE';
      
      const broodTrend = latestBrood > previousBrood + 10 ? 'INCREASING' :
                        latestBrood < previousBrood - 10 ? 'DECREASING' : 'STABLE';
      
      const pollenTrend = latestPollen > previousPollen + 10 ? 'INCREASING' :
                         latestPollen < previousPollen - 10 ? 'DECREASING' : 'STABLE';

      trends.push({
        frameId: frame.id,
        position: frame.position,
        trends: {
          honeyTrend,
          broodTrend,
          pollenTrend,
        },
      });
    }

    return trends;
  }
}

export default new AnalysisService();
