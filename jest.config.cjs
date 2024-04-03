const esModules = ['@lukso/lsp-smart-contracts'].join('|')

module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-env.ts'],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  // modulePaths: ['<rootDir>'],
  verbose: true,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  globalSetup: './jest.setup.cjs',
}
