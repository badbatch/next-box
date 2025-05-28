const jestConfig = require('@repodog/jest-config');
const swcConfig = require('@repodog/swc-config');

const { DEBUG } = process.env;
const isDebug = DEBUG === 'true';
const config = jestConfig({ compilerOptions: swcConfig });

module.exports = {
  ...config,
  collectCoverageFrom: ['packages/**/*.ts', ...config.collectCoverageFrom.slice(1)],
  ...(isDebug ? {} : { testMatch: ['**/src/**/*.test.{ts,tsx}'] }),
};
