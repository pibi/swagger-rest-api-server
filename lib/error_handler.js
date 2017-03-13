'use strict';

var production = process.env.NODE_ENV === 'production';

// Modules loading
var statuses = require('statuses');

exports = module.exports = function(config) {
  return function apiErrorHandler(err, req, res, next) {

    var status = err.status || err.statusCode || res.statusCode || 500;
    if (status < 400) {
      status = 500;
    }

    var body = {
      status: status,
      message: err.message || statuses[status]
    };

    // add the stacktrace when not in production
    if (!production) {
      body.stack = err.stack;
    }

    // internal server errors
    if (status >= 500) {
      body.message = statuses[status]; // generic error message
    }

    res.status(status).json(body);
  };
};
