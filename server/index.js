'use strict';

/**
 * This file setup the microservice Express APP server
 */

var config = require('../config/config');

// Models setup
var models = require('../models/')(config);

// Log setup
var debug = require('debug')(`${config.SRV_NAME}:server`);
var httpLogger = require('morgan');
httpLogger.token('prefix', function() {
  return `${config.SRV_NAME}:server`;
});
var devLogger = httpLogger(':prefix :method :url :status :response-time ms - :res[content-length]');
var combinedLogger = httpLogger(':prefix :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');

// Server app setup
var app = require('express')();

// Log configuration
if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') { // development and test specific
  app.use(devLogger);
} else {
  app.use(combinedLogger);
}

// Routes setup
app.use(require('../routes/')(config));

// final handler
app.use(require('../lib/error_handler')());

// App startup
if (!global.TESTING && config.NODE_ENV !== 'test') {
  app.listen(config.APP_PORT, config.APP_HOST, function() {
    debug(`Express server listening on ${config.APP_HOST}:${config.APP_PORT}`);
  });
}

// app is exported for testing purpose
exports = module.exports = app;
