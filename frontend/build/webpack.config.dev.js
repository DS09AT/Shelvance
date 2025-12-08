/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const baseConfig = require('./webpack.config.js');

module.exports = (env) => {
  const config = baseConfig(env);

  config.cache = {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    },
    cacheDirectory: path.resolve(__dirname, '../../node_modules/.cache/webpack')
  };

  config.devtool = 'eval-cheap-module-source-map';

  if (process.env.SKIP_TYPE_CHECK === 'true') {
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );
  }

  config.module.rules.forEach((rule) => {
    if (rule.use && Array.isArray(rule.use)) {
      rule.use.forEach((loader) => {
        if (loader.loader === 'babel-loader') {
          loader.options = loader.options || {};
          loader.options.cacheDirectory = true;
          loader.options.cacheCompression = false;
        }
      });
    }
  });

  return config;
};
