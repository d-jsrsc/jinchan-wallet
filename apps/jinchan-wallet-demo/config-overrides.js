/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");

module.exports = function override(config, env) {
  config.resolve.fallback = {
    url: require.resolve("url"),
    fs: require.resolve("fs"),
    assert: require.resolve("assert"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),
  };
  config.resolve.alias = {
    "@mui/styled-engine": "@mui/styled-engine-sc",
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );
  // config.module.rules.unshift({
  //   test: /\.m?js$/,
  //   resolve: {
  //     fullySpecified: false, // disable the behavior
  //   },
  // });
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};
