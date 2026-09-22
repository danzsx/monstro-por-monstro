module.exports = {
  preset: 'jest-expo', testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/learning/**/*.ts', 'src/diagnostic/**/*.ts', 'src/battle/machine.ts', 'src/data/outbox.ts'],
};
