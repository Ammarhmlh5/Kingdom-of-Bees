import { alertRepository } from '../repositories/alert.repository';

export class AlertService {
    async getAll(filters?: { lat?: number; lng?: number; radius?: number }) {
        return alertRepository.findAll(filters);
    }

    async create(data: any, userId: string) {
        return alertRepository.create({ ...data, userId });
    }

    async updateStatus(id: string, status: string, userId: string) {
        return alertRepository.update(id, { status }, userId);
    }
}

export const alertService = new AlertService();
