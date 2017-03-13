/* eslint-env jasmine */

'use strict';

var config = {
  SRV_NAME: 'tags',
  TAG_NAME_LENGTH: 6
};

var route = require('../controllers/tags/get')(config);

// loading dependencies
var mongoose = require('mongoose');
// mongoose.set('debug', true);
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var run = require('./lib/express-unit').run;
var setup = require('./lib/express-unit-default-setup');
var util = require('util');

// loading mocked data
var newTags = require('./data/data.json');

describe('tags-ms get handler', function() {
  var createdTags;

  beforeEach(function(done) {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        // Load model
        require('../models/tags')(config).then(function() {
          // Create some data
          mongoose.model('Tag').create(newTags, function(err, results) {
            createdTags = results;
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

  it('should get all tags', function(done) {

    var args = {
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      var tags = res.json.mostRecentCall.args[0];
      expect(util.isArray(tags)).toBe(true);
      expect(createdTags.length).toBe(tags.length);

      done();
    });
  });

  it('should get one tag', function(done) {

    var args = {
      params: {
        id: createdTags[0]._id.toString()
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      var tag = res.json.mostRecentCall.args[0];
      expect(util.isArray(tag)).toBe(false);
      expect(createdTags[0]._id.toString()).toEqual(tag._id.toString());

      done();
    });
  });

  it('should select one tag', function(done) {

    var args = {
      query: {
        'name': createdTags[0].name
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      var tags = res.json.mostRecentCall.args[0];
      expect(util.isArray(tags)).toBe(true);
      expect(tags.length).toBe(1);
      expect(createdTags[0]._id.toString()).toEqual(tags[0]._id.toString());

      done();
    });
  });

  it('should not select any tags', function(done) {

    var args = {
      query: {
        'name': 'unknown_tag'
      }
    };

    run(setup(args), route, function(err, req, res) {
      expect(err).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      var tags = res.json.mostRecentCall.args[0];
      expect(util.isArray(tags)).toBe(true);
      expect(tags.length).toBe(0);

      done();
    });
  });

});
