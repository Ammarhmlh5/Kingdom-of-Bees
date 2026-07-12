/// <reference types="vite/client" />
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const getAuthToken = () => localStorage.getItem("adminToken");
export const setAuthToken = (token: string) => localStorage.setItem("adminToken", token);
export const removeAuthToken = () => localStorage.removeItem("adminToken");

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        removeAuthToken();
        window.location.href = "/login";
    }

    return response;
};
