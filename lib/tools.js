'use strict';

/**
 * Just a collection of simple and useful functions
 */

// it does nothing
exports.noop = function() {};

// object mixin
exports.extend = function(destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      destination[k] = source[k];
    }
  }
  return destination;
};

// lowercase
exports.toLower = function(v) {
  return v.toLowerCase();
};

// Check for a valid BSON id
exports.isValidBSONId = function(id) {
  var regID = /[0-9a-z]{24}$/;
  return id && regID.test(id);
};

// Creates a pseudo-random string
exports.randString = function(x) {
  var s = [];
  while (x--) {
    var v = Math.random() < 0.5 ? 32 : 0;
    s[x] = String.fromCharCode(Math.round(Math.random() * ((122 - v) - (97 - v)) + (97 - v)));
  }
  return s.join('');
};
