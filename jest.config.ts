import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)', '!**/__tests__/testUtils.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/testUtils.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 50,
      statements: 50,
    },
    './src/lib': {
      branches: 85,
      functions: 95,
      lines: 90,
      statements: 90,
    },
    './src/app/api': {
      branches: 70,
      functions: 85,
      lines: 75,
      statements: 75,
    },
  },
}

export default config
