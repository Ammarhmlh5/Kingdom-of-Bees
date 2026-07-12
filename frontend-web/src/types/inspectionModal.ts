import { Frame } from '@/services/frames';

// ==================== InspectionModal Types ====================

export interface InspectionModalProps {
    hiveId: string;
    apiaryId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contextData?: InspectionContextData;
}

export interface InspectionContextData {
    hiveNumber?: string;
    apiaryName?: string;
    lastInspection?: string;
    queenStatus?: 'PRESENT' | 'ABSENT' | 'UNKNOWN';
}

export interface FrameDetailData {
    frameId: string;
    position: number;
    honeyPercentage: number;
    broodPercentage: number;
    pollenPercentage: number;
    condition: FrameCondition;
}

export type FrameCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export type OverallAssessment = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export type QueenQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface FormState {
    inspectionDate: string;
    overallAssessment: OverallAssessment;
    queenSeen: boolean;
    queenQuality?: QueenQuality;
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    foundationAdded: number;
    framesTransferred: Array<{
        from: string;
        to: string;
        count: number;
    }>;
    diseases: string[];
    foodStock: {
        honey: number;
        pollen: number;
    };
    notes: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface FrameTotal {
    frameId: string;
    position: number;
    total: number;
    isValid: boolean;
}