import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
    // Apiary filters
    selectedApiaryId: string | null;

    // Hive filters
    hiveStatus: string[];
    hiveTypes: string[];

    // Inspection filters
    inspectionTypes: string[];
    inspectionDateRange: {
        start: string | null;
        end: string | null;
    };

    // Queen filters
    queenStatus: string[];
    queenBreeds: string[];

    // Disease filters
    diseaseTypes: string[];
    diseaseSeverity: string[];

    // Harvest filters
    harvestTypes: string[];
    harvestDateRange: {
        start: string | null;
        end: string | null;
    };

    // Search
    searchQuery: string;

    // Sorting
    sortBy: string;
    sortOrder: 'asc' | 'desc';

    // Pagination
    currentPage: number;
    itemsPerPage: number;

    // Actions
    setSelectedApiaryId: (id: string | null) => void;

    setHiveStatus: (status: string[]) => void;
    setHiveTypes: (types: string[]) => void;

    setInspectionTypes: (types: string[]) => void;
    setInspectionDateRange: (range: { start: string | null; end: string | null }) => void;

    setQueenStatus: (status: string[]) => void;
    setQueenBreeds: (breeds: string[]) => void;

    setDiseaseTypes: (types: string[]) => void;
    setDiseaseSeverity: (severity: string[]) => void;

    setHarvestTypes: (types: string[]) => void;
    setHarvestDateRange: (range: { start: string | null; end: string | null }) => void;

    setSearchQuery: (query: string) => void;

    setSortBy: (sortBy: string) => void;
    setSortOrder: (order: 'asc' | 'desc') => void;

    setCurrentPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;

    resetFilters: () => void;
    resetPagination: () => void;
}

const initialState = {
    selectedApiaryId: null,
    hiveStatus: [],
    hiveTypes: [],
    inspectionTypes: [],
    inspectionDateRange: { start: null, end: null },
    queenStatus: [],
    queenBreeds: [],
    diseaseTypes: [],
    diseaseSeverity: [],
    harvestTypes: [],
    harvestDateRange: { start: null, end: null },
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    currentPage: 1,
    itemsPerPage: 20,
};

export const useFilterStore = create<FilterState>()(
    persist(
        (set) => ({
            ...initialState,

            // Actions
            setSelectedApiaryId: (id) => set({ selectedApiaryId: id }),

            setHiveStatus: (status) => set({ hiveStatus: status }),
            setHiveTypes: (types) => set({ hiveTypes: types }),

            setInspectionTypes: (types) => set({ inspectionTypes: types }),
            setInspectionDateRange: (range) => set({ inspectionDateRange: range }),

            setQueenStatus: (status) => set({ queenStatus: status }),
            setQueenBreeds: (breeds) => set({ queenBreeds: breeds }),

            setDiseaseTypes: (types) => set({ diseaseTypes: types }),
            setDiseaseSeverity: (severity) => set({ diseaseSeverity: severity }),

            setHarvestTypes: (types) => set({ harvestTypes: types }),
            setHarvestDateRange: (range) => set({ harvestDateRange: range }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            setSortBy: (sortBy) => set({ sortBy }),
            setSortOrder: (order) => set({ sortOrder: order }),

            setCurrentPage: (page) => set({ currentPage: page }),
            setItemsPerPage: (items) => set({ itemsPerPage: items }),

            resetFilters: () =>
                set({
                    hiveStatus: [],
                    hiveTypes: [],
                    inspectionTypes: [],
                    inspectionDateRange: { start: null, end: null },
                    queenStatus: [],
                    queenBreeds: [],
                    diseaseTypes: [],
                    diseaseSeverity: [],
                    harvestTypes: [],
                    harvestDateRange: { start: null, end: null },
                    searchQuery: '',
                }),

            resetPagination: () =>
                set({
                    currentPage: 1,
                }),
        }),
        {
            name: 'filter-storage',
            partialize: (state) => ({
                selectedApiaryId: state.selectedApiaryId,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                itemsPerPage: state.itemsPerPage,
            }),
        }
    )
);
