// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserType = 'ADMIN' | 'OWNER' | 'WORKER' | 'EXPLORER';

export interface User {
    id: string;
    authId: string;
    email: string;
    fullName: string;
    userType: UserType;
    phone?: string;
    avatarUrl?: string;
    country?: string;
    region?: string;
    city?: string;
    language?: string;
    timezone?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    userType?: UserType;
    phone?: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}

// ============================================
// APIARY TYPES
// ============================================

export type ApiaryType = 'STATIONARY' | 'MIGRATORY';

export interface Apiary {
    id: string;
    name: string;
    type: ApiaryType;
    locationLat?: number;
    locationLng?: number;
    address?: string;
    description?: string;
    ownerId: string;
    isActive: boolean;
    establishedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        hives: number;
    };
}

export interface CreateApiaryRequest {
    name: string;
    type: ApiaryType;
    locationLat?: number;
    locationLng?: number;
    address?: string;
    description?: string;
    establishedDate?: string;
}

export interface UpdateApiaryRequest {
    name?: string;
    type?: ApiaryType;
    locationLat?: number;
    locationLng?: number;
    address?: string;
    description?: string;
}

// ============================================
// HIVE TYPES
// ============================================

export type HiveType = 'LANGSTROTH' | 'TOP_BAR' | 'WARRE' | 'BALADI';
export type HiveStatus = 'ACTIVE' | 'INACTIVE' | 'QUEENLESS' | 'DEAD' | 'SPLIT' | 'MERGED';

export interface Hive {
    id: string;
    apiaryId: string;
    hiveNumber: string;
    hiveType: HiveType;
    status: HiveStatus;
    installDate: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    apiary?: Apiary;
    _count?: {
        inspections: number;
        honeyHarvests: number;
    };
}

export interface CreateHiveRequest {
    apiaryId: string;
    hiveNumber: string;
    hiveType: HiveType;
    status?: HiveStatus;
    installDate?: string;
    notes?: string;
}

export interface UpdateHiveRequest {
    hiveNumber?: string;
    hiveType?: HiveType;
    status?: HiveStatus;
    notes?: string;
}

// ============================================
// ALERT TYPES
// ============================================

export type AlertPriority = 'IMMEDIATE' | 'URGENT' | 'SOON' | 'ROUTINE';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';

export interface Alert {
    id: string;
    userId: string;
    apiaryId?: string;
    hiveId?: string;
    alertType: string;
    priority: AlertPriority;
    title: string;
    message: string;
    status: AlertStatus;
    actionRequired: boolean;
    actionUrl?: string;
    actionDeadline?: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
    expiresAt?: Date;
    apiary?: {
        id: string;
        name: string;
        locationLat?: number;
        locationLng?: number;
    };
    user?: User;
}

export interface CreateAlertRequest {
    title: string;
    message: string;
    alertType: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | AlertPriority;
    apiaryId?: string;
    hiveId?: string;
}

export interface UpdateAlertRequest {
    status: AlertStatus;
}

export interface GetAlertsQuery {
    lat?: number;
    lng?: number;
    radius?: number;
}

// ============================================
// INSPECTION TYPES
// ============================================

export type InspectionType = 'ROUTINE' | 'DISEASE_CHECK' | 'QUEEN_CHECK' | 'HARVEST_PREP' | 'EMERGENCY';

export interface Inspection {
    id: string;
    hiveId: string;
    inspectionDate: Date;
    inspectionType: InspectionType;
    weather?: string;
    temperature?: number;
    notes?: string;
    overallHealth?: string;
    createdAt: Date;
    updatedAt: Date;
    hive?: Hive & { apiary?: Apiary };
    findings?: InspectionFinding[];
    actions?: InspectionAction[];
}

export interface InspectionFinding {
    id: string;
    inspectionId: string;
    findingType: string;
    severity?: string;
    description: string;
    createdAt: Date;
}

export interface InspectionAction {
    id: string;
    inspectionId: string;
    actionType: string;
    description: string;
    completed: boolean;
    createdAt: Date;
}

export interface CreateInspectionRequest {
    hiveId: string;
    inspectionDate?: string;
    inspectionType: InspectionType;
    weather?: string;
    temperature?: number;
    notes?: string;
    overallHealth?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: any;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
