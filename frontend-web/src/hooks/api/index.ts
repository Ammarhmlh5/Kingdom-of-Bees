import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiaryService } from '@/services/apiaries';
import { hiveService } from '@/services/hives';
import { diseaseService } from '@/services/diseases';
import { harvestService } from '@/services/harvest';
import { analysisService } from '@/services/analysis';
import { inspectionService } from '@/services/inspections';
import { analyticsService } from '@/services/analytics';
import { frameService } from '@/services/frames';
import { weatherService } from '@/services/weather';
import { productionService } from '@/services/production';
import { plantsService } from '@/services/plants';
import { nucleiService } from '@/services/nuclei';
import { dashboardService } from '@/services/dashboard';
import { healthService } from '@/services/health';
import { queensService } from '@/services/queens';

// --- APIARIES ---

export function useApiaries() {
    return useQuery({
        queryKey: ['apiaries'],
        queryFn: apiaryService.getMyApiaries
    });
}

export function useApiary(id?: string) {
    return useQuery({
        queryKey: ['apiary', id],
        queryFn: () => apiaryService.getApiaryDetails(id!),
        enabled: !!id
    });
}

export function useCreateApiary() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: apiaryService.createApiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiaries'] });
        }
    });
}

export function useUpdateApiary() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiaryService.updateApiary(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['apiary', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['apiaries'] });
            queryClient.invalidateQueries({ queryKey: ['weather', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['forecast', variables.id] });
        }
    });
}

export function useDeleteApiary() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: apiaryService.deleteApiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiaries'] });
        }
    });
}

// --- HIVES ---

export function useHives(apiaryId?: string) {
    return useQuery({
        queryKey: ['hives', apiaryId],
        queryFn: () => hiveService.getHives(apiaryId),
        enabled: !!apiaryId
    });
}

export function useHive(apiaryId: string, id: string) {
    return useQuery({
        queryKey: ['hive', apiaryId, id],
        queryFn: () => hiveService.getHive(apiaryId, id),
        enabled: !!id && !!apiaryId
    });
}

export function useCreateHive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, data }: { apiaryId: string, data: any }) => hiveService.createHive(apiaryId, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['hives', vars.apiaryId] });
        }
    });
}

export function useUpdateHive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, id, data }: { apiaryId: string, id: string, data: any }) => hiveService.updateHive(apiaryId, id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['hives', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['hive', vars.apiaryId, vars.id] });
        }
    });
}

export function useDeleteHive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, id }: { apiaryId: string, id: string }) => hiveService.deleteHive(apiaryId, id),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['hives', vars.apiaryId] });
        }
    });
}

// --- DISEASES ---

export function useActiveDiseases(apiaryId: string) {
    return useQuery({
        queryKey: ['diseases', 'active', apiaryId],
        queryFn: () => diseaseService.getActive(apiaryId),
        enabled: !!apiaryId
    });
}

export function useDiseaseLibrary(apiaryId: string) {
    return useQuery({
        queryKey: ['diseases', 'library'],
        queryFn: () => diseaseService.getLibrary(apiaryId)
    });
}

export function useReportOutbreak() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, affectedHives, ...data }: { apiaryId: string, affectedHives?: string[], [key: string]: any }) =>
            diseaseService.reportOutbreak(apiaryId, {
                ...data,
                hiveIds: affectedHives || []
            }),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['diseases', 'active', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['apiary-stats', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['operations-log', vars.apiaryId] });
        }
    });
}

export function useResolveDisease() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, recordId, outcome }: { apiaryId: string, recordId: string, outcome: string }) => diseaseService.resolve(apiaryId, recordId, outcome),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['diseases', 'active', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['operations-log', vars.apiaryId] });
        }
    });
}

// --- HARVEST ---

export function useHarvestHistory(apiaryId: string) {
    return useQuery({
        queryKey: ['harvest', apiaryId],
        queryFn: () => harvestService.getHistory(apiaryId),
        enabled: !!apiaryId
    });
}

export function useRecordHarvest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, ...data }: { apiaryId: string, [key: string]: any }) => harvestService.recordHarvest(apiaryId, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['harvest', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['apiary-stats', vars.apiaryId] });
        }
    });
}

export const useCreateHarvestRecord = useRecordHarvest;

// --- ANALYSIS ---

export function useHiveAnalysis(hiveId: string) {
    return useQuery({
        queryKey: ['analysis', hiveId],
        queryFn: () => analysisService.getAnalysis(hiveId),
        enabled: !!hiveId
    });
}

// --- INSPECTIONS ---

export function useInspections(apiaryId?: string) {
    return useQuery({
        queryKey: ['inspections', apiaryId],
        queryFn: () => inspectionService.getInspections(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useInspection(apiaryId: string, inspectionId?: string) {
    return useQuery({
        queryKey: ['inspection', apiaryId, inspectionId],
        queryFn: () => inspectionService.getInspection(apiaryId, inspectionId!),
        enabled: !!inspectionId && !!apiaryId
    });
}

export function useCreateInspection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, data }: { apiaryId: string, data: any }) => inspectionService.createInspection(apiaryId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
            queryClient.invalidateQueries({ queryKey: ['hive', data.apiaryId, data.hiveId] });
        }
    });
}

export function useUpdateInspection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, id, data }: { apiaryId: string, id: string, data: any }) => inspectionService.updateInspection(apiaryId, id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['inspection', data.id] });
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
        }
    });
}

export function useDeleteInspection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, id }: { apiaryId: string, id: string }) => inspectionService.deleteInspection(apiaryId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
        }
    });
}

// --- FRAMES ---

export function useHiveFrames(apiaryId?: string, hiveId?: string) {
    return useQuery({
        queryKey: ['frames', apiaryId, hiveId],
        queryFn: () => frameService.getHiveFrames(apiaryId!, hiveId!),
        enabled: !!apiaryId && !!hiveId
    });
}

export function useUpdateFrames() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, hiveId, frames }: { apiaryId: string, hiveId: string, frames: any }) =>
            frameService.updateFrames(apiaryId, hiveId, frames),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['frames', vars.apiaryId, vars.hiveId] });
            queryClient.invalidateQueries({ queryKey: ['hive', vars.apiaryId, vars.hiveId] });
        }
    });
}

export function useFrame(apiaryId?: string, hiveId?: string, frameId?: string) {
    return useQuery({
        queryKey: ['frame', apiaryId, hiveId, frameId],
        queryFn: async () => {
            const frames = await frameService.getHiveFrames(apiaryId!, hiveId!);
            return frames.find((f: any) => f.id === frameId) || null;
        },
        enabled: !!apiaryId && !!hiveId && !!frameId
    });
}

export function useDeleteFrame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ apiaryId, hiveId, frameId }: { apiaryId: string, hiveId: string, frameId: string }) => {
            await frameService.updateFrames(apiaryId, hiveId, { frames: [{ id: frameId, delete: true }] });
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['frames', vars.apiaryId, vars.hiveId] });
        }
    });
}

// --- HIVE OPERATIONS ---

export function useSplitHive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, hiveId, data }: { apiaryId: string, hiveId: string, data: any }) =>
            hiveService.splitHive(hiveId, data, apiaryId),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['hives', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['hive', vars.apiaryId, vars.hiveId] });
        }
    });
}

export function useMergeHives() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, hiveId, data }: { apiaryId: string, hiveId: string, data: any }) =>
            hiveService.mergeHives(hiveId, data, apiaryId),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['hives', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['hive', vars.apiaryId, vars.hiveId] });
        }
    });
}

export function useCreateSnapshot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, hiveId, data }: { apiaryId: string, hiveId: string, data: any }) =>
            frameService.createSnapshot(apiaryId, hiveId, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['frames', vars.apiaryId, vars.hiveId] });
        }
    });
}

// --- NUCLEI ---

export function useNuclei(apiaryId?: string) {
    return useQuery({
        queryKey: ['nuclei', apiaryId],
        queryFn: () => nucleiService.getNuclei(apiaryId!),
        enabled: !!apiaryId
    });
}

// --- OPERATIONS ---

export function useOperations(apiaryId?: string) {
    return useQuery({
        queryKey: ['operations', apiaryId],
        queryFn: async () => {
            return { splits: [], merges: [], swarms: [] };
        }
    });
}

// --- PRODUCTION ---

export function useProductionReport(apiaryId?: string) {
    return useQuery({
        queryKey: ['production', apiaryId],
        queryFn: () => productionService.getHarvestRecords(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useHarvestRecords(apiaryId?: string) {
    return useQuery({
        queryKey: ['harvest-records', apiaryId],
        queryFn: () => productionService.getHarvestRecords(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useHarvestRecord(apiaryId?: string, recordId?: string) {
    return useQuery({
        queryKey: ['harvest-record', apiaryId, recordId],
        queryFn: () => productionService.getHarvestRecord(apiaryId!, recordId!),
        enabled: !!apiaryId && !!recordId
    });
}

export function useCreateHoneyHarvest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, ...data }: { apiaryId: string, [key: string]: any }) =>
            productionService.recordHoneyHarvest(apiaryId, data as any),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['harvest', vars.apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['production', vars.apiaryId] });
        }
    });
}

export function useCreatePollenHarvest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ apiaryId, ...data }: { apiaryId: string, [key: string]: any }) => {
            return productionService.recordHoneyHarvest(apiaryId, data as any);
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['harvest', vars.apiaryId] });
        }
    });
}

// --- QUEENS (re-export from dedicated file for real impl) ---
export { useQueens, useCreateQueen, useDeleteQueen } from './useQueens';

export function useQueen(apiaryId?: string, queenId?: string) {
    return useQuery({
        queryKey: ['queen', apiaryId, queenId],
        queryFn: async () => {
            if (!apiaryId) return null;
            const queens = await queensService.getQueens(apiaryId);
            return queens.find((q: any) => q.id === queenId) || null;
        },
        enabled: !!apiaryId && !!queenId
    });
}

// --- DISEASES (aliases) ---

export function useDiseases(apiaryId?: string) {
    return useActiveDiseases(apiaryId || '');
}

export function useDisease(apiaryId?: string, diseaseId?: string) {
    return useQuery({
        queryKey: ['disease', apiaryId, diseaseId],
        queryFn: async () => {
            if (!apiaryId || !diseaseId) return null;
            const records = await diseaseService.getActive(apiaryId);
            return records.find((r: any) => r.id === diseaseId) || null;
        },
        enabled: !!apiaryId && !!diseaseId
    });
}

export function useCreateDiseaseRecord() {
    return useReportOutbreak();
}

// --- WEATHER ---

export function useCurrentWeather(apiaryId?: string) {
    return useQuery({
        queryKey: ['weather', apiaryId],
        queryFn: () => weatherService.getCurrentWeather(apiaryId!),
        enabled: !!apiaryId,
        staleTime: 10 * 60 * 1000
    });
}

export function useForecast(apiaryId?: string) {
    return useQuery({
        queryKey: ['forecast', apiaryId],
        queryFn: async () => {
            const weather = await weatherService.getCurrentWeather(apiaryId!);
            return [weather];
        },
        enabled: !!apiaryId,
        staleTime: 10 * 60 * 1000
    });
}

// --- PLANTS ---

export function useApiaryPlants(apiaryId?: string) {
    return useQuery({
        queryKey: ['plants', apiaryId],
        queryFn: () => plantsService.getApiaryPlants(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useSearchPlants(query: string) {
    return useQuery({
        queryKey: ['plants-search', query],
        queryFn: () => plantsService.searchPlants(query),
        enabled: !!query
    });
}

export function useAddLocalPlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, ...data }: { apiaryId: string } & Parameters<typeof plantsService.addLocalPlant>[1]) =>
            plantsService.addLocalPlant(apiaryId, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['plants', vars.apiaryId] });
        }
    });
}

export function useUpdateLocalPlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, plantId, ...data }: { apiaryId: string, plantId: string } & Parameters<typeof plantsService.updateLocalPlant>[2]) =>
            plantsService.updateLocalPlant(apiaryId, plantId, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['plants', vars.apiaryId] });
        }
    });
}

export function useRemoveLocalPlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, plantId }: { apiaryId: string, plantId: string }) =>
            plantsService.removeLocalPlant(apiaryId, plantId),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['plants', vars.apiaryId] });
        }
    });
}

// --- HEALTH ---

export function useHealthRecords(apiaryId?: string) {
    return useQuery({
        queryKey: ['health-records', apiaryId],
        queryFn: () => healthService.getHealthRecords(apiaryId!),
        enabled: !!apiaryId
    });
}

// --- ALERTS ---

export function useNearbyAlerts(apiaryId?: string) {
    return useQuery({
        queryKey: ['nearby-alerts', apiaryId],
        queryFn: async () => {
            const { getAlerts } = await import('@/services/alerts');
            return getAlerts();
        }
    });
}

// --- HIVE STATS ---

export function useHiveStats(apiaryId?: string, hiveId?: string) {
    return useQuery({
        queryKey: ['hive-stats', apiaryId, hiveId],
        queryFn: async () => {
            if (!apiaryId || !hiveId) return { broodFrames: 0, honeyFrames: 0, pollenFrames: 0, emptyFrames: 0, population: 0, strength: 'MEDIUM', trend: 'STABLE', history: [] };
            const hive = await hiveService.getHive(apiaryId, hiveId);
            return {
                broodFrames: (hive as any)?.stats?.broodFrames || 0,
                honeyFrames: (hive as any)?.stats?.honeyFrames || 0,
                pollenFrames: (hive as any)?.stats?.pollenFrames || 0,
                emptyFrames: (hive as any)?.stats?.emptyFrames || 0,
                population: (hive as any)?.stats?.population || 0,
                strength: (hive as any)?.strengthRating || 'MEDIUM',
                trend: 'STABLE',
                history: []
            };
        },
        enabled: !!apiaryId && !!hiveId
    });
}

// --- ANALYTICS & PREDICTIONS ---

export function useApiaryAnalytics(apiaryId?: string, hiveId?: string) {
    return useQuery({
        queryKey: ['analytics', apiaryId, hiveId],
        queryFn: () => analyticsService.getAnalyticsSummary(apiaryId!, hiveId),
        enabled: !!apiaryId,
        staleTime: 60 * 1000,
    });
}

// --- DASHBOARD ---

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard-kpis'],
        queryFn: dashboardService.getKPIs,
        staleTime: 60 * 1000
    });
}

export function useProductionStats(apiaryId?: string) {
    return useQuery({
        queryKey: ['production-stats', apiaryId],
        queryFn: () => dashboardService.getProductionStats(apiaryId),
        staleTime: 60 * 1000
    });
}

export function useFinancialSummary(apiaryId?: string) {
    return useQuery({
        queryKey: ['financial-summary', apiaryId],
        queryFn: () => dashboardService.getFinancialSummary(apiaryId),
        staleTime: 60 * 1000
    });
}

// --- FINANCIALS (re-export) ---
export { useFinancials, useCreateFinancialRecord, useDeleteFinancialRecord } from './useFinancials';

// --- OPERATIONS LOG (re-export) ---
export { useOperationsLog, useUpdateOperation, useDeleteOperation } from './useOperationsLog';

// --- FEEDING (re-export) ---
export { useFeedingRecords, useCreateFeedingRecord, useFeedingTypes, useFeedingRecommendations } from './useFeeding';

// --- INSPECTION SETTINGS (re-export) ---
export {
    useInspectionSettings,
    useInspectionSetting,
    useSaveInspectionSetting,
    useUpdateInspectionSetting,
    useValidateInspectionDate,
    useUpcomingSchedules,
    useOverdueSchedules,
    useCompleteSchedule,
    useCancelSchedule
} from './useInspectionSettings';
