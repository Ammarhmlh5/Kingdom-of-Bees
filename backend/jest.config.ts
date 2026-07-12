import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    rootDir: '.',
    testRegex: 'tests/.*\\.test\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^uuid$': '<rootDir>/src/__mocks__/uuid.ts',
    },
};

export default config;
