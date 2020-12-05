"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

var _export = _interopRequireDefault(require("../util/export"));

var _getMeta = _interopRequireDefault(require("../Aggregation/getMeta"));

var _Query = _interopRequireDefault(require("../Query"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AnalyticsQuery {
  constructor(obj, options = {}) {
    this.update = fn => {
      if (typeof fn !== 'function') throw new Error('Missing update function!');
      const newValue = fn(this._parsed);
      if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsed = newValue;
      return this;
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

    this.execute = async () => this.options.model.findAll({
      raw: true,
      logging: this.options.debug,
      ...this.value()
    });

    this.executeStream = async ({
      onError,
      format,
      tupleFraction,
      transform
    } = {}) => (0, _export.default)({
      analytics: true,
      tupleFraction,
      format,
      transform,
      onError,
      debug: this.options.debug,
      model: this.options.model,
      value: this.value()
    });

    if (!obj) throw new Error('Missing value!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    if (!obj.aggregations && !obj.groupings) return new _Query.default(obj, { ...options,
      count: false
    }); // skip the advanced stuff and kick it down a level

    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = AnalyticsQuery;
module.exports = exports.default;