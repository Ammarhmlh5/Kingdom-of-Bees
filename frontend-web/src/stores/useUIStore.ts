import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    // Sidebar state
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Theme
    theme: 'light' | 'dark' | 'system';

    // Modals
    activeModal: string | null;
    modalData: any;

    // Notifications
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        timestamp: number;
    }>;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapse: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    openModal: (modalId: string, data?: any) => void;
    closeModal: () => void;

    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            // Initial state
            sidebarOpen: true,
            sidebarCollapsed: false,
            theme: 'system',
            activeModal: null,
            modalData: null,
            notifications: [],

            // Actions
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

            setTheme: (theme) => set({ theme }),

            openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
            closeModal: () => set({ activeModal: null, modalData: null }),

            addNotification: (notification) =>
                set((state) => ({
                    notifications: [
                        ...state.notifications,
                        {
                            ...notification,
                            id: Math.random().toString(36).substring(7),
                            timestamp: Date.now(),
                        },
                    ],
                })),

            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                })),

            clearNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                theme: state.theme,
            }),
        }
    )
);
