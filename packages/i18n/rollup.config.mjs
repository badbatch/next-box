import config from '../../rollup.config.mjs';

const { input, output, ...otherConfig } = config;

// rollup requires default export
// eslint-disable-next-line import-x/no-default-export
export default [
  config,
  {
    ...otherConfig,
    input: input.replace('index', 'client'),
    output: {
      ...output,
      file: output.file.replace('index', 'client'),
    },
  },
  {
    ...otherConfig,
    input: input.replace('index', 'macros'),
    output: {
      ...output,
      file: output.file.replace('index', 'macros'),
    },
  },
];
