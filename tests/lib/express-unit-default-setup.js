/* eslint-env jasmine */

'use strict';

var extend = require('../../lib/tools').extend;

module.exports = function expressUnitSetup(request) {
  return function(req, res, next) {
    req = extend(req, request || {});
    spyOn(res, 'json').andCallThrough();
    spyOn(res, 'status').andCallThrough();
    spyOn(res, 'location').andCallThrough();
    spyOn(res, 'set').andCallThrough();
    next();
  };
};
