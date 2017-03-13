/* eslint no-invalid-this:0 */

'use strict';

/**
 * This file loads a model from a Swagger definition
 */

// Modules loading
var path = require('path');
var RefParser = require('json-schema-ref-parser');
var randString = require('../lib/tools').randString;

exports = module.exports = function(config) {
  // this is the swagger file that contains the model
  var SWAGGER_FILE = path.join(__dirname, `../swagger/api/${config.SRV_NAME}.yaml`);

  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:model:${config.SRV_NAME}`);

  var collection = {};

  // loading schema definition from Swagger file
  var parser = new RefParser()
    .bundle(SWAGGER_FILE)
    .then(function(schema) {

      var crypto = require('crypto');
      var mongoose = require('mongoose');
      var Tag;

      var swaggerMongoose = require('swaggering-mongoose');

      // schemas and modules compilation
      var definitions = swaggerMongoose.getDefinitions(schema);
      var TagProperties = definitions.Tag.properties;

      // custom properties here
      // name uses a special default, so we have to redefine it later
      delete TagProperties.name;

      var schemas = swaggerMongoose.getSchemas(definitions);
      var TagSchema = schemas.Tag;

      // name redefinition
      TagSchema.add({
        // the tag name
        name: {
          type: String,
          default: randString.bind(null, config.TAG_NAME_LENGTH),
          index: { unique: true }
        }
      });

      // createdAt, updatedAt timestamps
      TagSchema.set('timestamps', true);

      /**
       * Additional Mongoose Validations
       */

      TagSchema.path('name').validate(function(value, done) {
        Tag = Tag || mongoose.model('Tag');

        // Check if it already exists
        Tag.count({
          name: value
        }, function(err, count) {
          if (err) {
            return done(err);
          }

          // If `count` is greater than zero, 'invalidate'
          return done(count === 0);
        });
      }, 'The tag already exists');

      var models = collection.model = swaggerMongoose.getModels(schemas);

    }).catch(function(error) {
      debug('Parser error:', error);
    });

  // promisify
  collection.then = parser.then.bind(parser);
  collection.catch = parser.catch.bind(parser);
  return collection;

};
