import jestConfig from '@repodog/jest-config';
import swcConfig from '@repodog/swc-config';

const { DEBUG } = process.env;
const isDebug = DEBUG === 'true';
const config = jestConfig({ compilerOptions: swcConfig });

// Required by Jest
// eslint-disable-next-line import-x/no-default-export
export default {
  ...config,
  collectCoverageFrom: ['packages/**/*.ts', ...config.collectCoverageFrom.slice(1)],
  ...(!isDebug && { testMatch: ['**/src/**/*.test.{ts,tsx}'] }),
};
