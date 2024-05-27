// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);


config.resolver = {
    ...config.resolver,
  // Add bin to assetExts
  assetExts: [...config.resolver.assetExts, 'bin'],
}

module.exports = config;

module.exports = config;
