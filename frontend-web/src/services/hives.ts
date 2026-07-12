import api from './api';

export interface Hive {
    id: string;
    hiveNumber: string;
    name: string;
    apiaryId: string;
    hiveType?: {
        nameEn: string;
        nameAr: string;
        id: string;
    };
    type?: 'LANGSTROTH' | 'TOP_BAR' | 'WARRE' | 'OTHER';
    status?: 'ACTIVE' | 'INACTIVE' | 'QUEENLESS' | 'DEAD';
    condition?: 'EXCELLENT' | 'GOOD' | 'WEAK' | 'CRITICAL';
    strength?: 'STRONG' | 'MEDIUM' | 'WEAK';
    queenStatus?: 'PRESENT' | 'ABSENT' | 'UNKNOWN';
    frameCount?: number;
    lastInspection?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    frames?: any[];
    framesPerBox?: number;
    lastInspectionDate?: string;
    inspections?: any[];
    strengthRating?: string;
    strengthScore?: number;
    queen?: any;
    queenId?: string;
    installationDate?: string;
}

export interface CreateHiveData {
    hiveNumber: string;
    hiveType: string;
    status: string;
    name?: string;
    queenAge?: number;
    queenColor?: string;
    notes?: string;
    framesPerBox?: number;
}

// Get hives for an apiary
export const getHives = async (apiaryId?: string): Promise<Hive[]> => {
    if (!apiaryId) return [];
    const response = await api.get(`/apiaries/${apiaryId}/hives`);
    return response.data.data || response.data;
};

// Get single hive
// Get single hive (requires apiaryId context)
export const getHive = async (apiaryId: string, id: string): Promise<Hive> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/${id}`);
    return response.data;
};

// Create hive
export const createHive = async (apiaryId: string, data: CreateHiveData): Promise<Hive> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives`, data);
    return response.data;
};

// Update hive
export const updateHive = async (apiaryId: string, id: string, data: Partial<CreateHiveData>): Promise<Hive> => {
    const response = await api.put(`/apiaries/${apiaryId}/hives/${id}`, data);
    return response.data;
};

// Delete hive
export const deleteHive = async (apiaryId: string, id: string): Promise<void> => {
    await api.delete(`/apiaries/${apiaryId}/hives/${id}`);
};

// Service object export


// --- Hive Operations Interfaces ---

export interface QueenSetupData {
    source: string;
    breed: string;
    year: string;
    isMarked: boolean;
    markColor?: string;
}

export interface FrameSetupData {
    total: number;
    brood: number;
    honey: number;
    pollen: number;
}

export interface HiveSetupData {
    hiveNumber: string;
    type: string;
    queen: QueenSetupData;
    strength: string;
    frames: FrameSetupData;
}

export interface SplitHiveData {
    strategy: 'EVEN' | 'NUC';
    newHiveNumber: string;
    queenType: string;
}

export interface AddSuperData {
    type: string;
    frames: string;
    hasExcluder: boolean;
}

export interface MergeHivesData {
    targetHiveId: string;
}

// --- Hive Operations Functions ---

export const setupHiveAnalysis = async (id: string, data: HiveSetupData, apiaryId?: string): Promise<any> => {
    // Fallback: if apiaryId is not passed, assumes backend might handle it or we expect it on data? 
    // Ideally we MUST have apiaryId for the URL.
    if (!apiaryId) throw new Error("Apiary ID is required for setupHiveAnalysis");
    const response = await api.post(`/apiaries/${apiaryId}/hives/${id}/setup`, data);
    return response.data;
};

export const splitHive = async (hiveId: string, data: SplitHiveData, apiaryId?: string): Promise<any> => {
    if (!apiaryId) throw new Error("Apiary ID is required for splitHive");
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/split`, data);
    return response.data;
};

export const addSuperToHive = async (hiveId: string, data: AddSuperData, apiaryId?: string): Promise<any> => {
    if (!apiaryId) throw new Error("Apiary ID is required for addSuperToHive");
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/super`, data);
    return response.data;
};

export const mergeHives = async (weakHiveId: string, data: MergeHivesData, apiaryId?: string): Promise<any> => {
    if (!apiaryId) throw new Error("Apiary ID is required for mergeHives");
    const response = await api.post(`/apiaries/${apiaryId}/hives/${weakHiveId}/merge`, data);
    return response.data;
};

export function isHiveConfigured(hive: any): boolean {
    return !!(hive.queenId || hive.strengthRating || hive.installationDate);
}

export const hiveService = {
    getHives,
    getHive,
    createHive,
    updateHive,
    deleteHive,
    setupHiveAnalysis,
    splitHive,
    addSuperToHive,
    mergeHives
};

// ==========================================
// NEW HIVES TAB APIs - Phase 3
// ==========================================

// Inspection APIs
export interface InspectionQueueItem {
    id: string;
    hiveNumber: string;
    priority: number;
    reason: string;
    daysOverdue: number;
    lastInspection: Date | null;
    aiRecommendation: string | null;
}

export interface FrameDetailData {
    frameId: string;
    position: number;
    broodPercentage?: number;
    broodType?: string;
    broodAge?: string;
    honeyPercentage?: number;
    honeyCappedPercentage?: number;
    pollenPercentage?: number;
    condition?: string;
    notes?: string;
}

export interface InspectionData {
    inspectionDate: Date;
    overallAssessment?: string;
    queenSeen: boolean;
    queenQuality?: string;
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    foundationAdded?: number;
    framesTransferred?: Array<{
        from: string;
        to: string;
        count: number;
    }>;
    diseases?: string[];
    foodStock?: {
        honey: number;
        pollen: number;
    };
    notes?: string;
    frameDetails?: FrameDetailData[];
    aiConsultation?: {
        question: string;
        answer: string;
    };
}

export const getInspectionQueue = async (apiaryId: string): Promise<InspectionQueueItem[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/inspection-queue`);
    return response.data.data;
};

export const recordInspection = async (
    apiaryId: string,
    hiveId: string,
    data: InspectionData
): Promise<any> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/inspect`, data);
    return response.data;
};

export const updatePriorities = async (apiaryId: string): Promise<any> => {
    const response = await api.put(`/apiaries/${apiaryId}/hives/priorities`);
    return response.data;
};

// Split APIs
export interface SplitCandidate {
    hiveId: string;
    hiveNumber: string;
    strengthScore: number;
    readinessLevel: 'READY' | 'SOON' | 'NOT_READY';
    recommendation: string;
    estimatedFrames: number;
}

export const getSplitCandidates = async (apiaryId: string): Promise<SplitCandidate[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/split-candidates`);
    return response.data.data;
};

export interface ExecuteSplitData {
    newHiveNumber: string;
    framesTransferred: Array<{
        frameId: string;
        rating: number;
        type: 'BROOD' | 'HONEY' | 'POLLEN';
    }>;
    queenLocation: 'SOURCE' | 'RESULT' | 'BOTH_NEW';
    notes?: string;
}

export const executeSplit = async (
    apiaryId: string,
    hiveId: string,
    data: ExecuteSplitData
): Promise<any> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/split`, data);
    return response.data;
};

// Merge APIs
export interface MergeCandidate {
    hiveId: string;
    hiveNumber: string;
    riskLevel: number;
    survivalChance: number;
    recommendation: string;
}

export interface MergeSuggestion {
    weakHive: string;
    targetHive: string;
    queenToKeep: string;
    safetyProtocol: string[];
}

export const getMergeCandidates = async (
    apiaryId: string,
    season?: 'SPRING' | 'AUTUMN'
): Promise<{ weakHives: MergeCandidate[]; suggestedMerges: MergeSuggestion[] }> => {
    const params = season ? `?season=${season}` : '';
    const response = await api.get(`/apiaries/${apiaryId}/hives/merge-candidates${params}`);
    return response.data.data;
};

export interface ExecuteMergeData {
    targetHiveId: string;
    mergeMethod: 'NEWSPAPER' | 'DIRECT' | 'GRADUAL';
    queenKept: 'WEAK' | 'TARGET';
    safetyProtocol?: string[];
    notes?: string;
}

export const executeMerge = async (
    apiaryId: string,
    hiveId: string,
    data: ExecuteMergeData
): Promise<any> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/merge`, data);
    return response.data;
};

// Super APIs
export interface SuperCandidate {
    hiveId: string;
    hiveNumber: string;
    readiness: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER' | 'MONITOR';
    targetStory: 2 | 3;
    currentStories: number;
    recommendation: string;
    frameSuggestions: {
        framesToMoveUp: string[];
        framesToAdd: string[];
    };
}

export interface SeasonalContext {
    season: string;
    flows: string[];
    daysUntilPeak: number;
}

export const getSuperCandidates = async (
    apiaryId: string
): Promise<{ candidates: SuperCandidate[]; seasonalContext: SeasonalContext }> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/super-candidates`);
    return response.data.data;
};

export interface AddSuperData {
    operationType: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER';
    targetStory: 2 | 3;
    framesInSuper: number;
    hasExcluder: boolean;
    framesMovedUp?: string[];
    expectedYield?: number;
    notes?: string;
}

export const addSuper = async (
    apiaryId: string,
    hiveId: string,
    data: AddSuperData
): Promise<any> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/super`, data);
    return response.data;
};

// Simulation APIs
export interface SimulationRequest {
    scope: 'HIVE' | 'HIVES' | 'APIARY';
    hiveIds?: string[];
    duration?: number;
    factors: {
        includeWeather: boolean;
        includeBeekeeper: boolean;
        includeSeasons: boolean;
    };
}

export interface SimulationResponse {
    simulationId: string;
    predictions: Array<{
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
    }>;
}

export interface SimulationData {
    scope: 'HIVE' | 'HIVES' | 'APIARY';
    hiveIds?: string[];
    duration?: number;
    factors: {
        includeWeather: boolean;
        includeBeekeeper: boolean;
        includeSeasons: boolean;
    };
}

export const runSimulation = async (apiaryId: string, data: SimulationRequest): Promise<SimulationResponse> => {
    const response = await api.post(`/apiaries/${apiaryId}/simulate`, data);
    return response.data.data || response.data;
};

export const getSimulationHistory = async (apiaryId: string, hiveId: string): Promise<any> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/${hiveId}/simulations`);
    return response.data;
};
