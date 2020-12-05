"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _Filter = _interopRequireDefault(require("../Filter"));

var _errors = require("../errors");

var _aggregateWithFilter = _interopRequireDefault(require("../util/aggregateWithFilter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (a, opt) => {
  const {
    model,
    context = [],
    instanceQuery
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
    agg = new _QueryValue.default(a.value, { ...opt,
      context: [...context, 'value']
    }).value();
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
    parsedFilters = a.filters && new _Filter.default(a.filters, { ...opt,
      context: [...context, 'filters']
    }).value();
  } catch (err) {
    error.add(err);
  }

  if (!error.isEmpty()) throw error;
  return [parsedFilters ? (0, _aggregateWithFilter.default)({
    aggregation: agg,
    filters: parsedFilters,
    model,
    instanceQuery
  }) : agg, a.alias];
};

exports.default = _default;
module.exports = exports.default;