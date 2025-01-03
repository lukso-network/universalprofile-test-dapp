const esModules = ['@lukso/lsp-smart-contracts', '@lukso/lsp-factory.js'].join(
  '|'
)

module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // Use your tsconfig.json
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-env.ts'],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
  verbose: true,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  globalSetup: './jest.setup.cjs',
  testTimeout: 10000,
}
