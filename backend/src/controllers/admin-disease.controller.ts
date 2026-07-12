import { Request, Response } from 'express';
import { adminDiseaseService } from '../services/admin-disease.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class AdminDiseaseController {
    // ==========================================
    // DISEASE LIBRARY
    // ==========================================
    
    async getAllDiseases(_req: Request, res: Response) {
        try {
            const diseases = await adminDiseaseService.getAllDiseases();
            ApiResponse.success(res, diseases);
        } catch (error) {
            logger.error('Error fetching diseases:', error);
            ApiResponse.error(res, 'Failed to fetch diseases', 500);
        }
    }

    async getDiseaseById(req: Request, res: Response) {
        try {
            const disease = await adminDiseaseService.getDiseaseById(req.params.id);
            if (!disease) return ApiResponse.error(res, 'Disease not found', 404);
            ApiResponse.success(res, disease);
        } catch (error) {
            ApiResponse.error(res, 'Failed to fetch disease', 500);
        }
    }

    async createDisease(req: Request, res: Response) {
        try {
            const disease = await adminDiseaseService.createDisease(req.body);
            ApiResponse.created(res, disease);
        } catch (error) {
            logger.error('Error creating disease:', error);
            ApiResponse.error(res, 'Failed to create disease', 400);
        }
    }

    async updateDisease(req: Request, res: Response) {
        try {
            const disease = await adminDiseaseService.updateDisease(req.params.id, req.body);
            ApiResponse.success(res, disease);
        } catch (error) {
            ApiResponse.error(res, 'Failed to update disease', 400);
        }
    }

    async deleteDisease(req: Request, res: Response) {
        try {
            await adminDiseaseService.deleteDisease(req.params.id);
            ApiResponse.success(res, null);
        } catch (error) {
            ApiResponse.error(res, 'Failed to delete disease', 400);
        }
    }

    // ==========================================
    // DISEASE TREATMENTS
    // ==========================================

    async getTreatmentsByDisease(req: Request, res: Response) {
        try {
            const treatments = await adminDiseaseService.getTreatmentsByDisease(req.params.diseaseId);
            ApiResponse.success(res, treatments);
        } catch (error) {
            ApiResponse.error(res, 'Failed to fetch treatments', 500);
        }
    }

    async createTreatment(req: Request, res: Response) {
        try {
            const treatment = await adminDiseaseService.createTreatment(req.params.diseaseId, req.body);
            ApiResponse.created(res, treatment);
        } catch (error) {
            logger.error('Error creating treatment:', error);
            ApiResponse.error(res, 'Failed to create treatment', 400);
        }
    }

    async updateTreatment(req: Request, res: Response) {
        try {
            const treatment = await adminDiseaseService.updateTreatment(req.params.id, req.body);
            ApiResponse.success(res, treatment);
        } catch (error) {
            ApiResponse.error(res, 'Failed to update treatment', 400);
        }
    }

    async deleteTreatment(req: Request, res: Response) {
        try {
            await adminDiseaseService.deleteTreatment(req.params.id);
            ApiResponse.success(res, null);
        } catch (error) {
            ApiResponse.error(res, 'Failed to delete treatment', 400);
        }
    }
}
