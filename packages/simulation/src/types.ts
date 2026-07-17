export interface BeePopulation {
  eggs: number[];
  larvae: number[];
  pupae: number[];
  hiveBees: number[];
  foragers: number[];
  drones: number[];
}

export interface ColonyState {
  population: BeePopulation;
  food: number;
  dayOfYear: number;
  totalBees: number;
  nurseBees: number;
}

export interface ColonySnapshot {
  day: number;
  totalBees: number;
  eggs: number;
  larvae: number;
  pupae: number;
  hiveBees: number;
  foragers: number;
  drones: number;
  food: number;
  eggLayingRate: number;
  isSummer: boolean;
}

export interface SimulationConfig {
  initialBees: number;
  simulationDays: number;
  dt: number;
  maxEggLayingRate: number;
  foragingRate: number;
  hiveDeathRate: number;
  foragerDeathRate: number;
  winterDeathRate: number;
  foodInaccessible: number;
  parasiteLoad: number;
}

export interface SeasonalParams {
  x1: number;
  x2: number;
  x3: number;
  x4: number;
  x5: number;
  summerBegin: number;
  summerEnd: number;
}

export interface SocialParams {
  hiveForagerRatio: number;
  nurseLarvaeRatio: number;
  maturationExponent: number;
}
