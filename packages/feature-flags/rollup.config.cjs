const config = require('../../rollup.config.cjs');

const { input, output, ...otherConfig } = config;

module.exports = [
  config,
  {
    ...otherConfig,
    input: input.replace('index', 'server'),
    output: {
      ...output,
      file: output.file.replace('index', 'server'),
    },
  },
];
