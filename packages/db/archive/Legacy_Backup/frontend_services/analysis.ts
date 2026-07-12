import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface HiveStrength {
  score: number;
  rating: 'VERY_WEAK' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  factors: {
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    broodAge: string;
    totalFrames: number;
  };
}

export interface FeedingNeed {
  needed: boolean;
  urgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'SUGAR_SYRUP' | 'PROTEIN' | 'POLLEN_SUBSTITUTE' | 'NONE';
  quantityKg: number;
  reason: string;
  recommendations: string[];
}

export interface SwarmRisk {
  risk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'IMMINENT';
  score: number;
  factors: {
    congestion: boolean;
    noEggs: boolean;
    oldBrood: boolean;
    highHoney: boolean;
  };
  recommendations: string[];
}

export interface HiveAnalysis {
  hiveId: string;
  analyzedAt: string;
  strength: HiveStrength;
  feedingNeed: FeedingNeed;
  swarmRisk: SwarmRisk;
  alerts: string[];
  recommendations: string[];
}

export interface FrameTrend {
  frameId: string;
  position: number;
  trends: {
    honeyTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    broodTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    pollenTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  };
}

export interface AnalysisHiveStats {
  strength: HiveStrength;
  feedingNeed: FeedingNeed;
  swarmRisk: SwarmRisk;
  trends: FrameTrend[];
  analyzedAt: string;
}

// Analysis Service
export const analysisService = {
  /**
   * Get comprehensive hive analysis
   */
  async analyzeHive(hiveId: string): Promise<HiveAnalysis> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/analysis`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error analyzing hive:', error);
      throw new Error(error.response?.data?.error || 'Failed to analyze hive');
    }
  },

  /**
   * Get hive strength calculation
   */
  async getHiveStrength(hiveId: string): Promise<HiveStrength> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/strength`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting hive strength:', error);
      throw new Error(error.response?.data?.error || 'Failed to get hive strength');
    }
  },

  /**
   * Get feeding need assessment
   */
  async getFeedingNeed(hiveId: string): Promise<FeedingNeed> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/feeding-need`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting feeding need:', error);
      throw new Error(error.response?.data?.error || 'Failed to get feeding need');
    }
  },

  /**
   * Get swarm risk assessment
   */
  async getSwarmRisk(hiveId: string): Promise<SwarmRisk> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/swarm-risk`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting swarm risk:', error);
      throw new Error(error.response?.data?.error || 'Failed to get swarm risk');
    }
  },

  /**
   * Get frame trends
   */
  async getTrends(hiveId: string): Promise<FrameTrend[]> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/trends`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting trends:', error);
      throw new Error(error.response?.data?.error || 'Failed to get trends');
    }
  },

  /**
   * Get recommendations for hive management
   */
  async getRecommendations(hiveId: string): Promise<{
    recommendations: string[];
    alerts: string[];
    feedingNeed: FeedingNeed;
    swarmRisk: SwarmRisk;
  }> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/recommendations`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      throw new Error(error.response?.data?.error || 'Failed to get recommendations');
    }
  },

  /**
   * Get hive statistics
   */
  async getStats(hiveId: string): Promise<AnalysisHiveStats> {
    try {
      const response = await axios.get(`${API_URL}/analysis/hives/${hiveId}/stats`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to get stats');
    }
  },
};

export default analysisService;
