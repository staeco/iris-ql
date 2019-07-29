"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

var _sequelize = require("sequelize");

var _isValidCoordinate = require("../util/isValidCoordinate");

var _intersects = _interopRequireDefault(require("../util/intersects"));

var _errors = require("../errors");

var _date = _interopRequireDefault(require("../util/iffy/date"));

var _number = _interopRequireDefault(require("../util/iffy/number"));

var _stringArray = _interopRequireDefault(require("../util/iffy/stringArray"));

var _getScopedAttributes = _interopRequireDefault(require("../util/getScopedAttributes"));

var _Filter = _interopRequireDefault(require("../Filter"));

var _Ordering = _interopRequireDefault(require("../Ordering"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (query, opt = {}) => {
  const error = new _errors.ValidationError();
  const {
    table,
    context = []
  } = opt;
  const attrs = (0, _getScopedAttributes.default)(table);
  const initialFieldLimit = opt.fieldLimit || Object.keys(attrs); // options we pass on, default in fieldLimit

  const out = {
    where: [{} // very dumb fix for https://github.com/sequelize/sequelize/issues/10142
    ],
    order: [] // searching

  };

  function _ref(k) {
    return attrs[k].searchable;
  }

  if (query.search) {
    const searchable = initialFieldLimit.filter(_ref);
    const isSearchable = searchable.length !== 0;
    const isValid = typeof query.search === 'string';

    if (!isValid) {
      error.add({
        path: [...context, 'search'],
        value: query.search,
        message: 'Must be a string.'
      });
    }

    if (!isSearchable) {
      error.add({
        path: [...context, 'search'],
        value: query.search,
        message: 'Endpoint does not support search.'
      });
    }

    if (isValid && isSearchable) {
      const trimmed = query.search.trim();
      out.where.push({
        $or: searchable.map(f => ({
          [f]: {
            $iLike: `%${trimmed}%`
          }
        }))
      });
    }
  } // broad time ranges


  if (query.before) {
    try {
      const beforeVal = (0, _date.default)(query.before);
      out.where.push({
        $or: [{
          createdAt: {
            $lt: beforeVal
          }
        }, {
          updatedAt: {
            $lt: beforeVal
          }
        }]
      });
    } catch (err) {
      error.add({
        path: [...context, 'before'],
        value: query.before,
        message: 'Not a valid date!'
      });
    }
  }

  if (query.after) {
    try {
      const afterVal = (0, _date.default)(query.after);
      out.where.push({
        $or: [{
          createdAt: {
            $gt: afterVal
          }
        }, {
          updatedAt: {
            $gt: afterVal
          }
        }]
      });
    } catch (err) {
      error.add({
        path: [...context, 'after'],
        value: query.after,
        message: 'Not a valid date!'
      });
    }
  } // if they defined a geo bounding box


  if (query.within) {
    if (!(0, _isPureObject.default)(query.within)) {
      error.add({
        path: [...context, 'within'],
        value: query.within,
        message: 'Must be an object.'
      });
    } else {
      const {
        xmin,
        ymin,
        xmax,
        ymax
      } = query.within;
      const actualXMin = (0, _number.default)(xmin);
      const actualYMin = (0, _number.default)(ymin);
      const actualXMax = (0, _number.default)(xmax);
      const actualYMax = (0, _number.default)(ymax);
      const xminIssue = (0, _isValidCoordinate.lon)(actualXMin);
      const xmaxIssue = (0, _isValidCoordinate.lon)(actualXMax);
      const yminIssue = (0, _isValidCoordinate.lat)(actualYMin);
      const ymaxIssue = (0, _isValidCoordinate.lat)(actualYMax);

      if (xminIssue !== true) {
        error.add({
          path: [...context, 'within', 'xmin'],
          value: xmin,
          message: xminIssue
        });
      }

      if (yminIssue !== true) {
        error.add({
          path: [...context, 'within', 'ymin'],
          value: ymin,
          message: yminIssue
        });
      }

      if (xmaxIssue !== true) {
        error.add({
          path: [...context, 'within', 'xmax'],
          value: xmax,
          message: xmaxIssue
        });
      }

      if (ymaxIssue !== true) {
        error.add({
          path: [...context, 'within', 'ymax'],
          value: ymax,
          message: ymaxIssue
        });
      }

      const box = (0, _sequelize.fn)('ST_MakeEnvelope', actualXMin, actualYMin, actualXMax, actualYMax);
      out.where.push((0, _intersects.default)(box, {
        table
      }));
    }
  } // if they defined a point


  if (query.intersects) {
    if (!(0, _isPureObject.default)(query.intersects)) {
      error.add({
        path: [...context, 'intersects'],
        value: query.intersects,
        message: 'Must be an object.'
      });
    } else {
      const {
        x,
        y
      } = query.intersects;
      const actualX = (0, _number.default)(x);
      const actualY = (0, _number.default)(y);
      const latIssue = (0, _isValidCoordinate.lat)(actualY);
      const lonIssue = (0, _isValidCoordinate.lon)(actualX);

      if (lonIssue !== true) {
        error.add({
          path: [...context, 'intersects', 'x'],
          value: x,
          message: lonIssue
        });
      }

      if (latIssue !== true) {
        error.add({
          path: [...context, 'intersects', 'y'],
          value: y,
          message: latIssue
        });
      }

      out.where.push((0, _intersects.default)((0, _sequelize.fn)('ST_Point', actualX, actualY), {
        table
      }));
    }
  } // exclusions


  function _ref2(k, idx) {
    const [first] = k.split('.');

    if (!first || !attrs[first] || !initialFieldLimit.includes(first)) {
      error.add({
        path: [...context, 'exclusions', idx],
        value: k,
        message: 'Invalid exclusion.'
      });
      return null;
    }

    return k;
  }

  if (query.exclusions) {
    const parsed = (0, _stringArray.default)(query.exclusions).map(_ref2);
    if (parsed.length !== 0) out.attributes = {
      exclude: parsed
    };
  } // limit


  if (query.limit) {
    try {
      out.limit = (0, _number.default)(query.limit);
    } catch (err) {
      error.add({
        path: [...context, 'limit'],
        value: query.limit,
        message: 'Invalid limit.'
      });
    }
  } // offset


  if (typeof query.offset !== 'undefined') {
    try {
      out.offset = (0, _number.default)(query.offset);
    } catch (err) {
      error.add({
        path: [...context, 'offset'],
        value: query.offset,
        message: 'Invalid offset.'
      });
    }
  } // filterings


  if (query.filters) {
    if (!(0, _isPureObject.default)(query.filters) && !Array.isArray(query.filters)) {
      error.add({
        path: [...context, 'filters'],
        value: query.filters,
        message: 'Must be an object or array.'
      });
    } else {
      try {
        out.where.push(new _Filter.default(query.filters, _objectSpread({}, opt, {
          fieldLimit: initialFieldLimit,
          context: [...context, 'filters']
        })).value());
      } catch (err) {
        error.add(err);
      }
    }
  } // ordering


  function _ref3(v, idx) {
    try {
      out.order.push(new _Ordering.default(v, _objectSpread({}, opt, {
        fieldLimit: initialFieldLimit,
        context: [...context, 'orderings', idx]
      })).value());
    } catch (err) {
      error.add(err);
    }
  }

  if (query.orderings) {
    if (!Array.isArray(query.orderings)) {
      error.add({
        path: [...context, 'orderings'],
        value: query.orderings,
        message: 'Must be an array.'
      });
    } else {
      query.orderings.forEach(_ref3);
    }
  }

  if (!error.isEmpty()) throw error;
  return out;
};

exports.default = _default;
module.exports = exports.default;