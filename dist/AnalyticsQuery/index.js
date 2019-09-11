"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lodash = require("lodash");

var _parse = _interopRequireDefault(require("./parse"));

var _export = _interopRequireDefault(require("../util/export"));

var _getTypes = _interopRequireDefault(require("../types/getTypes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      const types = (0, _getTypes.default)(agg.value, _objectSpread({}, this.options, {
        context: ['aggregations', idx]
      }));
      if (types.length === 0) return prev; // no types? weird

      const primaryType = types[0];
      const nv = {
        type: primaryType.type,
        name: agg.name,
        notes: agg.notes,
        measurement: primaryType.measurement
      };
      prev[agg.alias] = (0, _lodash.pickBy)(nv);
      return prev;
    }, {});

    this.execute = async () => this.options.model.findAll(_objectSpread({
      raw: true
    }, this.value()));

    this.executeStream = async ({
      format,
      transform
    } = {}) => (0, _export.default)({
      analytics: true,
      format,
      transform,
      model: this.options.model,
      value: this.value()
    });

    if (!obj) throw new Error('Missing value!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = AnalyticsQuery;
module.exports = exports.default;