"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = require("sequelize");

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _parse = _interopRequireDefault(require("./parse"));

var _export = _interopRequireDefault(require("../util/export"));

var _toString = require("../util/toString");

var _runWithTimeout = _interopRequireDefault(require("../util/runWithTimeout"));

var _getMeta = _interopRequireDefault(require("../Aggregation/getMeta"));

var _Query = _interopRequireDefault(require("../Query"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isEmpty = s => !s || s.length === 0;

function _ref(acc, [k, mod]) {
  const idx = acc.findIndex(j => j.alias === k);
  if (idx === -1) throw new Error(`Join not found: ${k}`);
  if (mod.where && !Array.isArray(mod.where)) throw new Error(`Invalid where array on join update for ${k}!`);

  if (mod.where) {
    acc[idx] = { ...acc[idx],
      where: [...acc[idx].where, ...mod.where]
    };
  }

  return acc;
}

class AnalyticsQuery {
  constructor(obj, options = {}) {
    this.update = fn => {
      if ((0, _isPlainObj.default)(fn)) return this.update(v => ({ ...v,
        ...fn
      }));
      if (typeof fn !== 'function') throw new Error('Missing update function!');
      const newValue = fn(this._parsed);
      if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsed = newValue;
      return this;
    };

    this.constrain = ({
      defaultLimit,
      maxLimit,
      attributes,
      where,
      joins
    } = {}) => {
      if (where && !Array.isArray(where)) throw new Error('Invalid where array!');
      if (attributes && !Array.isArray(attributes)) throw new Error('Invalid attributes array!');
      return this.update(v => {
        const limit = v.limit || defaultLimit;
        const newJoins = joins ? Object.entries(joins).reduce(_ref, Array.from(v.joins)) : v.joins;
        return { ...v,
          attributes: attributes || v.attributes,
          where: where ? [...v.where, ...where] : v.where,
          limit: maxLimit ? limit ? Math.min(limit, maxLimit) : maxLimit : limit,
          joins: newJoins
        };
      });
    };

    this.value = () => this._parsed;

    this.toJSON = () => this.input;

    this.getOutputSchema = () => this.input.aggregations.reduce((prev, agg, idx) => {
      const meta = (0, _getMeta.default)(agg, { ...this.options,
        context: ['aggregations', idx]
      });
      if (!meta) return prev; // no types? weird

      prev[agg.alias] = meta;
      return prev;
    }, {});

    this.execute = async ({
      useMaster,
      debug,
      timeout
    } = {}) => {
      const exec = transaction => this.options.model.sequelize.query((0, _toString.select)({
        value: this.value(),
        model: this.options.model,
        analytics: true
      }), {
        useMaster,
        raw: true,
        type: _sequelize.QueryTypes.SELECT,
        logging: debug,
        model: this.options.model,
        transaction
      });

      if (!timeout) return exec();
      return (0, _runWithTimeout.default)(exec, {
        sequelize: this.options.model.sequelize,
        timeout
      });
    };

    this.executeStream = async ({
      onError,
      format,
      tupleFraction,
      transform,
      useMaster,
      timeout,
      finishTimeout,
      debug
    } = {}) => (0, _export.default)({
      analytics: true,
      timeout,
      finishTimeout,
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug: debug,
      model: this.options.model,
      value: this.value()
    });

    if (!obj) throw new Error('Missing value!');
    if (isEmpty(obj.aggregations) && isEmpty(obj.groupings)) return new _Query.default(obj, { ...options,
      count: false
    }); // skip the advanced stuff and kick it down a level

    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    if (options.fieldLimit && !Array.isArray(options.fieldLimit)) throw new Error('Invalid fieldLimit!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = AnalyticsQuery;
module.exports = exports.default;