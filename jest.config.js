const esModules = ["@lukso/lsp-smart-contracts"].join("|");

module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup-env.ts"],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
