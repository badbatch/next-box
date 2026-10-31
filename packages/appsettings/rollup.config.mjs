import config from '../../rollup.config.mjs';

const { input, output, ...rest } = config;

// rollup requires config to be default export
// eslint-disable-next-line import-x/no-default-export
export default [
  config,
  {
    ...rest,
    input: input.replace('index', 'cli/index'),
    output: {
      ...output,
      dir: `${output.dir}/cli`,
    },
  },
  {
    ...rest,
    input: input.replace('index', 'server'),
    output: {
      ...output,
      dir: `${output.dir}/server`,
    },
  },
];
