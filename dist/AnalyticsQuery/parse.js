"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

var _Query = _interopRequireDefault(require("./Query"));

var _QueryValue = _interopRequireDefault(require("./QueryValue"));

var _Filter = _interopRequireDefault(require("./Filter"));

var _errors = require("../errors");

var _aggregateWithFilter = _interopRequireDefault(require("../util/aggregateWithFilter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// this is an extension of parseQuery that allows for aggregations and groupings
var _default = (query = {}, opt) => {
  const {
    table
  } = opt;
  if (!table) throw new _errors.BadRequestError('Not a valid table');
  const errors = [];
  let attrs;
  const initialFieldLimit = Object.keys(table.rawAttributes); // if user specified a timezone, tack it on so downstream stuff in types/query knows about it

  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      errors.push({
        path: ['timezone'],
        value: query.timezone,
        message: 'Must be a string.'
      });
    } else {
      opt.timezone = query.timezone;
      delete query.timezone;
    }
  }

  if (!Array.isArray(query.aggregations)) {
    errors.push({
      path: ['aggregations'],
      value: query.aggregations,
      message: 'Must be an array.'
    });
  } else {
    attrs = query.aggregations.map((a, idx) => {
      if (!(0, _isPureObject.default)(a)) {
        errors.push({
          path: ['aggregations', idx],
          value: a,
          message: 'Must be an object.'
        });
        return null;
      }

      if (!a.alias) {
        errors.push({
          path: ['aggregations', idx, 'alias'],
          value: a.alias,
          message: 'Missing alias!'
        });
        return null;
      } else if (typeof a.alias !== 'string') {
        errors.push({
          path: ['aggregations', idx, 'alias'],
          value: a.alias,
          message: 'Must be a string.'
        });
      }

      if (!a.value) {
        errors.push({
          path: ['aggregations', idx, 'value'],
          value: a.value,
          message: 'Missing value!'
        });
        return null;
      }

      if (a.filters && !(0, _isPureObject.default)(a.filters) && !Array.isArray(a.filters)) {
        errors.push({
          path: ['aggregations', idx, 'filters'],
          value: a.filters,
          message: 'Must be an object or array.'
        });
      }

      let agg, parsedFilters;

      try {
        agg = new _QueryValue.default(a.value, opt).value();
      } catch (err) {
        errors.push({
          path: ['aggregations', idx, 'value'],
          value: a.value,
          message: err.message
        });
      }

      try {
        parsedFilters = a.filters && new _Filter.default(a.filters, opt).value();
      } catch (err) {
        errors.push({
          path: ['aggregations', idx, 'filters'],
          value: a.filters,
          message: err.message
        });
      }

      if (!agg) return null;
      return [parsedFilters ? (0, _aggregateWithFilter.default)({
        aggregation: agg,
        filters: parsedFilters,
        table
      }) : agg, a.alias];
    });
  }

  if (errors.length !== 0) throw new _errors.ValidationError(errors); // bail before going further if basics failed

  const fieldLimit = initialFieldLimit.concat(attrs.map(i => i[1]));

  const nopt = _objectSpread({}, opt, {
    fieldLimit
  });

  const out = new _Query.default(query, nopt).value();

  if (query.groupings) {
    if (!Array.isArray(query.groupings)) {
      errors.push({
        path: ['groupings'],
        value: query.groupings,
        message: 'Must be an array.'
      });
    } else {
      out.group = query.groupings.map((i, idx) => {
        try {
          return new _QueryValue.default(i, nopt).value();
        } catch (err) {
          errors.push({
            path: ['groupings', idx],
            value: i,
            message: err.message
          });
          return null;
        }
      });
    }
  }

  out.attributes = attrs;
  if (errors.length !== 0) throw new _errors.ValidationError(errors);
  return out;
};

exports.default = _default;
module.exports = exports.default;