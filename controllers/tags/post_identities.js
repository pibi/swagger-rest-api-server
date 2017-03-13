'use strict';

/**
 * this is an action for the microservice
 */

// Modules loading
var statuses = require('statuses');
var mongoose = require('mongoose');
var randString = require('../../lib/tools').randString;

var Tag = null;

var INVALID_REQUEST = {
  status: 400,
  message: statuses[400]
};

var ACCEPTED = {
  status: 202,
  message: statuses[202]
};

exports = module.exports = function(config) {

  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:router:post:identities`);

  return function(req, res) {
    Tag = Tag || mongoose.model('Tag');

    req.params = req.params || {};
    debug('Adding a new identity to the tag', req.params.name);

    // simple data validations
    // 0. check if body exists
    if (!req || !req.body) {
      return res.status(400).json({
        message: 'Body is missing',
        status: 400
      });
    }
    // 1. check if name exists
    if (!req.params || !req.params.name) {
      return res.status(400).json({
        message: 'Name is missing',
        status: 400
      });
    }
    // 2. body should have an identityID
    if (!req.body.identityID) {
      return res.status(400).json({
        message: 'The identity ID is required',
        status: 400
      });
    }

    req.body.createdAt = req.body.createdAt || Date.now();

    Tag.findOne({name: req.params.name}, function(err, doc) {
      if (err) {
        return res.status(500).json({
          message: err,
          status: 500
        });
      }
      if (!doc) {
        return res.status(400).json(INVALID_REQUEST);
      }
      doc.update({$push: {'identities': req.body}}, {runValidators: true}, function(_err, updStats) {
        if (_err) {
          return res.status(500).json({
            message: _err,
            status: 500
          });
        }
        res.status(202).json(ACCEPTED);
      });
    });

  };
};


