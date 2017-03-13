'use strict';

/**
 * This file loads the microservice routes
 */

// Modules loading
var path = require('path');
var RefParser = require('json-schema-ref-parser');

exports = module.exports = function(config) {
  // this is the swagger file
  var SWAGGER_FILE = path.join(__dirname, `../swagger/api/${config.SRV_NAME}.yaml`);

  // Log setup
  var debug = require('debug')(`${config.SRV_NAME}:router`);

  // router creation
  var router = require('express')();

  // enable CORS for all request
  router.use(require('cors')());

  // Body parser
  router.use(require('body-parser').json({
    limit: '10mb'
  }));

  // loading paths definition from Swagger file
  var parser = new RefParser()
    .dereference(SWAGGER_FILE)
    .then(function(schema) {
      var swaggerize = require('swaggerize-express');

      // swaggerize matches the routes with the API definitions from Swagger and adds validation
      router.use(swaggerize({
        api: schema,
        docspath: `/apidocs/${config.SRV_NAME}`,

        handlers: {
          'tags': {
            $get: require('../controllers/tags/get')(config),
            $post: require('../controllers/tags/post')(config),
            '{id}': {
              $get: require('../controllers/tags/get')(config),
              $put: require('../controllers/tags/put')(config),
              $delete: require('../controllers/tags/delete')(config)
            },
            '{name}': {
              'identities': {
                $post: require('../controllers/tags/post_identities')(config),
              }
            }
          }
        }
      }));

    }).catch(function(error) {
      debug('Parser error:', error, error.stack || '');
    });

  return router;
};
