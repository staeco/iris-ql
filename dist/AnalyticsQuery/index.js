"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

async function _ref() {// TODO
}

class AnalyticsQuery {
  constructor(obj, options = {}) {
    this.update = fn => {
      if (typeof fn !== 'function') throw new Error('Missing update function!');
      const newValue = fn(this.parsed);
      if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this.parsed = newValue;
      return this;
    };

    this.value = () => this.parsed;

    this.toJSON = () => this.input;

    this.execute = async () => this.options.table.findAll(_objectSpread({
      raw: true
    }, this.parsed));

    this.executeStream = _ref;
    if (!obj) throw new Error('Missing value!');
    if (!options.table) throw new Error('Missing table!');
    this.input = obj;
    this.options = options;
    this.parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = AnalyticsQuery;
module.exports = exports.default;