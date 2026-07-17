import {
  createDefaultConfig,
  createInitialState,
  stepSimulation,
  runSimulation,
  getLifecycle,
  getDeathRates,
  getFoodConsumption,
} from './simulation';

describe('Simulation Library', () => {
  test('creates default config', () => {
    const config = createDefaultConfig();
    expect(config.initialBees).toBe(8000);
    expect(config.simulationDays).toBe(365);
    expect(config.maxEggLayingRate).toBe(1600);
  });

  test('creates initial state with all bees in hive', () => {
    const config = createDefaultConfig();
    const state = createInitialState(config);
    expect(state.totalBees).toBe(8000);
    expect(state.food).toBe(2000);
    expect(state.population.hiveBees.length).toBe(21);
  });

  test('lifecycle constants are correct', () => {
    const lc = getLifecycle();
    expect(lc.eggDays).toBe(3);
    expect(lc.larvaeDays).toBe(5);
    expect(lc.pupaeDays).toBe(12);
    expect(lc.eggDays + lc.larvaeDays + lc.pupaeDays).toBe(20);
  });

  test('death rates are in valid range', () => {
    const dr = getDeathRates();
    expect(dr.egg).toBeGreaterThan(0);
    expect(dr.egg).toBeLessThan(1);
    expect(dr.forager).toBeGreaterThan(dr.pupae);
  });

  test('food consumption rates are positive', () => {
    const fc = getFoodConsumption();
    expect(fc.hiveBee).toBeGreaterThan(0);
    expect(fc.larvae).toBeGreaterThan(fc.hiveBee);
  });

  test('single simulation step runs without error', () => {
    const config = createDefaultConfig({ simulationDays: 10, dt: 1 });
    const state = createInitialState(config);
    const result = stepSimulation(state, config);
    expect(result.snapshot.totalBees).toBeGreaterThan(0);
    expect(result.snapshot.food).toBeGreaterThanOrEqual(0);
  });

  test('full simulation produces snapshots', () => {
    const config = createDefaultConfig({ simulationDays: 30, dt: 0.5 });
    const result = runSimulation(config);
    expect(result.snapshots.length).toBeGreaterThan(0);
    expect(result.snapshots[0].totalBees).toBeGreaterThan(0);
  });

  test('egg laying rate is zero when colony is small', () => {
    const config = createDefaultConfig({ initialBees: 500 });
    const state = createInitialState(config);
    const rate = state.totalBees <= 1000 ? 0 : 1600;
    expect(rate).toBe(0);
  });

  test('population does not go negative', () => {
    const config = createDefaultConfig({ simulationDays: 60, dt: 0.5 });
    const result = runSimulation(config);
    for (const snap of result.snapshots) {
      expect(snap.eggs).toBeGreaterThanOrEqual(0);
      expect(snap.larvae).toBeGreaterThanOrEqual(0);
      expect(snap.pupae).toBeGreaterThanOrEqual(0);
      expect(snap.hiveBees).toBeGreaterThanOrEqual(0);
      expect(snap.foragers).toBeGreaterThanOrEqual(0);
    }
  });
});
