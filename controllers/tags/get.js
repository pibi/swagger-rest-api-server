'use strict';

/**
 * this is a microservice action
 */

var mongoose = require('mongoose');

var Tag = null;

exports = module.exports = function(config) {

  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:router:get`);

  return function(req, res) {
    Tag = Tag || mongoose.model('Tag');

    req.params = req.params || {};
    debug((req.params.id) ? `Get a tag by ID ${req.params.id}` : req.query && `Query tags by ${require('util').inspect(req.query)}` || '');

    // look for /resources/id or /resources/ or /resources/?key=value
    var query = (req.params.id) ? Tag.findById(req.params.id) : Tag.find(req.query);

    query.lean().exec(function(err, result) {
      if (err) {
        res.status(500).json({
          message: err,
          status: 500
        });
      } else {
        res.status(200).json(result);
      }
    });
  };
};
