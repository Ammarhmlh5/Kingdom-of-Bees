import api from './api';

export interface FlightAssessmentData {
    date: string;
    time: string;
    duration: number;
    beeCount: number;
    notes?: string;
}

export interface PollenAssessmentData {
    date: string;
    time: string;
    duration: number;
    beeCount: number;
    pollenColors?: string;
    notes?: string;
}

export interface WeatherData {
    date: string;
    time: string;
    temperature?: number;
    rainfall?: number;
    notes?: string;
}

/**
 * Record flight assessment for a hive
 */
export async function recordFlightAssessment(
    apiaryId: string,
    hiveId: string,
    data: FlightAssessmentData
) {
    const response = await api.post(
        `/apiaries/${apiaryId}/hives/${hiveId}/assessments/flight`,
        data
    );
    return response.data;
}

/**
 * Record pollen assessment for a hive
 */
export async function recordPollenAssessment(
    apiaryId: string,
    hiveId: string,
    data: PollenAssessmentData
) {
    const response = await api.post(
        `/apiaries/${apiaryId}/hives/${hiveId}/assessments/pollen`,
        data
    );
    return response.data;
}

/**
 * Record weather data for an apiary
 */
export async function recordWeatherData(
    apiaryId: string,
    data: WeatherData
) {
    const response = await api.post(
        `/apiaries/${apiaryId}/weather`,
        data
    );
    return response.data;
}

/**
 * Auto-fetch weather data for a specific date from Open-Meteo
 */
export async function recordAutoWeatherData(
    apiaryId: string,
    date: string
) {
    const response = await api.post(
        `/apiaries/${apiaryId}/weather/auto`,
        { date }
    );
    return response.data;
}

export const assessmentService = {
    recordFlightAssessment,
    recordPollenAssessment,
    recordWeatherData,
    recordAutoWeatherData
};
