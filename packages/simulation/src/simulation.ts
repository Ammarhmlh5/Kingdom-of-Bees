import type {
  ColonyState,
  ColonySnapshot,
  SimulationConfig,
  SeasonalParams,
  SocialParams,
} from './types';

const LIFECYCLE = {
  eggDays: 3,
  larvaeDays: 5,
  pupaeDays: 12,
  hiveDays: 21,
  foragerDays: 14,
  droneDays: 11,
} as const;

const DEATH_RATES = {
  egg: 0.03,
  larvae: 0.01,
  pupae: 0.001,
  hive: 0.015,
  forager: 0.045,
  winter: 0.01,
} as const;

const FOOD_CONSUMPTION = {
  hiveBee: 0.007,
  forager: 0.007,
  drone: 0.014,
  larvae: 0.018,
} as const;

const DEFAULT_SEASONAL: SeasonalParams = {
  x1: 385,
  x2: 30,
  x3: 36,
  x4: 155,
  x5: 30,
  summerBegin: 65,
  summerEnd: 260,
};

const DEFAULT_SOCIAL: SocialParams = {
  hiveForagerRatio: 2.3,
  nurseLarvaeRatio: 0.5,
  maturationExponent: 4,
};

const DEFAULT_CONFIG: SimulationConfig = {
  initialBees: 8000,
  simulationDays: 365,
  dt: 0.1,
  maxEggLayingRate: 1600,
  foragingRate: 0.1,
  hiveDeathRate: DEATH_RATES.hive,
  foragerDeathRate: DEATH_RATES.forager,
  winterDeathRate: DEATH_RATES.winter,
  foodInaccessible: 100,
  parasiteLoad: 0,
};

export function createDefaultConfig(overrides?: Partial<SimulationConfig>): SimulationConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

export function getLifecycle() {
  return { ...LIFECYCLE };
}

export function getDeathRates() {
  return { ...DEATH_RATES };
}

export function getFoodConsumption() {
  return { ...FOOD_CONSUMPTION };
}

function sigmoidSeasonal(dayOfYear: number, p: SeasonalParams): number {
  const s1 = 1 - 1 / (1 + p.x1 * Math.exp((-2 * dayOfYear) / p.x2));
  const s2 = 1 / (1 + p.x3 * Math.exp((-2 * (dayOfYear - p.x4)) / p.x5));
  return Math.max(s1, s2);
}

function isSummer(dayOfYear: number, p: SeasonalParams): boolean {
  return dayOfYear > p.summerBegin && dayOfYear < p.summerEnd;
}

function dailySurvival(rate: number): number {
  return 1 - rate;
}

function createPopulation(size: number): number[] {
  return new Array(size).fill(0);
}

export function createInitialState(config?: Partial<SimulationConfig>): ColonyState {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const total = cfg.initialBees;
  const { eggDays, larvaeDays, pupaeDays, hiveDays, foragerDays, droneDays } = LIFECYCLE;

  const eggs = createPopulation(eggDays);
  const larvae = createPopulation(larvaeDays);
  const pupae = createPopulation(pupaeDays);
  const hiveBees = createPopulation(hiveDays);
  const foragers = createPopulation(foragerDays);
  const drones = createPopulation(droneDays);

  hiveBees.fill(total / hiveDays);

  const nurseCount = Math.min(LIFECYCLE.hiveDays, 10);
  let nurseBees = 0;
  for (let j = 0; j < nurseCount; j++) {
    nurseBees += hiveBees[j];
  }

  return {
    population: { eggs, larvae, pupae, hiveBees, foragers, drones },
    food: 2000,
    dayOfYear: 60,
    totalBees: total,
    nurseBees,
  };
}

export function computeEggLayingRate(
  state: ColonyState,
  seasonalFactor: number,
  config: SimulationConfig,
): number {
  if (state.totalBees <= 1000) return 0;
  return config.maxEggLayingRate * (1 - seasonalFactor);
}

export function computeLarvaeSurvival(
  nurseRatio: number,
  hiveForagerRatio: number,
  config: SimulationConfig,
): number {
  const expectedRatio = DEFAULT_SOCIAL.nurseLarvaeRatio * config.foragerDeathRate * 10;
  if (hiveForagerRatio < DEFAULT_SOCIAL.hiveForagerRatio) {
    return dailySurvival(DEATH_RATES.larvae) * Math.pow(
      nurseRatio / Math.max(expectedRatio, 0.01),
      1 / DEFAULT_SOCIAL.maturationExponent,
    );
  }
  return dailySurvival(DEATH_RATES.larvae);
}

export function computeFoodDeficit(state: ColonyState): number {
  const pop = state.population;
  const totalLarvae = pop.larvae.reduce((a, b) => a + b, 0);
  const totalHive = pop.hiveBees.reduce((a, b) => a + b, 0);
  const totalForager = pop.foragers.reduce((a, b) => a + b, 0);
  const totalDrone = pop.drones.reduce((a, b) => a + b, 0);

  const required =
    totalLarvae * FOOD_CONSUMPTION.larvae +
    totalHive * FOOD_CONSUMPTION.hiveBee +
    totalForager * FOOD_CONSUMPTION.forager +
    totalDrone * FOOD_CONSUMPTION.drone;

  const accessible = Math.max(state.food - DEFAULT_CONFIG.foodInaccessible, 0);
  return Math.max(required - accessible, 0);
}

export function computeForagingIncome(
  state: ColonyState,
  config: SimulationConfig,
  dayOfYear: number,
  seasonal: SeasonalParams,
): number {
  if (!isSummer(dayOfYear, seasonal)) return 0;
  const totalForager = state.population.foragers.reduce((a, b) => a + b, 0);
  const totalHive = state.population.hiveBees.reduce((a, b) => a + b, 0);
  const processingCapacity = totalHive * config.foragingRate;
  const gatheringCapacity = totalForager * config.foragingRate;
  return Math.min(processingCapacity, gatheringCapacity);
}

export function stepSimulation(
  state: ColonyState,
  config: SimulationConfig,
  seasonal?: SeasonalParams,
): { state: ColonyState; snapshot: ColonySnapshot } {
  const s = seasonal ?? DEFAULT_SEASONAL;
  const { dt } = config;
  const { eggDays, larvaeDays, pupaeDays, foragerDays, droneDays } = LIFECYCLE;
  const pop = state.population;

  const sf = sigmoidSeasonal(state.dayOfYear, s);
  const summer = isSummer(state.dayOfYear, s);
  const layingRate = computeEggLayingRate(state, sf, config);

  const totalHive = pop.hiveBees.reduce((a, b) => a + b, 0);
  const nurseCount = Math.min(LIFECYCLE.hiveDays, 10);
  let nurseBees = 0;
  for (let j = 0; j < nurseCount; j++) {
    nurseBees += pop.hiveBees[j];
  }
  const totalLarvae = pop.larvae.reduce((a, b) => a + b, 0);

  const nurseRatio = totalLarvae > 0 ? nurseBees / totalLarvae : 1;
  const hiveForagerRatio = totalHive / Math.max(
    pop.foragers.reduce((a, b) => a + b, 0),
    1,
  );
  const larvaeSurvival = computeLarvaeSurvival(nurseRatio, hiveForagerRatio, config);
  const hiveSurvival = dailySurvival(summer ? config.hiveDeathRate : config.winterDeathRate);
  const eggSurvival = dailySurvival(DEATH_RATES.egg);
  const pupaeSurvival = dailySurvival(DEATH_RATES.pupae);

  const newEggs = createPopulation(eggDays);
  const newLarvae = createPopulation(larvaeDays);
  const newPupae = createPopulation(pupaeDays);
  const newHive = createPopulation(LIFECYCLE.hiveDays);
  const newForagers = createPopulation(foragerDays);
  const newDrones = createPopulation(droneDays);

  newEggs[0] = Math.max(0, pop.eggs[0] * (1 - dt) + layingRate * dt);
  for (let j = 1; j < eggDays; j++) {
    newEggs[j] = Math.max(0, pop.eggs[j] * (1 - dt) + pop.eggs[j - 1] * eggSurvival * dt);
  }

  newLarvae[0] = Math.max(0, pop.larvae[0] * (1 - dt) + pop.eggs[eggDays - 1] * eggSurvival * dt);
  for (let j = 1; j < larvaeDays; j++) {
    newLarvae[j] = Math.max(0, pop.larvae[j] * (1 - dt) + pop.larvae[j - 1] * larvaeSurvival * dt);
  }

  newPupae[0] = Math.max(0, pop.pupae[0] * (1 - dt) + pop.larvae[larvaeDays - 1] * larvaeSurvival * dt);
  for (let j = 1; j < pupaeDays; j++) {
    newPupae[j] = Math.max(0, pop.pupae[j] * (1 - dt) + pop.pupae[j - 1] * pupaeSurvival * dt);
  }

  newHive[0] = Math.max(0, pop.hiveBees[0] * (1 - dt) + pop.pupae[pupaeDays - 1] * pupaeSurvival * dt);
  for (let j = 1; j < LIFECYCLE.hiveDays; j++) {
    newHive[j] = Math.max(0, pop.hiveBees[j] * (1 - dt) + pop.hiveBees[j - 1] * hiveSurvival * dt);
  }

  const transferRate = computeSocialInhibitionRate(state, s, config);
  const transferring = Math.min(pop.hiveBees[LIFECYCLE.hiveDays - 1], transferRate * dt);

  newForagers[0] = Math.max(0, pop.foragers[0] * (1 - dt) + transferring);
  for (let j = 1; j < foragerDays; j++) {
    newForagers[j] = Math.max(
      0,
      pop.foragers[j] * (1 - dt) + pop.foragers[j - 1] * dailySurvival(config.foragerDeathRate) * dt,
    );
  }

  const percentDrone = summer ? 0.02 : 0;
  const droneTransferring = pop.hiveBees[LIFECYCLE.hiveDays - 1] * percentDrone * dt;
  newDrones[0] = Math.max(0, pop.drones[0] * (1 - dt) + droneTransferring);
  for (let j = 1; j < droneDays; j++) {
    newDrones[j] = Math.max(0, pop.drones[j] * (1 - dt) + pop.drones[j - 1] * dt);
  }

  const foragingIncome = computeForagingIncome(state, config, state.dayOfYear, s);
  const foodDeficit = computeFoodDeficit(state);
  const newFood = Math.max(0, state.food + (foragingIncome - foodDeficit) * dt);

  const newState: ColonyState = {
    population: {
      eggs: newEggs,
      larvae: newLarvae,
      pupae: newPupae,
      hiveBees: newHive,
      foragers: newForagers,
      drones: newDrones,
    },
    food: newFood,
    dayOfYear: (state.dayOfYear + dt) % 365,
    totalBees:
      newEggs.reduce((a, b) => a + b, 0) +
      newLarvae.reduce((a, b) => a + b, 0) +
      newPupae.reduce((a, b) => a + b, 0) +
      newHive.reduce((a, b) => a + b, 0) +
      newForagers.reduce((a, b) => a + b, 0) +
      newDrones.reduce((a, b) => a + b, 0),
    nurseBees,
  };

  const snapshot: ColonySnapshot = {
    day: Math.floor(state.dayOfYear),
    totalBees: newState.totalBees,
    eggs: newEggs.reduce((a, b) => a + b, 0),
    larvae: newLarvae.reduce((a, b) => a + b, 0),
    pupae: newPupae.reduce((a, b) => a + b, 0),
    hiveBees: newHive.reduce((a, b) => a + b, 0),
    foragers: newForagers.reduce((a, b) => a + b, 0),
    drones: newDrones.reduce((a, b) => a + b, 0),
    food: newFood,
    eggLayingRate: layingRate,
    isSummer: summer,
  };

  return { state: newState, snapshot };
}

function computeSocialInhibitionRate(
  state: ColonyState,
  _s: SeasonalParams,
  _config: SimulationConfig,
): number {
  const totalHive = state.population.hiveBees.reduce((a, b) => a + b, 0);
  const totalForager = state.population.foragers.reduce((a, b) => a + b, 0);
  const equilibriumRatio = DEFAULT_SOCIAL.hiveForagerRatio;
  const currentRatio = totalForager > 0 ? totalHive / totalForager : equilibriumRatio;

  if (currentRatio > equilibriumRatio) {
    return 0.1 * (1 - equilibriumRatio / currentRatio);
  }
  return 0.1 * (currentRatio / equilibriumRatio);
}

export interface SimulationResult {
  snapshots: ColonySnapshot[];
  finalState: ColonyState;
}

export function runSimulation(config?: Partial<SimulationConfig>): SimulationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let state = createInitialState(cfg);
  const snapshots: ColonySnapshot[] = [];
  const steps = Math.floor(cfg.simulationDays / cfg.dt);

  for (let i = 0; i < steps; i++) {
    const result = stepSimulation(state, cfg);
    state = result.state;
    if (i % Math.floor(1 / cfg.dt) === 0) {
      snapshots.push(result.snapshot);
    }
  }

  return { snapshots, finalState: state };
}
