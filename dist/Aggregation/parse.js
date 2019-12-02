"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _Filter = _interopRequireDefault(require("../Filter"));

var _errors = require("../errors");

var _aggregateWithFilter = _interopRequireDefault(require("../util/aggregateWithFilter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (a, opt) => {
  const {
    model,
    context = []
  } = opt;
  let agg, parsedFilters;
  const error = new _errors.ValidationError();

  if (!(0, _isPlainObj.default)(a)) {
    error.add({
      path: context,
      value: a,
      message: 'Must be an object.'
    });
    throw error; // dont even bother continuing
  }

  if (!a.alias) {
    error.add({
      path: [...context, 'alias'],
      value: a.alias,
      message: 'Missing alias!'
    });
  } else if (typeof a.alias !== 'string') {
    error.add({
      path: [...context, 'alias'],
      value: a.alias,
      message: 'Must be a string.'
    });
  }

  if (!a.value) {
    error.add({
      path: [...context, 'value'],
      value: a.value,
      message: 'Missing value!'
    });
    throw error; // dont even bother continuing
  }

  try {
    agg = new _QueryValue.default(a.value, _objectSpread({}, opt, {
      context: [...context, 'value']
    })).value();
  } catch (err) {
    error.add(err);
  }

  if (a.filters && !(0, _isPlainObj.default)(a.filters) && !Array.isArray(a.filters)) {
    error.add({
      path: [...context, 'filters'],
      value: a.filters,
      message: 'Must be an object or array.'
    });
  }

  try {
    parsedFilters = a.filters && new _Filter.default(a.filters, _objectSpread({}, opt, {
      context: [...context, 'filters']
    })).value();
  } catch (err) {
    error.add(err);
  }

  if (!error.isEmpty()) throw error;
  return [parsedFilters ? (0, _aggregateWithFilter.default)({
    aggregation: agg,
    filters: parsedFilters,
    model
  }) : agg, a.alias];
};

exports.default = _default;
module.exports = exports.default;