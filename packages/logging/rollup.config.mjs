import config from '../../rollup.config.mjs';

const { input, ...otherConfig } = config;

// Rollup requires a default export.
// eslint-disable-next-line import-x/no-default-export
export default [
  config,
  ...['server', 'browser'].map(entry => ({
    ...otherConfig,
    input: input.replace('index', () => entry),
  })),
];
