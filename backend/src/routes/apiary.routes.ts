
import { Router } from 'express';
import { ApiaryController } from '../controllers/apiary.controller';
import { simulationController } from '../controllers/simulation.controller';
import { apiaryMetricsController } from '../controllers/apiary-metrics.controller';
import { apiaryTaskController } from '../controllers/apiary-task.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { DiseaseController } from '../controllers/disease.controller';
import { assessmentController } from '../controllers/assessment.controller';
import { validate } from '../validators';
import { createApiarySchema, updateApiarySchema } from '../validators/apiary.schema';
import { createTaskSchema, updateTaskSchema } from '../validators/apiary-task.schema';
import { recordWeatherDataSchema, recordAutoWeatherDataSchema } from '../validators/assessment.schema';
import { runSimulationSchema } from '../validators/simulation.schema';
import hiveRoutes from './hive.routes';
import { apiaryInspectionRouter } from './inspection.routes';
import feedingRoutes from './feeding.routes';
import diseaseRoutes from './disease.routes';
import harvestRoutes from './harvest.routes';
import memberRoutes from './member.routes';
import queensRoutes from './queens.routes';
import financialsRoutes from './financials.routes';
import apiaryOperationsRoutes from './apiary-operations.routes';

const router = Router();
const controller = new ApiaryController();
const diseaseController = new DiseaseController();

router.use(requireAuth); // All apiary management requires login

// General static routes (MUST be registered before dynamic /:apiaryId routes to prevent parameter hijacking)
router.get('/stats/dashboard', controller.getDashboardStats.bind(controller));
router.get('/diseases', diseaseController.getAllDiseases.bind(diseaseController));

// Nested Routes
router.use('/:apiaryId/hives', hiveRoutes);
router.use('/:apiaryId/inspections', apiaryInspectionRouter);
router.use('/:apiaryId/feeding', feedingRoutes);
router.use('/:apiaryId/diseases', diseaseRoutes);
router.use('/:apiaryId/harvest', harvestRoutes);
router.use('/:apiaryId/members', memberRoutes);
router.use('/:apiaryId/queens', queensRoutes);
router.use('/:apiaryId/financials', financialsRoutes);
router.use('/:apiaryId/operations', apiaryOperationsRoutes);

// Weather assessment routes
router.post('/:apiaryId/weather', validate(recordWeatherDataSchema), assessmentController.recordWeatherData.bind(assessmentController));
router.post('/:apiaryId/weather/auto', validate(recordAutoWeatherDataSchema), assessmentController.recordAutoWeatherData.bind(assessmentController));

// Simulation Route
router.post('/:apiaryId/simulate', validate(runSimulationSchema), simulationController.runSimulation.bind(simulationController));

// Metrics Routes
router.get('/:apiaryId/metrics', apiaryMetricsController.getMetrics.bind(apiaryMetricsController));
router.post('/:apiaryId/metrics/calculate', apiaryMetricsController.calculateMetrics.bind(apiaryMetricsController));
router.get('/:apiaryId/metrics/history', apiaryMetricsController.getMetricsHistory.bind(apiaryMetricsController));

// Task Routes
router.get('/:apiaryId/tasks/stats', apiaryTaskController.getTaskStats.bind(apiaryTaskController));
router.post('/:apiaryId/tasks/generate-inspections', apiaryTaskController.generateInspectionTasks.bind(apiaryTaskController));
router.get('/:apiaryId/tasks/:taskId', apiaryTaskController.getTaskById.bind(apiaryTaskController));
router.get('/:apiaryId/tasks', apiaryTaskController.getTasks.bind(apiaryTaskController));
router.post('/:apiaryId/tasks', validate(createTaskSchema), apiaryTaskController.createTask.bind(apiaryTaskController));
router.put('/:apiaryId/tasks/:taskId', validate(updateTaskSchema), apiaryTaskController.updateTask.bind(apiaryTaskController));
router.post('/:apiaryId/tasks/:taskId/complete', apiaryTaskController.completeTask.bind(apiaryTaskController));
router.delete('/:apiaryId/tasks/:taskId', apiaryTaskController.deleteTask.bind(apiaryTaskController));

router.get('/', controller.getMyApiaries);
router.post('/', validate(createApiarySchema), controller.create);
router.get('/:apiaryId', controller.getDetails);
router.put('/:apiaryId', validate(updateApiarySchema), controller.update);
router.delete('/:apiaryId', controller.delete);

// Stats & Weather
router.get('/:apiaryId/stats/dashboard', controller.getApiaryStats.bind(controller));
router.get('/:apiaryId/weather/real', controller.getWeather.bind(controller));

export default router;
