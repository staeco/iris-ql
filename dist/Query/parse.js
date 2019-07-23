"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

var _sequelize = require("sequelize");

var _isValidCoordinate = require("../util/isValidCoordinate");

var _intersects = _interopRequireDefault(require("../util/intersects"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { forEach } from 'lodash'
//import parseQueryValue from './parseQueryValue'
//import parseFilter from './parseFilter'
// for string array query params we support explicit arrays or split by commas
const parseStringArray = v => {
  if (v == null) return []; // nada

  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',');
  return [String(v)];
};

const parseIffyNumber = v => {
  if (typeof v === 'number') return v;
  if (v == null || !v) return;

  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (isNaN(n)) throw new Error('Bad number value');
    return n;
  }

  throw new Error('Bad number value');
};

const parseIffyDate = v => {
  if (v == null || !v) return;
  const d = new Date(v);
  if (isNaN(d)) throw new Error('Bad date value');
  return d;
};

var _default = (query, opt) => {
  const errors = [];
  const {
    table
  } = opt; // options we pass on, default in fieldLimit

  const attrs = table.rawAttributes;
  /*const popt = {
    ...opt,
    fieldLimit: opt.fieldLimit || Object.keys(attrs)
  }*/

  const out = {
    where: [{} // very dumb fix for https://github.com/sequelize/sequelize/issues/10142
    ],
    order: [] // searching

  };

  if (query.search) {
    const searchable = Object.keys(attrs).filter(k => attrs[k].searchable);
    const isSearchable = searchable.length !== 0;
    const isValid = typeof query.search === 'string';

    if (!isValid) {
      errors.push({
        path: ['search'],
        value: query.search,
        message: 'Must be a string.'
      });
    }

    if (!isSearchable) {
      errors.push({
        path: ['search'],
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
      const beforeVal = parseIffyDate(query.before);
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
      errors.push({
        path: ['before'],
        value: query.before,
        message: 'Not a valid date!'
      });
    }
  }

  if (query.after) {
    try {
      const afterVal = parseIffyDate(query.after);
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
      errors.push({
        path: ['after'],
        value: query.after,
        message: 'Not a valid date!'
      });
    }
  } // filterings

  /*
  if (query.filters) {
    if (typeof query.filters !== 'object') {
      errors.push({
        path: [ 'filters' ],
        value: query.filters,
        message: 'Must be an object or array.'
      })
    } else {
      out.where.push(parseFilter(query.filters, popt))
    }
  }
  */
  // if they defined a geo bounding box


  if (query.within) {
    if (!(0, _isPureObject.default)(query.within)) {
      errors.push({
        path: ['within'],
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
      const actualXMin = parseIffyNumber(xmin);
      const actualYMin = parseIffyNumber(ymin);
      const actualXMax = parseIffyNumber(xmax);
      const actualYMax = parseIffyNumber(ymax);
      const xminIssue = (0, _isValidCoordinate.lon)(actualXMin);
      const xmaxIssue = (0, _isValidCoordinate.lon)(actualXMax);
      const yminIssue = (0, _isValidCoordinate.lat)(actualYMin);
      const ymaxIssue = (0, _isValidCoordinate.lat)(actualYMax);

      if (xminIssue !== true) {
        errors.push({
          path: ['within', 'xmin'],
          value: xmin,
          message: xminIssue
        });
      }

      if (yminIssue !== true) {
        errors.push({
          path: ['within', 'ymin'],
          value: ymin,
          message: yminIssue
        });
      }

      if (xmaxIssue !== true) {
        errors.push({
          path: ['within', 'xmax'],
          value: xmax,
          message: xmaxIssue
        });
      }

      if (ymaxIssue !== true) {
        errors.push({
          path: ['within', 'ymax'],
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
      errors.push({
        path: ['intersects'],
        value: query.intersects,
        message: 'Must be an object.'
      });
    } else {
      const {
        x,
        y
      } = query.intersects;
      const actualX = parseIffyNumber(x);
      const actualY = parseIffyNumber(y);
      const latIssue = (0, _isValidCoordinate.lat)(actualY);
      const lonIssue = (0, _isValidCoordinate.lon)(actualX);

      if (lonIssue !== true) {
        errors.push({
          path: ['intersects', 'x'],
          value: x,
          message: lonIssue
        });
      }

      if (latIssue !== true) {
        errors.push({
          path: ['intersects', 'y'],
          value: y,
          message: latIssue
        });
      }

      out.where.push((0, _intersects.default)((0, _sequelize.fn)('ST_Point', actualX, actualY), {
        table
      }));
    }
  } // ordering

  /*
  if (query.orderings) {
    if (!Array.isArray(query.orderings)) {
      errors.push({
        path: [ 'orderings' ],
        value: query.orderings,
        message: 'Must be an array.'
      })
    } else {
      forEach(query.orderings, ({ value, direction }={}, idx) => {
        const isDirectionValid = direction === 'asc' || direction === 'desc'
        if (!value) {
          errors.push({
            path: [ 'orderings', idx, 'value' ],
            value,
            message: 'Missing ordering value.'
          })
        }
        if (!direction) {
          errors.push({
            path: [ 'orderings', idx, 'direction' ],
            value: direction,
            message: 'Missing ordering direction.'
          })
        }
        if (!isDirectionValid) {
          errors.push({
            path: [ 'orderings', idx, 'direction' ],
            value: direction,
            message: 'Invalid ordering direction - must be asc or desc.'
          })
        }
         if (direction && value && isDirectionValid) {
          try {
            out.order.push([ parseQueryValue(value, popt), direction ])
          } catch (err) {
            errors.push({
              path: [ 'orderings', idx, 'value' ],
              value,
              message: err.message
            })
          }
        }
      })
    }
  }
  */
  // exclusions


  if (query.exclusions) {
    const parsed = parseStringArray(query.exclusions).map((k, idx) => {
      const [first] = k.split('.');

      if (!first || !attrs[first]) {
        errors.push({
          path: ['exclusions', idx],
          value: k,
          message: 'Invalid exclusion.'
        });
        return null;
      }

      return k;
    });
    out.attributes = {
      exclude: parsed
    };
  }

  if (query.limit) {
    try {
      out.limit = parseIffyNumber(query.limit);
    } catch (err) {
      errors.push({
        path: ['limit'],
        value: query.limit,
        message: 'Invalid limit.'
      });
    }
  }

  if (query.offset) {
    try {
      out.offset = parseIffyNumber(query.offset);
    } catch (err) {
      errors.push({
        path: ['offset'],
        value: query.offset,
        message: 'Invalid offset.'
      });
    }
  }

  if (errors.length !== 0) throw new _errors.ValidationError(errors);
  return out;
};

exports.default = _default;
module.exports = exports.default;