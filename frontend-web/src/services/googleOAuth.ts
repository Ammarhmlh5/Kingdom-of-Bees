/**
 * Google OAuth Integration
 * This module handles Google Sign-In for the Kingdom of Bees platform
 */

declare global {
    interface Window {
        google: any;
    }
}

export interface GoogleUser {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

/**
 * Initialize Google OAuth
 * Call this in your app's main component (App.tsx)
 */
export function initGoogleOAuth(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
        document.body.appendChild(script);
    });
}

/**
 * Show Google One Tap prompt
 */
export function showGoogleOneTap(
    clientId: string,
    onSuccess: (user: GoogleUser) => void,
    onError: (error: Error) => void
) {
    if (!window.google) {
        onError(new Error('Google OAuth not initialized'));
        return;
    }

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
            try {
                const decoded = parseJwt(response.credential);
                const user: GoogleUser = {
                    googleId: decoded.sub,
                    email: decoded.email,
                    fullName: decoded.name,
                    avatarUrl: decoded.picture
                };
                onSuccess(user);
            } catch (error) {
                onError(error as Error);
            }
        }
    });

    window.google.accounts.id.prompt();
}

/**
 * Show Google Sign-In button
 */
export function renderGoogleButton(
    elementId: string,
    clientId: string,
    onSuccess: (user: GoogleUser) => void,
    onError: (error: Error) => void
) {
    if (!window.google) {
        onError(new Error('Google OAuth not initialized'));
        return;
    }

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
            try {
                const decoded = parseJwt(response.credential);
                const user: GoogleUser = {
                    googleId: decoded.sub,
                    email: decoded.email,
                    fullName: decoded.name,
                    avatarUrl: decoded.picture
                };
                onSuccess(user);
            } catch (error) {
                onError(error as Error);
            }
        }
    });

    window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        }
    );
}

/**
 * Parse JWT token
 */
function parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

/**
 * Google OAuth configuration
 * TODO: Replace with your actual Google OAuth Client ID
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

