/* eslint-env jasmine */

'use strict';

var config = {
  SRV_NAME: 'tags'
};

var route = require('../controllers/tags/put')(config);

// loading dependencies
var mongoose = require('mongoose');
// mongoose.set('debug', true);
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var run = require('./lib/express-unit').run;
var setup = require('./lib/express-unit-default-setup');
var util = require('util');


// loading mocked data
var newtags = require('./data/data.json');

describe('tags-ms put handler', function() {
  var createdtags;

  beforeEach(function(done) {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        // Load model
        require('../models/tags')(config).then(function() {
          // Create some data
          mongoose.model('Tag').create(newtags, function(err, results) {
            createdtags = results;
            done(err);
          });
        });
      });
    });
  });

  afterEach(function(done) {
    mockgoose.helper.reset().then(function() {
      mongoose.disconnect(function() {
          delete mongoose.models.Tag;
          done();
      });
    });
  });

  it('should update a tag', function(done) {

    var update = {
      description: 'new description'
    };

    var args = {
      params: {
        id: createdtags[0]._id.toString()
      },
      body: update
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(tag.description).toEqual(update.description);
      expect(tag._id.toString()).toEqual(createdtags[0]._id.toString());

      done();
    });
  });

  it('should not update a tag name if it already exists', function(done) {

    var update = {
      name: createdtags[1].name
    };

    var args = {
      params: {
        id: createdtags[0]._id.toString()
      },
      body: update
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();

      var error = res.json.mostRecentCall.args[0];
      expect(error.status).toEqual(500);
      expect(error.message).toBeDefined();

      done();
    });
  });
});
