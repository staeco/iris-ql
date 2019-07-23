"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _pg = _interopRequireDefault(require("pg"));

var _pluralize = require("pluralize");

var _inflection = require("inflection");

var _aliases = _interopRequireDefault(require("./aliases"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// fix bugs with sequelize or node-pg
_pg.default.defaults.parseInt8 = true; // does bigint

_sequelize.default.useInflection({
  pluralize: _pluralize.plural,
  singularize: _pluralize.singular,
  underscore: _inflection.underscore
}); // See https://github.com/sequelize/sequelize/issues/1500


_sequelize.default.Validator.notNull = function (item) {
  return !this.isNull(item);
};

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: _aliases.default
};

var _default = (url, opt = {}) => {
  if (typeof url === 'object') {
    return new _sequelize.default(_objectSpread({}, defaultOptions, {}, url));
  }

  return new _sequelize.default(url, _objectSpread({}, defaultOptions, {}, opt));
};

exports.default = _default;
module.exports = exports.default;