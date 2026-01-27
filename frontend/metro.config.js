// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure path alias resolution for Metro bundler
config.resolver.extraNodeModules = {
  '@': __dirname,
};

// Ensure Metro watches for changes in all relevant directories
config.watchFolders = [__dirname];

module.exports = config;
