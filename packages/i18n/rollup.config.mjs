import config from '../../rollup.config.mjs';

const { input, ...otherConfig } = config;

// rollup requires default export
// eslint-disable-next-line import-x/no-default-export
export default [
  config,
  {
    ...otherConfig,
    input: input.replace('index', 'client'),
  },
  {
    ...otherConfig,
    input: input.replace('index', 'macros'),
  },
];
