import type { Config } from 'jest';
import config from './jest.config';

const integrationConfig: Config = {
    ...config,
    testRegex: 'tests/integration/.*\\.test\\.ts$',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^uuid$': '<rootDir>/src/__mocks__/uuid.ts',
        '^nanoid$': '<rootDir>/src/__mocks__/nanoid.ts',
    },
};

export default integrationConfig;
