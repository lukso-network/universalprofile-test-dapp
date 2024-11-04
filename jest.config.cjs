const esModules = [
  '@lukso/lsp-smart-contracts',
  '@lukso/lsp-factory.js',
  '@web3-onboard',
  'nanoid',
  '@lukso/web3-onboard-config',
  '@tsndr/cloudflare-worker-jwt',
].join('|')

module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // Use your tsconfig.json
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-env.ts'],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))`],
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
