import { version } from './index';

describe('Disease Manager Library', () => {
  it('should export version', () => {
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  it('should have correct version format', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
