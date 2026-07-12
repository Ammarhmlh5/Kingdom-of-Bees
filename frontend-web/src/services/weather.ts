import api from './api';

export interface WeatherData {
    id: string;
    apiaryId: string;
    temperatureCelsius?: number;
    humidityPercentage?: number;
    windSpeedKmh?: number;
    conditions?: string;
    date: string;
    foragingOpportunity?: string;
}

export const weatherService = {
    getCurrentWeather: async (apiaryId: string): Promise<WeatherData> => {
        const response = await api.get(`/apiaries/${apiaryId}/weather/real`);
        return response.data?.data || response.data || {
            id: '', apiaryId, temperatureCelsius: 25, humidityPercentage: 50,
            conditions: 'Sunny', date: new Date().toISOString(), foragingOpportunity: 'HIGH'
        };
    },

    recordWeather: async (apiaryId: string, data: Partial<WeatherData>): Promise<WeatherData> => {
        const response = await api.post(`/apiaries/${apiaryId}/weather`, data);
        return response.data;
    }
};
