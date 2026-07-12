import { API_URL, fetchWithAuth } from '@/config';

/**
 * Get notifications with optional filters
 * @param filters - Optional filters for notifications
 */
export async function getNotifications(filters?: { 
    read?: boolean; 
    type?: string; 
    limit?: number 
}) {
    const params = new URLSearchParams();
    if (filters?.read !== undefined) params.append('read', String(filters.read));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const response = await fetchWithAuth(`${API_URL}/notifications?${params}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount() {
    const response = await fetchWithAuth(`${API_URL}/notifications/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
}

/**
 * Get notification by ID
 * @param id - Notification ID
 */
export async function getNotificationById(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch notification');
    return response.json();
}

/**
 * Mark notification as read
 * @param id - Notification ID
 */
export async function markAsRead(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return response.json();
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
    const response = await fetchWithAuth(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return response.json();
}

/**
 * Delete notification
 * @param id - Notification ID
 */
export async function deleteNotification(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead() {
    const response = await fetchWithAuth(`${API_URL}/notifications/read/all`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all read');
    return response.json();
}

/**
 * Get user notification settings
 */
export async function getNotificationSettings() {
    const response = await fetchWithAuth(`${API_URL}/notifications/settings/me`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
}

/**
 * Update user notification settings
 * @param settings - Notification settings
 */
export async function updateNotificationSettings(settings: {
    enablePush?: boolean;
    enableEmail?: boolean;
    enableSMS?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    notifyInspection?: boolean;
    notifyFeeding?: boolean;
    notifyHarvest?: boolean;
    notifyDisease?: boolean;
    notifySwarm?: boolean;
    notifyWeather?: boolean;
}) {
    const response = await fetchWithAuth(`${API_URL}/notifications/settings/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
}
