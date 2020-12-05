"use strict";

exports.__esModule = true;
exports.default = void 0;

var _Query = _interopRequireDefault(require("../Query"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _Aggregation = _interopRequireDefault(require("../Aggregation"));

var _errors = require("../errors");

var functions = _interopRequireWildcard(require("../types/functions"));

var _search = _interopRequireDefault(require("../util/search"));

var _getModelFieldLimit = _interopRequireDefault(require("../util/getModelFieldLimit"));

var _parseTimeOptions = _interopRequireDefault(require("../util/parseTimeOptions"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const aggregateFunctions = Object.entries(functions).reduce((acc, [k, v]) => {
  if (v.aggregate) acc.push(k);
  return acc;
}, []); // this is an extension of parseQuery that allows for aggregations and groupings

function _ref2(i) {
  return {
    type: 'aggregation',
    field: i.alias,
    value: i.value
  };
}

function _ref4(k, v) {
  return typeof v?.function === 'string' && aggregateFunctions.includes(v.function);
}

var _default = (query = {}, opt) => {
  const {
    model,
    context = []
  } = opt;
  const error = new _errors.ValidationError();
  let attrs = [];
  const initialFieldLimit = opt.fieldLimit || (0, _getModelFieldLimit.default)(model); // if user specified time settins, tack them onto options from the query so downstream knows about it

  try {
    opt = { ...opt,
      ...(0, _parseTimeOptions.default)(query, opt)
    };
  } catch (err) {
    error.add(err);
  }

  function _ref(a, idx) {
    try {
      return new _Aggregation.default(a, { ...opt,
        fieldLimit: initialFieldLimit,
        context: [...context, 'aggregations', idx]
      }).value();
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

  if (!error.isEmpty()) throw error;
  const aggFieldLimit = query.aggregations.map(_ref2);
  const fieldLimit = initialFieldLimit.concat(aggFieldLimit);
  const nopt = { ...opt,
    fieldLimit
  };
  let out = {};

  try {
    out = new _Query.default(query, nopt).value();
  } catch (err) {
    error.add(err);
  }

  function _ref3(i, idx) {
    try {
      return new _QueryValue.default(i, { ...nopt,
        context: [...context, 'groupings', idx]
      }).value();
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
      out.group = query.groupings.map(_ref3);
    }
  }

  if (!error.isEmpty()) throw error; // validate each aggregation and ensure it is either used in groupings, or contains an aggregate function

  query.aggregations.forEach((agg, idx) => {
    const hasAggregateFunction = (0, _search.default)(agg.value, _ref4);
    if (hasAggregateFunction) return; // valid

    const matchedGrouping = (0, _search.default)(query.groupings, (k, v) => typeof v?.field === 'string' && v.field === agg.alias);
    if (matchedGrouping) return; // valid

    error.add({
      path: [...context, 'aggregations', idx, 'value'],
      value: agg.value,
      message: 'Must contain an aggregation.'
    });
  }); // validate each aggregation is unique

  query.aggregations.reduce((seen, agg, idx) => {
    if (seen.includes(agg.alias)) {
      error.add({
        path: [...context, 'aggregations', idx, 'alias'],
        value: agg.alias,
        message: 'Duplicate aggregation.'
      });
    } else {
      seen.push(agg.alias);
    }

    return seen;
  }, []);
  if (!error.isEmpty()) throw error;
  out.attributes = attrs;
  return out;
};

exports.default = _default;
module.exports = exports.default;