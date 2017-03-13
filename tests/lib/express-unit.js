'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpressUnitError = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.run = run;

var _es6Error = require('es6-error');

var _es6Error2 = _interopRequireDefault(_es6Error);

var _express = require('express');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Request = function Request() {
  return {
    __proto__: _express.request,
    app: {},
    body: {},
    query: {},
    route: {},
    params: {},
    headers: {},
    cookies: {},
    signedCookies: {}
  };
};

var Response = function Response() {
  return {
    __proto__: _express.response,
    app: {},
    locals: {}
  };
};

var chainables = ['status', 'vary', 'set', 'location'];

function run(setup, middleware, done) {

  setup = setup || function (req, res, next) {
    return next();
  };

  var req = Request();
  var res = Response();

  var err = null;
  var isDone = false;

  var finish = function finish() {
    var _err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    err = _err;
    isDone = true;
    isFunction(done) && done(err, req, res);
  };

  var _loop = function _loop(property) {
    if (isFunction(res[property])) {
      res[property] = function () {
        return (chainables.indexOf(property)!==-1) ? res : finish();
      };
    }
  };

  for (var property in res) {
    _loop(property);
  }

  var promise = void 0;

  setup(req, res, function () {
    var _err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    err = _err;
    promise = middleware.length <= 3 ? middleware(req, res, finish) : middleware(err, req, res, finish);
  });

  if (!isPromise(promise)) return;

  return promise.then(function () {
    if (isDone || !isFunction(done)) return [err, req, res];
    try {
      done(err, req, res);
    } catch (err) {
      throw new ExpressUnitError(null, err);
    }
  }).catch(function (err) {
    if (err instanceof ExpressUnitError) throw err.err;
    throw new ExpressUnitError('Unhandled rejection in middleware', err);
  });
}

var ExpressUnitError = exports.ExpressUnitError = function (_Error) {
  _inherits(ExpressUnitError, _Error);

  function ExpressUnitError(message, err) {
    _classCallCheck(this, ExpressUnitError);

    var _this = _possibleConstructorReturn(this, (ExpressUnitError.__proto__ || Object.getPrototypeOf(ExpressUnitError)).call(this, message));

    _this.err = err;
    return _this;
  }

  _createClass(ExpressUnitError, [{
    key: 'toString',
    value: function toString() {
      var name = this.name,
          message = this.message,
          err = this.err;

      return name + ': ' + message + '\n' + JSON.stringify(err, null, 2);
    }
  }]);

  return ExpressUnitError;
}(_es6Error2.default);

function isFunction(value) {
  return typeof value === 'function';
}

function isPromise(value) {
  return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && isFunction(value.then);
}
