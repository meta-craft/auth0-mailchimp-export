var Request = require('request-promise');
var Webpack = require('webpack');
var _       = require('lodash');
var path    = require('path');

module.exports = {    
  mode: 'production',
  entry: './webtask',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',    
    libraryTarget: 'commonjs2'
  },  
  externals: [
    'net',
    'fs',
    'tls',
    // Not provisioned via require
    'auth0-api-jwt-rsa-validation',
    'auth0-authz-rules-api',
    'auth0-oauth2-express',
    'auth0-sandbox-ext',
    'detective',
    'sandboxjs',
    'webtask-tools'
  ],
  resolve: {
    modules: ['node_modules'],    
    alias: {},
  },
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  }
};
