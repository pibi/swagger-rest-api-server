'use strict';

/**
 * this is an action for the microservice
 */

// Modules loading
var statuses = require('statuses');
var mongoose = require('mongoose');
var randString = require('../../lib/tools').randString;

var Tag = null;

exports = module.exports = function(config) {

  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:router:post`);

  return function(req, res) {
    Tag = Tag || mongoose.model('Tag');

    debug('Creating a new tag');

    // simple data validations
    // 0. check if body exists

    if (!req || !req.body || (Object.keys(req.body).length === 0 && req.body.constructor === Object)) {
      return res.status(400).json({
        message: 'Body is missing',
        status: 400
      });
    }

    var wasNameSupplied = (req.body.name) ? true : false;
    req.body.name = req.body.name || randString(config.TAG_NAME_LENGTH);
    var retries = config.TAG_NAME_RETRIES || 0;

    // this function checks if the tag already exists. if not, it creates it
    // if yes and wasNameSupplied is true, returns error
    // if yes and wasNameSupplied is false, it generate a new tag name and retries

    function createTag(tag) {
      Tag.update( {name: tag.name}, {$setOnInsert: tag}, {upsert: true, overwrite: false, runValidators: true}, function(err, updStats) {
        if (err && ( wasNameSupplied || !(err instanceof mongoose.Error.ValidationError) || retries === 0)) {
          debug('Error on creating', tag, ':', err);
          return res.status(500).json({
            message: err,
            status: 500
          });
        }
        debug('Tag creation stats:', updStats);
        if (updStats && updStats.n === 1 && updStats.nModified === 0) {
          return Tag.findOne({name: tag.name}).lean().exec(function(_err, _tag) {
            if (_err || !_tag) {
              return res.status(500).json({
                message: _err,
                status: 500
              });
            }
            return res.status(201).location('./' + _tag._id.toString()).json(_tag);
          });
        }
        if (wasNameSupplied) {
          return res.status(400).json({
            message: 'The tag already exists',
            status: 400
          });
        }
        tag.name = randString(config.TAG_NAME_LENGTH);
        retries--;
        // retry
        return createTag(tag);
      });
    }

    createTag(req.body);
  };
};


