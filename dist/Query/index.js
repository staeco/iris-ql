"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

var _export = _interopRequireDefault(require("../util/export"));

var _getTypes = _interopRequireDefault(require("../types/getTypes"));

var _getScopedAttributes = _interopRequireDefault(require("../util/getScopedAttributes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Query {
  constructor(obj, options = {}) {
    this.update = fn => {
      if (typeof fn !== 'function') throw new Error('Missing update function!'); // update instance query

      const newInstanceValue = fn(this._parsed);
      if (!newInstanceValue || typeof newInstanceValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsed = newInstanceValue; // update non-instance query

      const newCollectionValue = fn(this._parsedCollection);
      if (!newCollectionValue || typeof newCollectionValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsedCollection = newCollectionValue;
      return this;
    };

    this.value = ({
      instanceQuery = true
    } = {}) => instanceQuery ? this._parsed : this._parsedCollection;

    this.toJSON = () => this.input;

    this.getOutputSchema = () => {
      const attrs = (0, _getScopedAttributes.default)(this.options.model);
      const fieldLimit = this.options.fieldLimit || Object.keys(attrs);
      return fieldLimit.reduce((acc, k) => {
        acc[k] = (0, _getTypes.default)({
          field: k
        }, this.options)[0];
        return acc;
      }, {});
    };

    this.execute = async ({
      raw = false
    } = {}) => {
      const fn = this.options.count !== false ? 'findAndCountAll' : 'findAll';
      return this.options.model[fn](_objectSpread({
        raw,
        logging: this.options.debug
      }, this.value()));
    };

    this.executeStream = async ({
      onError,
      format,
      tupleFraction,
      transform
    } = {}) => (0, _export.default)({
      tupleFraction,
      format,
      transform,
      onError,
      debug: this.options.debug,
      model: this.options.model,
      value: this.value()
    });

    this.count = async () => this.options.model.count(_objectSpread({
      logging: this.options.debug
    }, this.value()));

    this.destroy = async () => this.options.model.destroy(_objectSpread({
      logging: this.options.debug
    }, this.value({
      instanceQuery: false
    })));

    if (!obj) throw new Error('Missing query!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
    this._parsedCollection = (0, _parse.default)(obj, _objectSpread(_objectSpread({}, options), {}, {
      instanceQuery: false
    }));
  }

}

exports.default = Query;
module.exports = exports.default;