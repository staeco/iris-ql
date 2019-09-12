"use strict";

exports.__esModule = true;
exports.default = void 0;

var _pg = _interopRequireDefault(require("pg"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _pluralize = require("pluralize");

var _inflection = require("inflection");

var _operators = _interopRequireDefault(require("./operators"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: _operators.default
};

function _ref(item) {
  return !this.isNull(item);
}

var _default = (url, opt = {}) => {
  // fix issues with pg types
  _pg.default.types.setTypeParser(20, 'text', _pg.default.types.getTypeParser(23, 'text')); // bigint = int


  _pg.default.types.setTypeParser(1016, 'text', _pg.default.types.getTypeParser(1007, 'text')); // bigint[] = int[]


  _pg.default.types.setTypeParser(1700, 'text', _pg.default.types.getTypeParser(701, 'text')); // numeric = float8


  _pg.default.types.setTypeParser(1231, 'text', _pg.default.types.getTypeParser(1022, 'text')); // numeric[] = float8[]
  // fix bugs with sequelize


  _sequelize.default.useInflection({
    pluralize: _pluralize.plural,
    singularize: _pluralize.singular,
    underscore: _inflection.underscore
  }); // See https://github.com/sequelize/sequelize/issues/1500


  _sequelize.default.Validator.notNull = _ref;
  const conn = typeof url === 'object' ? new _sequelize.default(_objectSpread({}, defaultOptions, {}, url)) : new _sequelize.default(url, _objectSpread({}, defaultOptions, {}, opt)); // fix sequelize types overriding pg-types

  const override = () => {
    conn.connectionManager.oidParserMap.set(20, _pg.default.types.getTypeParser(20, 'text')); // bigint

    conn.connectionManager.oidParserMap.set(1016, _pg.default.types.getTypeParser(1016, 'text')); // bigint[]

    conn.connectionManager.oidParserMap.set(1700, _pg.default.types.getTypeParser(1700, 'text')); // numeric

    conn.connectionManager.oidParserMap.set(1231, _pg.default.types.getTypeParser(1231, 'text')); // numeric[]
  };

  const oldRefresh = conn.connectionManager.refreshTypeParser.bind(conn.connectionManager);

  conn.connectionManager.refreshTypeParser = (...a) => {
    oldRefresh(...a);
    override();
  };

  override();
  return conn;
};

exports.default = _default;
module.exports = exports.default;