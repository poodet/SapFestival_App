// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for @ alias resolution
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = config;
