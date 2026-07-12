import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { frameService } from '@/services/frames';
import type { CreateFrameData, FrameData, CreateSnapshotData } from '@/services/frames';

export const framesKeys = {
    all: ['frames'] as const,
    lists: () => [...framesKeys.all, 'list'] as const,
    list: (hiveId: string) => [...framesKeys.lists(), hiveId] as const,
    details: () => [...framesKeys.all, 'detail'] as const,
    detail: (id: string) => [...framesKeys.details(), id] as const,
    history: (id: string) => [...framesKeys.detail(id), 'history'] as const,
};

export function useHiveFrames(hiveId: string) {
    return useQuery({
        queryKey: framesKeys.list(hiveId),
        queryFn: () => frameService.getHiveFrames(hiveId),
        enabled: !!hiveId,
    });
}

export function useFrame(frameId: string) {
    return useQuery({
        queryKey: framesKeys.detail(frameId),
        queryFn: () => frameService.getFrame(frameId),
        enabled: !!frameId,
    });
}

export function useFrameHistory(frameId: string, limit?: number) {
    return useQuery({
        queryKey: [...framesKeys.history(frameId), { limit }],
        queryFn: () => frameService.getFrameHistory(frameId, limit),
        enabled: !!frameId,
    });
}

export function useCreateFrame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hiveId, data }: { hiveId: string; data: CreateFrameData }) =>
            frameService.createFrame(hiveId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: framesKeys.lists() });
        },
    });
}

export function useUpdateFrame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ frameId, data }: { frameId: string; data: Partial<FrameData> }) =>
            frameService.updateFrame(frameId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: framesKeys.detail(variables.frameId) });
            queryClient.invalidateQueries({ queryKey: framesKeys.lists() });
        },
    });
}

export function useDeleteFrame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: frameService.deleteFrame,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: framesKeys.lists() });
        },
    });
}

export function useCreateSnapshot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ frameId, data }: { frameId: string; data: CreateSnapshotData }) =>
            frameService.createSnapshot(frameId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: framesKeys.history(variables.frameId) });
        },
    });
}
