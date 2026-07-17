export type {
  BeePopulation,
  ColonyState,
  ColonySnapshot,
  SimulationConfig,
  SeasonalParams,
  SocialParams,
} from './types';

export {
  createDefaultConfig,
  createInitialState,
  runSimulation,
  stepSimulation,
  computeEggLayingRate,
  computeLarvaeSurvival,
  computeFoodDeficit,
  computeForagingIncome,
  getLifecycle,
  getDeathRates,
  getFoodConsumption,
} from './simulation';

export type { SimulationResult } from './simulation';
