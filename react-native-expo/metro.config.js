const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// iconv-lite (lyrics GBK decode) needs Node built-ins that RN does not ship.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  string_decoder: require.resolve('string_decoder'),
  buffer: require.resolve('buffer'),
};

module.exports = config;
