"use strict";

exports.__esModule = true;
exports.default = void 0;

var _Query = _interopRequireDefault(require("../Query"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _Aggregation = _interopRequireDefault(require("../Aggregation"));

var _errors = require("../errors");

var _getScopedAttributes = _interopRequireDefault(require("../util/getScopedAttributes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _ref2(i) {
  return !!i;
}

function _ref3(i) {
  return i[1];
}

// this is an extension of parseQuery that allows for aggregations and groupings
var _default = (query = {}, opt) => {
  const {
    table,
    context = []
  } = opt;
  const error = new _errors.ValidationError();
  let attrs = [];
  const initialFieldLimit = opt.fieldLimit || Object.keys((0, _getScopedAttributes.default)(table)); // if user specified a timezone, tack it on so downstream stuff in types/query knows about it

  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      error.add({
        path: [...context, 'timezone'],
        value: query.timezone,
        message: 'Must be a string.'
      });
    } else {
      opt.timezone = query.timezone;
      delete query.timezone;
    }
  }

  function _ref(a, idx) {
    try {
      return new _Aggregation.default(a, _objectSpread({}, opt, {
        fieldLimit: initialFieldLimit,
        context: [...context, 'aggregations', idx]
      })).value();
    } catch (err) {
      error.add(err);
      return null;
    }
  }

  if (!Array.isArray(query.aggregations)) {
    error.add({
      path: [...context, 'aggregations'],
      value: query.aggregations,
      message: 'Must be an array.'
    });
  } else {
    if (query.aggregations.length === 0) {
      error.add({
        path: [...context, 'aggregations'],
        value: query.aggregations,
        message: 'Must have at least one aggregation.'
      });
    }

    attrs = query.aggregations.map(_ref);
  }

  const fieldLimit = initialFieldLimit.concat(attrs.filter(_ref2).map(_ref3));

  const nopt = _objectSpread({}, opt, {
    fieldLimit
  });

  let out = {};

  try {
    out = new _Query.default(query, nopt).value();
  } catch (err) {
    error.add(err);
  }

  function _ref4(i, idx) {
    try {
      return new _QueryValue.default(i, _objectSpread({}, nopt, {
        context: [...context, 'groupings', idx]
      })).value();
    } catch (err) {
      error.add(err);
      return null;
    }
  }

  if (query.groupings) {
    if (!Array.isArray(query.groupings)) {
      error.add({
        path: [...context, 'groupings'],
        value: query.groupings,
        message: 'Must be an array.'
      });
    } else {
      out.group = query.groupings.map(_ref4);
    }
  }

  if (!error.isEmpty()) throw error;
  out.attributes = attrs;
  return out;
};

exports.default = _default;
module.exports = exports.default;