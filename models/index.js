'use strict';

/**
 * This file loads the microservice models and setup the datatbase connection
 */

// Modules loading
var path = require('path');
var mongoose = require('mongoose');

exports = module.exports = function(config) {
  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:mongoose`);

  // debug configuration
  if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') { // development and test specific
    mongoose.set('debug', debug);
  }

  // Database connection
  mongoose.connect('mongodb://' + config.MONGODB_HOST + '/' + config.MONGODB_NAME);
  var connection = mongoose.connection;
  connection.on('error', function(error) {
    debug('Connection error:', error);
  });

  connection.once('open', function(error) {
    debug('Connection error:', error);
  });

  // Bootstrap mongodb models
  var collections = {};
  require('fs').readdirSync(path.join(__dirname, '/')).forEach(function(file) {
    var f = path.basename(file, '.js');
    if (f !== file && f !== 'index') {
      debug('loading model', f);
      collections[f] = require(path.join(__dirname, '/', file))(config);
    }
  });

  return collections;
};
